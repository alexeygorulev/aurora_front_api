import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { prismaMock } from 'src/prisma/singleton';
import { $Enums } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EXCEPTION } from '../auth-constants';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('signIn', () => {
    it('should return a valid JWT when credentials are correct', async () => {
      const login = 'testuser';
      const mockUser = {
        user_id: '1',
        login,
        password: '$2b$10$examplehash',
        email: 'test@example.com',
        consent: true,
        role: 'User' as $Enums.Role,
      };

      prismaMock.users.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt_token');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.signIn('testuser', 'password');
      expect(result.access_token).toEqual('jwt_token');
    });

    it('should throw an error if user is not found', async () => {
      const login = 'wronguser';
      const pass = 'password';
      prismaMock.users.findUnique.mockResolvedValue(null);

      await expect(service.signIn(login, pass)).rejects.toThrow(
        new HttpException(EXCEPTION.INCORRECT_LOGIN_OR_PASSWORD, HttpStatus.FORBIDDEN),
      );
    });
  });

  describe('signUp', () => {
    it('should throw an error if user is  found', async () => {
      const login = 'testuser';
      const mockUser = {
        user_id: '1',
        login,
        consent: true,
        password: '$2b$10$examplehash',
        email: 'test@example.com',
        role: 'User' as $Enums.Role,
      };

      prismaMock.users.findFirst.mockResolvedValue(mockUser);

      await expect(service.signUp(mockUser)).rejects.toThrow(
        new HttpException(EXCEPTION.USER_EXIST, HttpStatus.FORBIDDEN),
      );
    });

    it('shoul return jwt signUp', async () => {
      const mockUser = {
        user_id: '1',
        login: 'testuser',
        password: '$2b$10$examplehash',
        email: 'test@example.com',
        consent: true,
        role: 'User' as $Enums.Role,
      };

      prismaMock.users.findFirst.mockResolvedValue(null);
      prismaMock.users.create.mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('jwt_token');

      await expect(service.signUp(mockUser)).resolves.toEqual({
        access_token: 'jwt_token',
      });
    });
  });
});
