import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FileModule } from '../file/file.module';
import { IamModule } from '../iam/iam.module';


@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		FileModule,
		IamModule
	],
	controllers: [UserController],
	providers: [UserService]
})
export class UserModule {
}
