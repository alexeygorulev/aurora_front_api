import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EXCEPTION } from './auth-constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async signIn(login: string, pass: string): Promise<{ access_token: string }> {
    const user: Prisma.userCreateInput | null = await this.prisma.user.findUnique({
      where: { login: login },
    });

    if (!user) {
      throw new HttpException(EXCEPTION.INCORRECT_LOGIN_OR_PASSWORD, HttpStatus.FORBIDDEN);
    }

    const isMatch = await bcrypt.compare(pass, user?.password);

    if (!isMatch) {
      throw new HttpException(EXCEPTION.INCORRECT_LOGIN_OR_PASSWORD, HttpStatus.FORBIDDEN);
    }

    return this.jwtPayload(user);
  }

  async signUp(data: Prisma.userCreateInput): Promise<{ access_token: string }> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const isExistUser = await this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (isExistUser) {
      throw new HttpException(EXCEPTION.USER_EXIST, HttpStatus.FORBIDDEN);
    }

    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return this.jwtPayload(newUser);
  }

  async getUserProfile(user: Prisma.userCreateInput): Promise<any> {
    const existUser = await this.prisma.user.findUnique({
      where: {
        email: user.login,
      },
    });

    return existUser;
  }

  async jwtPayload(payload: Prisma.userCreateInput): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({
        id: payload.user_id,
        login: payload.login,
        email: payload.email,
        role: payload.role,
      }),
    };
  }
}
