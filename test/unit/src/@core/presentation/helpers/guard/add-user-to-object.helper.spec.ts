import { UserEntity } from '@domain/entities';
import { GuardHelpers } from '@presentation/helpers/guard';

const user = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
  session: 'any_user_session',
});

describe('GuardHelpers (suit)', () => {
  describe('AddUserToObject (suit)', () => {
    it('Should add user to request object', () => {
      const object: any = {};
      GuardHelpers.addUserToObject(object, user);
      expect(object.user).toEqual(user);
    });
  });
});
