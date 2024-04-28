import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './auth-create-user-dto';

export class UpdateCreateUserDtoToSignInDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'role', 'user_id'] as const),
) {}
