import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { CacheService } from './cache.service';
import {
  ApiCacheControllerDefaults,
  ApiGetCacheInfoResponse,
  ApiSwitchToRedisResponse,
  ApiSwitchToMachineResponse,
  ApiClearCacheResponse,
} from './cache.swagger';

@ApiCacheControllerDefaults()
@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('info')
  @ApiGetCacheInfoResponse()
  getCacheInfo() {
    return {
      ...this.cacheService.getCacheInfo(),
      message: 'messages.cache_info_retrieved',
    };
  }

  @Post('switch/redis')
  @ApiSwitchToRedisResponse()
  @HttpCode(HttpStatus.OK)
  async switchToRedis() {
    const success = await this.cacheService.switchToRedis();
    return {
      success,
      message: success
        ? 'messages.cache_switched_redis'
        : 'messages.cache_switched_redis_failed',
      cacheType: this.cacheService.getActiveCacheType(),
    };
  }

  @Post('switch/machine')
  @ApiSwitchToMachineResponse()
  @HttpCode(HttpStatus.OK)
  async switchToMachine() {
    await this.cacheService.switchToMachine();
    return {
      success: true,
      message: 'messages.cache_switched_machine',
      cacheType: this.cacheService.getActiveCacheType(),
    };
  }

  @Post('clear')
  @ApiClearCacheResponse()
  @HttpCode(HttpStatus.OK)
  async clearCache() {
    await this.cacheService.clear();
    return {
      success: true,
      message: 'messages.cache_cleared',
      cacheType: this.cacheService.getActiveCacheType(),
    };
  }
}
