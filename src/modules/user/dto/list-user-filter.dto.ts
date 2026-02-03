import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from '@nestjs/class-validator';

export class ListUserFilterDto {
  @ApiPropertyOptional({
    description: 'Nome do usuário',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Documento do usuário',
  })
  @IsOptional()
  @IsString()
  document?: string;
}
