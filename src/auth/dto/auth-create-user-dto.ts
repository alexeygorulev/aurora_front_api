import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
    example: 'b10f1c8e-551d-4c77-83b0-5d7d6a7b23ae',
  })
  user_id?: string;

  @IsNotEmpty()
  @Length(0, 30)
  @IsString()
  @ApiProperty({ example: 'johndoe', description: 'User login' })
  login: string;

  @IsNotEmpty()
  @Length(0, 20)
  @IsString()
  @ApiProperty({ example: 'yourSecurePassword', description: 'User password' })
  password: string;

  @IsNotEmpty()
  @Length(0, 30)
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com', description: 'User email' })
  email: string;

  @IsEnum({ user: 'User', admin: 'Admin', moderator: 'Moderator' })
  @ApiProperty({
    example: 'User',
    enum: ['User', 'Admin', 'Moderator'],
    description: 'User role',
  })
  role?: $Enums.Role;
}
