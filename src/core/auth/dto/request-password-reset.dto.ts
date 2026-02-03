import { IsEmail } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Email do usuário que deseja resetar a senha',
    example: 'danielvitorpnn@gmail.com',
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;
}
