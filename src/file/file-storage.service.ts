import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { BACKGROUND_FOLDER, PHOTO_FOLDER } from './file-storage.constants';
import EasyYandexS3 from 'easy-yandex-s3';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';


@Injectable()
export class FileStorageService {
	private readonly s3: EasyYandexS3;

	constructor(
		private readonly configService: ConfigService
	) {
		this.s3 = new EasyYandexS3({
			auth: {
				accessKeyId: this.configService.get('ACCESS_KEY_ID'),
				secretAccessKey: this.configService.get('SECRET_ACCESS_KEY')
			},
			Bucket: this.configService.get('S3_BUCKET_NAME')
		});
	}

	async updatePhoto(file: Express.Multer.File) {
		return await this.uploadS3(file, PHOTO_FOLDER);
	}

	async updateBackground(file: Express.Multer.File) {
		return await this.uploadS3(file, BACKGROUND_FOLDER);
	}

	async deleteFile(key: string) {
		return await this.s3.Remove(`${key}`);
	}

	private async uploadS3(file: Express.Multer.File, folderName: string) {
		return await this.s3.Upload({
				buffer: file.buffer,
				name: randomUUID()
			},
			`/${folderName}/`
		) as ManagedUpload.SendData;
	}
}
