import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GenerateAliasDto } from './dto/generate-alias.dto';
import axios from 'axios';


@Injectable()
export class GenerateAliasService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService
	) {
	}

	async generateAlias({name, email}: GenerateAliasDto) {

	}

	async translateName(name: string) {
		return await axios.post('https://translate.api.cloud.yandex.net/translate/v2/translate', {
			targetLanguageCode: 'en',
			texts: [name],
			folderId: this.configService.get('FOLDER_ID')
		}, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.configService.get('IAM_TOKEN')}`
			}
		})
			.then(res => res.data)
			.then(res => res.translations[0])
			.then(res => res.text);
	}

	testAlias(alias: string): boolean {
		const regExp = /^[A-Za-z][A-Za-z\d]{0,24}/gi;
		return regExp.test(alias);
	}
}
