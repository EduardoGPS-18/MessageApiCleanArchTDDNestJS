import { UserEntity } from '@domain/entities';

export function addUserToObjectHelper(object: Object, user: UserEntity) {
  Object.defineProperty(object, 'user', user);
}
