import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/auth-create-user-dto';
import { UpdateCreateUserDtoToSignInDto } from './dto/auth-sign-in-dto';

export const ENDPOINTS = {
  LOGIN: '/login',
  REGISTRATION: '/registration',
  AUTH: 'auth',
  API_TAG: 'auth-controller',
};

export const EXCEPTION = {
  INCORRECT_LOGIN_OR_PASSWORD: 'Логин или пароль введен не правильно',
  USER_EXIST: 'Такой пользователь уже существует',
};

export const API_EXAMPLES_REGISTRATION = {
  REQUEST_EXAMPLE: {
    type: CreateUserDto,
    description: 'User Registration',
    examples: {
      example1: {
        value: {
          login: 'johndoe',
          password: 'yourSecurePassword',
          email: 'johndoe@example.com',
          role: 'User',
        },
      },
    },
  },
  RESPONSE_EXAMPLE: {
    status: HttpStatus.CREATED,
    schema: {
      example: {
        accessToken: 'someToken',
      },
    },
    description: 'User registered successfully',
  },
};

export const API_EXAMPLES_LOGIN = {
  REQUEST_EXAMPLE: {
    type: UpdateCreateUserDtoToSignInDto,
    description: 'User signIn',
    examples: {
      example1: {
        value: {
          login: 'johndoe',
          password: 'yourSecurePassword',
        },
      },
    },
  },
  RESPONSE_EXAMPLE: {
    status: HttpStatus.OK,
    schema: {
      example: {
        accessToken: 'someToken',
      },
    },
    description: 'User signIn successfully',
  },
};

export const API_EXAMPLES_PROFILE = {
  RESPONSE_EXAMPLE: {
    status: HttpStatus.OK,
    schema: {
      example: {
        profile: 'someProfile',
      },
    },
    description: 'User signIn successfully',
  },
};
