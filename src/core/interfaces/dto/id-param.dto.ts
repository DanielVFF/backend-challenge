import { IsNotEmpty, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({
    description: 'ID do recurso',
    example: '123',
  })
  @IsString({ message: 'ID deve ser uma string' })
  @IsNotEmpty({ message: 'ID é obrigatório' })
  id: string;
}
