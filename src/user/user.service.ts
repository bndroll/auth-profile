import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { FileStorageService } from 'src/file/file-storage.service';
import { FileService } from '../file/file.service';
import { GenerateAliasService } from '../iam/authentication/generate-alias.service';


@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly fileStorageService: FileStorageService,
		private readonly fileService: FileService,
		private readonly generateUsernameService: GenerateAliasService
	) {
	}

	async findAll() {
		return await this.userRepository.find({
			select: {
				id: true,
				email: true,
				name: true,
				picture: {location: true}
			},
			relations: {
				picture: true
			}
		});
	}

	async findMe(id: number) {
		return await this.userRepository.findOne({
			where: {id},
			select: {
				id: true,
				name: true,
				alias: true,
				email: true,
				about: true,
				profileBackground: {location: true},
				picture: {location: true}
			},
			relations: {
				picture: true,
				profileBackground: true
			}
		});
	}

	async findOne(alias: string) {
		return await this.userRepository.findOne({
			where: {alias},
			select: {
				id: true,
				name: true,
				alias: true,
				email: true,
				about: true,
				profileBackground: {location: true},
				picture: {location: true}
			},
			relations: {
				picture: true,
				profileBackground: true
			}
		});
	}

	async update(id: number, dto: UpdateUserDto) {
		const isValid = this.generateUsernameService.testAlias(dto.alias);
		if (!isValid) {
			throw new BadRequestException('Alias must start with latinity character and contain only latinity letters and numbers');
		}

		const user = await this.userRepository.findOneBy({id});
		user.name = dto.name || user.name;
		user.alias = dto.alias || user.alias;
		user.about = dto.about || user.about;
		await this.userRepository.save(user);
	}

	async updatePhoto(id: number, file: Express.Multer.File) {
		const user = await this.userRepository.findOne({where: {id: id}});
		const storageResult = await this.fileStorageService.updatePhoto(file);
		if (user && user.picture) {
			await this.fileStorageService.deleteFile(user.picture.key);
			await this.fileService.remove(user.picture.id);
		}
		user.picture = await this.fileService.create(storageResult);
		await this.userRepository.save(user);
	}

	async updateBackground(id: number, file: Express.Multer.File) {
		const user = await this.userRepository.findOne({where: {id: id}});
		const storageResult = await this.fileStorageService.updateBackground(file);
		if (user && user.profileBackground) {
			await this.fileStorageService.deleteFile(user.profileBackground.key);
			await this.fileService.remove(user.profileBackground.id);
		}
		user.profileBackground = await this.fileService.create(storageResult);
		await this.userRepository.save(user);
	}
}
