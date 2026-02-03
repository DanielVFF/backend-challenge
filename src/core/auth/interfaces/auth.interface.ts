import { User } from '@prisma/client';

export interface LoginResponseInterface {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface CodeSentResponseInterface {
  message: string;
  email: string;
  verificationHash: string;
}
