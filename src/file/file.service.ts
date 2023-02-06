import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { CreateFileDto } from './dto/create-file.dto';


@Injectable()
export class FileService {
  constructor(
      @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) {
  }

  async create({Location, Key, Bucket}: CreateFileDto) {
    const file = new File();
    file.location = Location;
    file.key = Key;
    file.bucket = Bucket;
    return await this.fileRepository.save(file);
  }

  async remove(id: number) {
    const file = await this.fileRepository.findOneBy({id});
    if (file) {
      await this.fileRepository.remove(file);
    }
  }
}
