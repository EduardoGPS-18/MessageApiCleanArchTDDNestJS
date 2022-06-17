import { UserEntity } from '../../../domain/entities';
import { AuthenticatedUserDto } from '../dtos/authenticated-user.dto';

export class UserMapper {
  static toAuthenticatedUser(user: UserEntity): AuthenticatedUserDto {
    const { id, name, email } = user;
    return { id, name, email };
  }
}
