import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './auth-create-user-dto';

export class UpdateCreateUserDtoToForgetPassword extends PickType(CreateUserDto, ['email'] as const) {}
