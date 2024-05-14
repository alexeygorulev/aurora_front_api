import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
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
import { UpdateCreateUserDtoToForgetPassword } from './dto/auth-forget-password-dto';
import { UpdateCreateUserDtoToResetPassword } from './dto/auth-reset-password-dto';

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
  @Get(ENDPOINTS.REDIRECT_CONFIRM_EMAIL)
  async checkEmail(@User('email') email: string, @Res() res): Promise<void> {
    const { skip } = await this.authService.checkConfirmEmail(email);
    const defaultInstance = this.configService.get<string>('DEFAULT_INSTANCE_FRONT');
    if (!skip || !res.cookie['aurora_token']) {
      const { access_token } = await this.authService.acceptEmail(email);
      res.cookie('aurora_token', access_token, { httpOnly: true, secure: true });
    }
    res.redirect(`${defaultInstance}?checkEmail=true`);
  }

  @Post(ENDPOINTS.PREPARE_RESET_PASSWORD)
  async forgetPassword(@Body() data: UpdateCreateUserDtoToForgetPassword): Promise<void> {
    return this.authService.prepareUserByForgetPassword(data);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ENDPOINTS.RESET_PASSWORD)
  async resetPassword(
    @User('email') email: string,
    @Query('token') token: string,
    @Body() data: UpdateCreateUserDtoToResetPassword,
  ): Promise<any> {
    return this.authService.resetPassword(email, token, data);
  }

  @Get(ENDPOINTS.YANDEX)
  @UseGuards(AuthGuard('yandex'))
  yandexLogin() {}

  @Get(ENDPOINTS.YANDEX_CALLBACK)
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
    res.cookie('aurora_token', token.access_token, { httpOnly: true, secure: true });
    return res.redirect(process.env.DEFAULT_INSTANCE_FRONT);
  }
}
