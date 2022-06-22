import { UserEntity } from '@domain/entities';
import { AuthenticatedUserDto, LessUserDataDto } from '@presentation/dtos';

export class UserMapper {
  static toAuthenticatedUser(user: UserEntity): AuthenticatedUserDto {
    const { id, name, email, session: accessToken } = user;
    return { id, name, email, accessToken };
  }

  static toLessUserData(user: UserEntity): LessUserDataDto {
    const { id, name, email } = user;
    return { id, name, email };
  }
}
