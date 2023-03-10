import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication/authentication.controller';
import { AuthenticationService } from './authentication/authentication.service';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { HashingService } from './hashing/hashing.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { GenerateAliasService } from './authentication/generate-alias.service';


@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		JwtModule.registerAsync(jwtConfig.asProvider()),
		ConfigModule.forFeature(jwtConfig)
	],
	providers: [
		{provide: HashingService, useClass: BcryptService},
		{provide: APP_GUARD, useClass: AuthenticationGuard},
		AccessTokenGuard,
		RefreshTokenIdsStorage,
		AuthenticationService,
		GenerateAliasService
	],
	controllers: [AuthenticationController],
	exports: [GenerateAliasService]
})
export class IamModule {
}
