import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';


export class SignUpDto {
	@IsString()
	@MinLength(1)
	@MaxLength(20)
	name: string;

	@IsEmail()
	email: string;

	@IsString()
	@MinLength(6)
	@MaxLength(20)
	password: string;
}
