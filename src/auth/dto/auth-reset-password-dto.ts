import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './auth-create-user-dto';

export class UpdateCreateUserDtoToResetPassword extends PickType(CreateUserDto, ['password'] as const) {}
