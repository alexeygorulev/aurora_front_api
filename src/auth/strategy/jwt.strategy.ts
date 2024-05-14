import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

const fromUrlQueryParameter: JwtFromRequestFunction = (request: Request) => {
  return request?.query?.token as string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['aurora_token'],
        fromUrlQueryParameter,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECRET_KEY'),
    });
  }

  async validate(payload: any): Promise<any> {
    const user = await this.prisma.users.findUnique({
      where: { login: payload?.login },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
