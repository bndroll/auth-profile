import { Module } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { ConfigModule } from '@nestjs/config';
import { FileService } from './file.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';


@Module({
	imports: [
		TypeOrmModule.forFeature([File]),
		ConfigModule
	],
	providers: [FileStorageService, FileService],
	exports: [FileStorageService, FileService]
})
export class FileModule {
}
