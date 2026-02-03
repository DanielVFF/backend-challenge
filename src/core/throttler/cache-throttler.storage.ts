import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { CacheService } from '../cache/cache.service';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

interface ThrottlerRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

interface BlockHistory {
  timestamps: number[];
}

const permanentBlockKeyFn = (key: string) => `throttler:permanent:${key}`;
const historyKeyFn = (key: string) => `throttler:history:${key}`;
const temporaryBlockKeyFn = (key: string) => `throttler:block:${key}:expire`;
const recordKeyFn = (key: string) => `throttler:${key}`;

@Injectable()
export class CacheThrottlerStorage implements ThrottlerStorage {
  private readonly MAX_BLOCKS_PER_HOUR = 10;
  private readonly BLOCK_HISTORY_WINDOW = 60 * 60 * 1000;

  constructor(private readonly cacheService: CacheService) {}

  private async isPermanentlyBlocked(key: string): Promise<boolean> {
    const permanentBlockKey = permanentBlockKeyFn(key);
    const isPermanent = await this.cacheService.get<boolean>(permanentBlockKey);
    return !!isPermanent;
  }

  private async recordNewBlock(key: string): Promise<void> {
    const historyKey = historyKeyFn(key);
    const history = await this.cacheService.get<BlockHistory>(historyKey);

    const now = Date.now();
    const oneHourAgo = now - this.BLOCK_HISTORY_WINDOW;

    let timestamps: number[] = [];
    if (history && history.timestamps) {
      timestamps = history.timestamps.filter(
        (timestamp) => timestamp > oneHourAgo,
      );
    }

    timestamps.push(now);

    await this.cacheService.set(
      historyKey,
      { timestamps },
      {
        ttl: Math.ceil(this.BLOCK_HISTORY_WINDOW / 1000),
      },
    );

    if (timestamps.length >= this.MAX_BLOCKS_PER_HOUR) {
      await this.blockPermanently(key);
    }
  }

  private async blockPermanently(key: string): Promise<void> {
    const permanentBlockKey = permanentBlockKeyFn(key);
    await this.cacheService.set(permanentBlockKey, true);
  }

  private async checkPermanentBlock(
    key: string,
    limit: number,
  ): Promise<ThrottlerStorageRecord | null> {
    if (await this.isPermanentlyBlocked(key)) {
      return {
        totalHits: limit,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: Number.MAX_SAFE_INTEGER,
      };
    }
    return null;
  }

  private async checkTemporaryBlock(
    key: string,
    limit: number,
  ): Promise<ThrottlerStorageRecord | null> {
    const temporaryBlockKey = temporaryBlockKeyFn(key);
    const blockExpireTime =
      await this.cacheService.get<number>(temporaryBlockKey);

    if (!!blockExpireTime && Date.now() < blockExpireTime) {
      return {
        totalHits: limit,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: blockExpireTime - Date.now(),
      };
    }
    return null;
  }

  private async clearExpiredTemporaryBlock(key: string): Promise<void> {
    const temporaryBlockKey = temporaryBlockKeyFn(key);
    await this.cacheService.delete(temporaryBlockKey);
  }

  private async applyTemporaryBlock(
    key: string,
    blockDuration: number,
  ): Promise<void> {
    const temporaryBlockKey = temporaryBlockKeyFn(key);
    const now = Date.now();
    const blockExpire = now + blockDuration;
    const ttlInSeconds = Math.ceil(blockDuration / 1000);

    await this.cacheService.set(temporaryBlockKey, blockExpire, {
      ttl: ttlInSeconds,
    });
  }

  private async handleLimitExceeded(
    key: string,
    totalHits: number,
    blockDuration: number,
  ): Promise<ThrottlerStorageRecord> {
    await this.recordNewBlock(key);

    const isPermanentAfterRecord = await this.isPermanentlyBlocked(key);
    if (isPermanentAfterRecord) {
      return {
        totalHits,
        timeToExpire: 0,
        isBlocked: true,
        timeToBlockExpire: Number.MAX_SAFE_INTEGER,
      };
    }

    await this.applyTemporaryBlock(key, blockDuration);

    return {
      totalHits,
      timeToExpire: 0,
      isBlocked: true,
      timeToBlockExpire: blockDuration,
    };
  }

  private async updateRecord(
    key: string,
    totalHits: number,
    ttl: number,
  ): Promise<void> {
    const recordKey = recordKeyFn(key);
    const now = Date.now();
    const expireTime = now + ttl;
    const newRecord: ThrottlerRecord = {
      totalHits,
      timeToExpire: expireTime,
      isBlocked: false,
      timeToBlockExpire: 0,
    };

    const ttlInSeconds = Math.ceil(ttl / 1000);
    await this.cacheService.set(recordKey, newRecord, {
      ttl: ttlInSeconds,
    });
  }
  // Main function
  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): Promise<ThrottlerStorageRecord> {
    const permanentBlockResponse = await this.checkPermanentBlock(key, limit);
    if (permanentBlockResponse) {
      return permanentBlockResponse;
    }

    const temporaryBlockResponse = await this.checkTemporaryBlock(key, limit);
    if (temporaryBlockResponse) {
      return temporaryBlockResponse;
    }

    await this.clearExpiredTemporaryBlock(key);

    const currentRecord = await this.cacheService.get<ThrottlerRecord>(
      recordKeyFn(key),
    );

    const currentTotalHits = (currentRecord?.totalHits || 0) + 1;

    if (currentTotalHits > limit) {
      return await this.handleLimitExceeded(
        key,
        currentTotalHits,
        blockDuration,
      );
    }

    await this.updateRecord(key, currentTotalHits, ttl);

    return {
      totalHits: currentTotalHits,
      timeToExpire: ttl,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}
