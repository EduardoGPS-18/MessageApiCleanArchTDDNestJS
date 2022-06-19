import { DomainError } from '../../errors/domain.error';
import { GroupEntity } from '../group';
import { MessageEntity } from '../message';
import { UserEntity } from '../user';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('Message entity', () => {
  it('Should create a correct group', () => {
    const message = MessageEntity.create({
      id: 'any_id',
      group: GroupEntity.create({
        id: 'any_group_id',
        description: 'any_group_description',
        messages: [],
        name: 'any_group_name',
        owner: UserEntity.create({
          email: 'any_user_email',
          id: 'any_user_id',
          name: 'any_user_name',
          password: 'any_user_password',
        }),
        users: [],
      }),
      content: 'any_content',
      sender: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
    });

    expect(message).toMatchObject({
      id: 'any_id',
      content: 'any_content',
      sender: UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      }),
    });
  });

  it('Should throw if message content is empty', () => {
    const messageFactory = () =>
      MessageEntity.create({
        group: GroupEntity.create({
          id: 'any_group_id',
          description: 'any_group_description',
          messages: [],
          name: 'any_group_name',
          owner: UserEntity.create({
            email: 'any_user_email',
            id: 'any_user_id',
            name: 'any_user_name',
            password: 'any_user_password',
          }),
          users: [],
        }),
        id: 'any_id',
        content: '',
        sender: UserEntity.create({
          id: 'any_user_id',
          email: 'any_user_email',
          name: 'any_user_name',
          password: 'any_user_password',
          session: 'any_user_session',
        }),
      });

    expect(messageFactory).toThrow(DomainError.InvalidMessage);
  });
});
