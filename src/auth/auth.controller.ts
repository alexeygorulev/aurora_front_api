import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/auth-create-user-dto';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS, API_EXAMPLES_REGISTRATION, API_EXAMPLES_LOGIN, API_EXAMPLES_PROFILE } from './auth-constants';
import { UpdateCreateUserDtoToSignInDto } from './dto/auth-sign-in-dto';
import { Roles } from './roles/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles/roles.guadrd';
import { AuthGuard } from '@nestjs/passport';
import { User } from './auth-user-decorator';

@ApiTags(ENDPOINTS.API_TAG)
@Controller(ENDPOINTS.AUTH)
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody(API_EXAMPLES_LOGIN.REQUEST_EXAMPLE)
  @ApiResponse(API_EXAMPLES_LOGIN.RESPONSE_EXAMPLE)
  @Post(ENDPOINTS.LOGIN)
  signIn(@Body() signInDto: UpdateCreateUserDtoToSignInDto): Promise<{ access_token: string }> {
    return this.authService.signIn(signInDto.login, signInDto.password);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post(ENDPOINTS.REGISTRATION)
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
  getProfile(@User('login') login: string): any {
    return this.authService.getUserProfile(login);
  }
}
