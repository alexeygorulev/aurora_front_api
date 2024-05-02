import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './auth-create-user-dto';

export class UpdateCreateUserDtoToSignInDto extends PickType(CreateUserDto, ['login', 'password'] as const) {}
