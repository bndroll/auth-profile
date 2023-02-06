import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth } from '../iam/decorators/auth.decorator';
import { AuthType } from '../iam/enums/auth-type.enum';
import axios from 'axios';


@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {
	}

	@Auth(AuthType.None)
	@Post()
	async test() {
		const res = await axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', {
			targetLanguageCode: 'en',
			texts: ['владислав'],
			folderId: process.env.FOLDER_ID
		}, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.IAM_TOKEN}`
			}
		}).then(r => console.log(r.data.translations[0].text))
		// return this.userService.findAll();
	}

	@Auth(AuthType.None)
	@Get()
	async findAll() {
		return this.userService.findAll();
	}

	@Get('find/me')
	async findMe(@ActiveUser('sub') id: number) {
		return this.userService.findMe(id);
	}

	@Get(':alias')
	async findOne(@Param('alias') alias: string) {
		return this.userService.findOne(alias);
	}

	@Patch()
	async update(@ActiveUser('sub') id: number, @Body() updateUserDto: UpdateUserDto) {
		return this.userService.update(id, updateUserDto);
	}

	@Patch('upload/photo')
	@UseInterceptors(FileInterceptor('file'))
	async updatePhoto(@UploadedFile() file: Express.Multer.File, @ActiveUser('sub') id: number) {
		return this.userService.updatePhoto(id, file);
	}

	@Patch('upload/background')
	@UseInterceptors(FileInterceptor('file'))
	async updateBackground(@UploadedFile() file: Express.Multer.File, @ActiveUser('sub') id: number) {
		return this.userService.updateBackground(id, file);
	}
}
