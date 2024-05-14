import { HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/auth-create-user-dto';
import { UpdateCreateUserDtoToSignInDto } from './dto/auth-sign-in-dto';

export const ENDPOINTS = {
  LOGIN: '/login',
  REGISTRATION: '/registration',
  AUTH: '/auth',
  API_TAG: '/auth-controller',
  REDIRECT_CONFIRM_EMAIL: '/redirect-confirm-email',
  PREPARE_RESET_PASSWORD: '/prepare-reset-password',
  RESET_PASSWORD: '/reset-password',
  YANDEX: '/yandex',
  YANDEX_CALLBACK: '/yandex/callback',
};

export const EXCEPTION = {
  INCORRECT_LOGIN_OR_PASSWORD: 'Логин или пароль введен не правильно',
  USER_EXIST: 'Такой пользователь уже существует',
  USER_EXIST_EMAIL: 'Пользователь с таким email уже существует',
  NO_EXIST_USER: 'Такой email не найден',
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка',
  NO_EQUAL_TOKEN: 'Неверная ссылка для сброса пароля. Убедитесь, что ссылка не была изменена, и повторите попытку',
  EQUAL_PASSWORD: 'Пароль совпадает с существующим',
};

export const API_EXAMPLES_REGISTRATION = {
  REQUEST_EXAMPLE: {
    type: CreateUserDto,
    description: 'User Registration',
    examples: {
      example1: {
        value: {
          login: 'kek',
          password: 'kek',
          first_name: 'kokzxc',
          last_name: 'asdaxzc',
          email: 'kek@example.com',
          consent: true,
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
