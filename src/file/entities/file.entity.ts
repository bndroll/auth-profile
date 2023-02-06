import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class File {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	location: string;

	@Column()
	bucket: string;

	@Column()
	key: string;
}
