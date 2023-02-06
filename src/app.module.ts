import { Module } from '@nestjs/common';
import { IamModule } from './iam/iam.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';


@Module({
	imports: [
		ConfigModule.forRoot(),
		UserModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: process.env.HOST,
			port: parseInt(process.env.POSTGRES_PORT ?? '5432'),
			username: process.env.POSTGRES_USERNAME,
			password: process.env.POSTGRES_PASSWORD,
			database: process.env.POSTGRES_DATABASE,
			autoLoadEntities: true,
			synchronize: true
		}),
		RedisModule.forRoot({
			config: {
				host: process.env.REDIS_HOST,
				port: parseInt(process.env.REDIS_PORT ?? '6379')
			}
		}),
		IamModule,
		FileModule
	]
})
export class AppModule {
}
