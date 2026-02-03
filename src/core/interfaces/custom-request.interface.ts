import { Request } from 'express';
import { UserDto } from 'src/modules/user/dto/user.dto';

export interface CustomRequestI extends Request {
  user: UserDto;
}
