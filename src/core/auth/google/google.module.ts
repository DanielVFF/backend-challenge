import { forwardRef, Module } from '@nestjs/common';
import { GoogleController } from './google.controller';
import { GoogleService } from './google.service';
import { UserModule } from 'src/modules/user/user.module';
import { AuthModule } from '../auth.module';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => AuthModule)],
  controllers: [GoogleController],
  providers: [GoogleService],
})
export class GoogleModule {}
