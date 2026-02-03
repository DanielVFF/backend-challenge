import { Transform, Type } from '@nestjs/class-transformer';
import { IsOptional, IsPositive, Min } from '@nestjs/class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Número máximo de itens por página',
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsPositive()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Número da página (começando do 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;
}
