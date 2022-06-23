import { UserEntity } from '@domain/entities';

export function addUserToObjectHelper(object: Object, user: UserEntity) {
  object['user'] = user;
}
