import { UserEntity } from '@domain/entities';

export class GuardHelpers {
  static addUserToObject(object: Object, user: UserEntity) {
    object['user'] = user;
  }
}
