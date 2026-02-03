import { IsEmail, IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'danielvitorpnn@gmail.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @ApiProperty({
    description: 'Código de confirmação recebido por email',
    example: '123456',
  })
  @IsString({ message: 'O código deve ser uma string' })
  @Length(6, 6, { message: 'O código deve ter exatamente 6 dígitos' })
  code: string;
}
