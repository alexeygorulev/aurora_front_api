import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/auth-create-user-dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS, API_EXAMPLES_REGISTRATION, API_EXAMPLES_LOGIN, API_EXAMPLES_PROFILE } from './auth-constants';
import { UpdateCreateUserDtoToSignInDto } from './dto/auth-sign-in-dto';
import { Roles } from './roles/roles.decorator';
import { $Enums, Role } from '@prisma/client';
import { RolesGuard } from './roles/roles.guadrd';
import { AuthGuard } from '@nestjs/passport';
import { User } from './auth-user-decorator';
import { randomBytes } from 'crypto';
import { CookieInterceptor } from './cookie/cookie.interseptor';
import { ConfigService } from '@nestjs/config';

@ApiTags(ENDPOINTS.API_TAG)
@Controller(ENDPOINTS.AUTH)
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseInterceptors(CookieInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiBody(API_EXAMPLES_LOGIN.REQUEST_EXAMPLE)
  @ApiResponse(API_EXAMPLES_LOGIN.RESPONSE_EXAMPLE)
  @Post(ENDPOINTS.LOGIN)
  signIn(@Body() signInDto: UpdateCreateUserDtoToSignInDto): Promise<{ access_token: string }> {
    return this.authService.signIn(signInDto.login, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(ENDPOINTS.REGISTRATION)
  @UseInterceptors(CookieInterceptor)
  @ApiBody(API_EXAMPLES_REGISTRATION.REQUEST_EXAMPLE)
  @ApiResponse(API_EXAMPLES_REGISTRATION.RESPONSE_EXAMPLE)
  signUp(@Body() createUserDto: CreateUserDto): Promise<{ access_token: string }> {
    return this.authService.signUp(createUserDto);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse(API_EXAMPLES_PROFILE.RESPONSE_EXAMPLE)
  @Roles(Role.Admin, Role.Moderator, Role.User)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('profile')
  getProfile(@User('login') login: string): Promise<{ access_token: string }> {
    return this.authService.getUserProfile(login);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/email')
  async checkEmail(@User('email') email: string, @Res() res): Promise<void> {
    await this.authService.acceptEmail(email);
    const defaultInstance = this.configService.get<string>('DEFAULT_INSTANCE_FRONT');
    res.redirect(defaultInstance);
  }

  @Get('yandex')
  @UseGuards(AuthGuard('yandex'))
  yandexLogin() {}

  @Get('yandex/callback')
  @UseGuards(AuthGuard('yandex'))
  async yandexCallback(@Req() req, @Res() res) {
    const { login, email, first_name, last_name } = req.user;
    const prepareData = {
      login,
      email,
      first_name,
      last_name,
      password: randomBytes(16).toString('hex'),
      consent: true,
      confirm_mail: true,
      role: $Enums.Role.User,
    };

    const token = await this.authService.signUpOAuth(prepareData);
    res.cookie('token', token.access_token, { httpOnly: true, secure: true });
    return res.redirect(process.env.DEFAULT_INSTANCE_FRONT);
  }
}
