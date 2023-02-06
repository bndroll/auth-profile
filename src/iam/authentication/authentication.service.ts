import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';


@Injectable()
export class AuthenticationService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly hashingService: HashingService,
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
		private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage
	) {
	}

	async signUp(signUpDto: SignUpDto) {
		try {
			const user = new User();
			user.email = signUpDto.email;
			user.name = signUpDto.name;
			user.password = await this.hashingService.hash(signUpDto.password);
			// TODO - генерация имени
			await this.userRepository.save(user);
		} catch (err) {
			const pgUniqueViolationErrorCode = '23505';
			if (err.code === pgUniqueViolationErrorCode) {
				throw new ConflictException();
			}
			throw err;
		}
	}

	async signIn(signInDto: SignInDto) {
		const user = await this.userRepository.findOneBy({email: signInDto.email});
		if (!user) {
			throw new UnauthorizedException('User does not exist');
		}

		const isEqual = await this.hashingService.compare(signInDto.password, user.password);
		if (!isEqual) {
			throw new UnauthorizedException('Password doest not match');
		}

		return await this.generateTokens(user);
	}

	async signOut(id: number) {
		await this.refreshTokenIdsStorage.invalidate(id);
	}

	async refreshToken(refreshTokenDto: RefreshTokenDto) {
		try {
			const {
				sub,
				refreshTokenId
			} = await this.jwtService.verifyAsync<Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }>(
				refreshTokenDto.refreshToken,
				{
					audience: this.jwtConfiguration.audience,
					issuer: this.jwtConfiguration.issuer,
					secret: this.jwtConfiguration.secret
				});

			const user = await this.userRepository.findOneByOrFail({id: sub});
			const isValid = await this.refreshTokenIdsStorage.validate(user.id, refreshTokenId);
			if (isValid) {
				await this.refreshTokenIdsStorage.invalidate(user.id);
			} else {
				throw new Error('Refresh token is invalid');
			}

			return await this.generateTokens(user);
		} catch (err) {
			if (err instanceof InvalidatedRefreshTokenError) {
				throw new UnauthorizedException('Access denied');
			}

			throw new UnauthorizedException();
		}
	}

	async generateTokens(user: User) {
		const refreshTokenId = randomUUID();
		const [accessToken, refreshToken] = await Promise.all([
			this.signToken<Partial<ActiveUserData>>(
				user.id, this.jwtConfiguration.accessTokenTtl, {email: user.email}
			),
			this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {refreshTokenId})
		]);

		await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

		return {accessToken, refreshToken};
	}

	private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
		return await this.jwtService.signAsync(
			{
				sub: userId,
				...payload
			}, {
				audience: this.jwtConfiguration.audience,
				issuer: this.jwtConfiguration.issuer,
				secret: this.jwtConfiguration.secret,
				expiresIn: expiresIn
			});
	}
}
