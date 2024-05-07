import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { YandexStrategy } from './strategy/yandex.strategy';
import { CookieInterceptor } from './cookie/cookie.interseptor';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions: { expiresIn: '24h' },
    }),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'yandex' }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, YandexStrategy, CookieInterceptor],
  exports: [JwtStrategy],
})
export class AuthModule {}
