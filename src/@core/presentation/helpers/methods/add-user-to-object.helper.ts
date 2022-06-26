import { UserEntity } from '@domain/entities';

export class PresentationHelpers {
  static addUserToObject(object: Object, user: UserEntity) {
    object['user'] = user;
  }
}
