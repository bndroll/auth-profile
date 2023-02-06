import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GenerateAliasDto } from './dto/generate-alias.dto';
import axios from 'axios';
import { combineMapper, CombineWordsTypes } from './types/combine-words.type';


@Injectable()
export class GenerateAliasService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService
	) {
	}

	async generateAlias({name, email}: GenerateAliasDto) {
		return (await this.generateAliases({name, email}))[0];
	}

	async generateAliases({name, email}: GenerateAliasDto) {
		const userName = (await this.translateName(name)).toLowerCase();
		const emailName = this.getMailUsername(email).toLowerCase();
		const arr = this.generateAliasesBatch({name: userName, email: emailName});
		return await this.findUniqueAlias(arr);
	}

	async testAlias(alias: string): Promise<boolean> {
		const user = await this.userRepository.findOneBy({alias});
		const regExp = /^[A-Za-z][A-Za-z\d]{0,24}/gi;

		return !user && regExp.test(alias);
	}

	private async findUniqueAlias(aliases: string[]) {
		return await this.userRepository.find({
			select: {
				alias: true
			},
			where: [...aliases.map(item => ({alias: item}))]
		})
			.then(res => res.map(u => u.alias))
			.then(res => {
				const s = new Set(res);
				return aliases.filter(item => !s.has(item));
			});
	}

	private generateAliasesBatch({name: userName, email: emailName}: GenerateAliasDto) {
		const arr = [];
		arr.push(this.combineWords(userName, emailName, 'f'));
		arr.push(this.combineWords(userName, emailName, 'l'));
		arr.push(this.combineWords(userName, emailName, 'fl'));
		arr.push(this.combineWords(userName, emailName, 'lf'));
		arr.push(this.combineWords(userName, emailName, 'slf'));
		arr.push(this.combineWords(userName, emailName, 'sfl'));
		arr.push(this.combineWords(userName, emailName, 'lsf'));
		arr.push(this.combineWords(userName, emailName, 'fsl'));
		return arr;
	}

	private getMailUsername(email: string) {
		return email.split('@')[0];
	}

	private async translateName(name: string) {
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
			.then(res => res.text as string);
	}

	private combineWords(w1: string, w2: string, type: CombineWordsTypes): string {
		return combineMapper.get(type)(w1, w2);
	}
}
