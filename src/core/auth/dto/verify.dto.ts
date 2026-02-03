import { IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyDto {
  @ApiProperty({
    description: 'Hash de verificação retornado no login',
    example: 'abc123def456...',
  })
  @IsString({ message: 'O hash deve ser uma string' })
  verificationHash: string;

  @ApiProperty({
    description: 'Código de confirmação recebido por email',
    example: '123456',
  })
  @IsString({ message: 'O código deve ser uma string' })
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos' })
  code: string;
}
