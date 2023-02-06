import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';


export class InvalidatedRefreshTokenError extends Error {
}

@Injectable()
export class RefreshTokenIdsStorage {
	constructor(
		@InjectRedis() private readonly redis: Redis
	) {
	}

	async insert(userId: number, tokenId: string): Promise<void> {
		await this.redis.set(this.getKey(userId), tokenId);
	}

	async validate(userId: number, tokenId: string): Promise<boolean> {
		const storageId = await this.redis.get(this.getKey(userId));
		if (storageId !== tokenId) {
			throw new InvalidatedRefreshTokenError();
		}
		return storageId === tokenId;
	}

	async invalidate(userId: number): Promise<void> {
		await this.redis.del(this.getKey(userId));
	}

	private getKey(userId: number): string {
		return `user-${userId}`;
	}
}
