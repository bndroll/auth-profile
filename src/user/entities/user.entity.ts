import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '../../file/entities/file.entity';


@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@Column({unique: true, nullable: true})
	alias: string;

	@Column({unique: true})
	email: string;

	@Column()
	password: string;

	@Column({nullable: true})
	about: string;

	@OneToOne(() => File, {onDelete: 'SET NULL'})
	@JoinColumn()
	picture: File;

	@OneToOne(() => File, {onDelete: 'SET NULL'})
	@JoinColumn()
	profileBackground: File;
}
