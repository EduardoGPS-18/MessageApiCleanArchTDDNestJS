import { UserEntity } from '../user';
import { GroupEntity } from './group.entity';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('Group entity', () => {
  it('Should create a correct group', () => {
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
      users: [],
    });

    expect(group).toMatchObject({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('Should add user correct on group', () => {
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
      users: [],
    });
    group.addUserListOnGroup([
      UserEntity.create({
        id: 'added_user_id',
        email: 'added_user_email',
        name: 'added_user_name',
        password: 'added_user_password',
        session: 'added_user_session',
      }),
    ]);
    expect(group.users).toMatchObject([
      UserEntity.create({
        id: 'added_user_id',
        email: 'added_user_email',
        name: 'added_user_name',
        password: 'added_user_password',
        session: 'added_user_session',
      }),
    ]);
  });

  it('Shouldnt add duplicated user on group', () => {
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      owner: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
      users: [],
    });
    const userToAdd = UserEntity.create({
      id: 'added_user_id_2',
      email: 'added_user_email_2',
      name: 'added_user_name_2',
      password: 'added_user_password_2',
      session: 'added_user_session_2',
    });
    const anotherUser = UserEntity.create({
      id: 'added_user_id',
      email: 'added_user_email',
      name: 'added_user_name',
      password: 'added_user_password',
      session: 'added_user_session',
    });
    group.addUserListOnGroup([userToAdd, userToAdd, anotherUser]);
    expect(group.users).toMatchObject([userToAdd, anotherUser]);
  });
});
