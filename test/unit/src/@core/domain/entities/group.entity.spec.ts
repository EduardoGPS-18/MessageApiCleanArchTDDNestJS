import { GroupEntity, UserEntity } from '@domain/entities';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('Group || Entity || Suit', () => {
  it('Should create a correct group', () => {
    const group = GroupEntity.create({
      id: 'any_id',
      name: 'any_name',
      description: 'any_description',
      messages: [],
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

  describe('addUserListOnGroup', () => {
    it('Should add user correct on group', () => {
      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
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
        messages: [],
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

    it('Should add a list of user on group', () => {
      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
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
        UserEntity.create({
          id: 'added_user_id_2',
          email: 'added_user_email_2',
          name: 'added_user_name_2',
          password: 'added_user_password_2',
          session: 'added_user_session_2',
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
        UserEntity.create({
          id: 'added_user_id_2',
          email: 'added_user_email_2',
          name: 'added_user_name_2',
          password: 'added_user_password_2',
          session: 'added_user_session_2',
        }),
      ]);
    });

    it('Should add a list of user on group', () => {
      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
          session: 'any_user_session',
        }),
        users: [
          UserEntity.create({
            id: 'added_user_id',
            email: 'added_user_email',
            name: 'added_user_name',
            password: 'added_user_password',
            session: 'added_user_session',
          }),
        ],
      });
      group.addUserListOnGroup([
        UserEntity.create({
          id: 'added_user_id',
          email: 'added_user_email',
          name: 'added_user_name',
          password: 'added_user_password',
          session: 'added_user_session',
        }),
        UserEntity.create({
          id: 'added_user_id_2',
          email: 'added_user_email_2',
          name: 'added_user_name_2',
          password: 'added_user_password_2',
          session: 'added_user_session_2',
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
        UserEntity.create({
          id: 'added_user_id_2',
          email: 'added_user_email_2',
          name: 'added_user_name_2',
          password: 'added_user_password_2',
          session: 'added_user_session_2',
        }),
      ]);
    });
  });

  describe('is user is in group', () => {
    it('Should return false if user isnt in group', () => {
      const user1 = UserEntity.create({
        id: 'any_user_id_1',
        email: 'any_user_email_1',
        name: 'any_user_name_1',
        password: 'any_user_password_1',
        session: 'any_user_session_1',
      });

      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
          session: 'any_user_session',
        }),
        users: [],
      });

      expect(group.isUserInGroup(user1)).toBe(false);
    });

    it('Should return true if user is the group owner', () => {
      const owner = UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      });
      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: owner,
        users: [],
      });

      expect(group.isUserInGroup(owner)).toBe(true);
    });

    it('Should return true if user is in group', () => {
      const user1 = UserEntity.create({
        id: 'any_user_id_1',
        email: 'any_user_email_1',
        name: 'any_user_name_1',
        password: 'any_user_password_1',
        session: 'any_user_session_1',
      });

      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
          session: 'any_user_session',
        }),
        users: [user1],
      });

      expect(group.isUserInGroup(user1)).toBe(true);
    });
  });

  describe('is user group adminer', () => {
    it('Should return true if user is owner', () => {
      const owner = UserEntity.create({
        id: 'any_owner_id',
        email: 'any_owner_email',
        name: 'any_owner_name',
        password: 'any_owner_password',
        session: 'any_owner_session',
      });

      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: owner,
        users: [],
      });

      expect(group.isUserAdminer(owner)).toBe(true);
    });

    it('Should return false if user isnt owner', () => {
      const owner = UserEntity.create({
        id: 'any_owner_id',
        email: 'any_owner_email',
        name: 'any_owner_name',
        password: 'any_owner_password',
        session: 'any_owner_session',
      });
      const anyUser = UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      });
      const group = GroupEntity.create({
        id: 'any_id',
        name: 'any_name',
        description: 'any_description',
        messages: [],
        owner: owner,
        users: [],
      });

      expect(group.isUserInGroup(anyUser)).toBe(false);
    });
  });
});
