import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresh',
    example: 'refresh_token',
  })
  @IsString()
  refresh_token: string;
}
