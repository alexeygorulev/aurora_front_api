import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ENDPOINTS, EXCEPTION } from './auth-constants';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { UpdateCreateUserDtoToForgetPassword } from './dto/auth-forget-password-dto';
import { UpdateCreateUserDtoToResetPassword } from './dto/auth-reset-password-dto';

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
    const verificationUrl = `${defaultInstance}/aurora-front-api/auth/${ENDPOINTS.REDIRECT_CONFIRM_EMAIL}?token=${token.access_token}`;

    await this.mailService.sendVerificationEmail(data.email, data.login, verificationUrl);
    return token;
  }

  async resetPassword(
    email: string,
    temporaryToken: string,
    data: UpdateCreateUserDtoToResetPassword,
  ): Promise<object> {
    const user: Prisma.usersCreateInput | null = await this.prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!user) throw new HttpException(EXCEPTION.NO_EXIST_USER, HttpStatus.FORBIDDEN);
    if (user.temporary_token != temporaryToken) throw new HttpException(EXCEPTION.NO_EQUAL_TOKEN, HttpStatus.FORBIDDEN);

    const isMatch = await bcrypt.compare(data.password, user?.password);
    if (isMatch) throw new HttpException(EXCEPTION.EQUAL_PASSWORD, HttpStatus.FORBIDDEN);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await this.prisma.users.update({
      where: {
        email,
      },
      data: { password: hashedPassword, temporary_token: '' },
    });
    return {};
  }

  async prepareUserByForgetPassword(data: UpdateCreateUserDtoToForgetPassword) {
    const user: Prisma.usersCreateInput | null = await this.prisma.users.findFirst({
      where: {
        email: data.email,
      },
    });

    if (!user) throw new HttpException(EXCEPTION.NO_EXIST_USER, HttpStatus.NOT_FOUND);

    const { access_token } = await this.jwtTemporaryToken(user!.email, user!.login);

    await this.prisma.users.update({
      where: { email: data.email },
      data: {
        temporary_token: access_token,
      },
    });

    const defaultInstance = this.configService.get<string>('DEFAULT_INSTANCE_FRONT');
    const verificationUrl = `${defaultInstance}/authentication/${ENDPOINTS.RESET_PASSWORD}?token=${access_token}`;

    await this.mailService.sendVerificationForgetPassword(user!.email, user!.login, verificationUrl);
  }

  async checkConfirmEmail(email: string): Promise<{ skip: boolean }> {
    const existUser = await this.prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (!existUser) throw new HttpException(EXCEPTION.UNKNOWN_ERROR, HttpStatus.FORBIDDEN);
    return { skip: existUser.confirm_mail };
  }

  async acceptEmail(email: string): Promise<{ access_token: string }> {
    const user = await this.prisma.users.update({
      where: {
        email,
      },
      data: {
        confirm_mail: true,
      },
    });

    return this.jwtPayload(user);
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

  async jwtTemporaryToken(email: string, login: string): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({ email, login }),
    };
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
