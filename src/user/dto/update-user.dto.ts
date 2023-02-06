import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';


export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(20)
	name: string;

	@IsOptional()
	@IsString()
	@MaxLength(25)
	alias: string;

	@IsOptional()
	@IsString()
	@MaxLength(255)
	about: string;
}