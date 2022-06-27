import { UserEntity } from '@domain/entities';
import { PresentationHelpers } from '@presentation/helpers/methods';

const user = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
  session: 'any_user_session',
});

describe('PresentationHelpers (Suit)', () => {
  describe('AddUserToObject (Suit)', () => {
    it('Should add user to request object', () => {
      const object: any = {};
      PresentationHelpers.addUserToObject(object, user);
      expect(object.user).toEqual(user);
    });
  });
});
