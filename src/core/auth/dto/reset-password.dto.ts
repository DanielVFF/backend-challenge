import { IsString, Length, MinLength } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Hash de verificação retornado no request password reset',
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

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenhaSegura123#',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
