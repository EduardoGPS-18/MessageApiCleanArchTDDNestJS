import { UserEntity } from '../../../domain/entities';
import { AuthenticatedUserDto } from '../dtos/authenticated-user.dto';

export class UserMapper {
  static toAuthenticatedUser(user: UserEntity): AuthenticatedUserDto {
    const { id, name, email, session: accessToken } = user;
    return { id, name, email, accessToken };
  }
}
