import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    super({
      authorizationURL: 'https://oauth.yandex.ru/authorize',
      tokenURL: 'https://oauth.yandex.ru/token',
      clientID: configService.get<string>('YANDEX_CLIENT_ID'),
      clientSecret: configService.get<string>('YANDEX_CLIENT_SECRET'),
      callbackURL: `${configService.get<string>('DEFAULT_INSTANCE_FRONT_API')}/aurora-front-api/auth/yandex/callback`,
      scope: ['login:email', 'login:info'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    try {
      const response = await axios.get('https://login.yandex.ru/info', {
        headers: {
          Authorization: `OAuth ${accessToken}`,
        },
      });

      const user = {
        email: response.data.default_email,
        login: response.data.login,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        accessToken,
      };

      done(null, user);
    } catch (error) {
      console.error('Error fetching Yandex user profile:', error);
      done(error);
    }
  }
}
