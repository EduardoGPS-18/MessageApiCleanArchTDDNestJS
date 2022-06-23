import { UserEntity } from '@domain/entities';
import { addUserToObjectHelper } from '@presentation/helpers/guard';

const user = UserEntity.create({
  id: 'any_user_id',
  email: 'any_user_email',
  name: 'any_user_name',
  password: 'any_user_password',
  session: 'any_user_session',
});

describe('AddUserToRequest (suit)', () => {
  it('Should add user to request object', () => {
    const object: any = {};
    addUserToObjectHelper(object, user);
    console.log(object);
    expect(object.any).toEqual(user);
  });
});
