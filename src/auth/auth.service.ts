import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { $Enums, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EXCEPTION } from './auth-constants';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

interface UserAcceptData {
  login: string;
  first_name: string;
  last_name: string;
  role: $Enums.Role;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async signIn(login: string, pass: string): Promise<{ access_token: string }> {
    const user: Prisma.usersCreateInput | null = await this.prisma.users.findUnique({
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

  async signUp(data: Prisma.usersCreateInput): Promise<{ access_token: string }> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const isExistUser = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (isExistUser) {
      throw new HttpException(EXCEPTION.USER_EXIST_EMAIL, HttpStatus.FORBIDDEN);
    }

    const newUser = await this.prisma.users.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
    const token = await this.jwtPayload(newUser);
    const defaultInstance = this.configService.get<string>('DEFAULT_INSTANCE_FRONT_API');
    const verificationUrl = `${defaultInstance}/aurora-front-api/auth/email?token=${token.access_token}`;

    await this.mailService.sendVerificationEmail(data.email, data.login, verificationUrl);
    return token;
  }

  async acceptEmail(email: string): Promise<UserAcceptData> {
    return await this.prisma.users.update({
      where: {
        email,
      },
      data: {
        confirm_mail: true,
      },
      select: {
        login: true,
        first_name: true,
        last_name: true,
        role: true,
      },
    });
  }

  async signUpOAuth(data: Prisma.usersCreateInput): Promise<{ access_token: string }> {
    const isExistUser = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!isExistUser) await this.prisma.users.create({ data });
    return this.jwtPayload(data);
  }

  async getUserProfile(login: string): Promise<any> {
    const existUser = await this.prisma.users.findUnique({
      where: {
        login: login,
      },
    });

    return existUser;
  }

  async jwtPayload(payload: Prisma.usersCreateInput): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({
        id: payload.user_id,
        login: payload.login,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        role: payload.role,
        consent: payload.consent,
      }),
    };
  }
}
