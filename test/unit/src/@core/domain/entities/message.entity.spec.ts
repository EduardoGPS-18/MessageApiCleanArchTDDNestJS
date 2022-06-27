import { GroupEntity, MessageEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('Message || Entity || Suit', () => {
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

  describe('is Sender', () => {
    const sender = UserEntity.create({
      id: 'sender_user_id',
      email: 'sender_user_email',
      name: 'sender_user_name',
      password: 'sender_user_password',
      session: 'sender_user_session',
    });
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
        content: 'any_content',
        sender: sender,
      });
    it('Should return true if user is the owner of message', () => {
      const message = messageFactory();
      expect(message.isSender(sender)).toBe(true);
    });
    it('Should return false if user is the owner of message', () => {
      const message = messageFactory();
      const notSender = UserEntity.create({
        id: 'any_user_id',
        email: 'any_user_email',
        name: 'any_user_name',
        password: 'any_user_password',
        session: 'any_user_session',
      });
      expect(message.isSender(notSender)).toBe(false);
    });
  });

  describe('update Message Content', () => {
    const sender = UserEntity.create({
      id: 'sender_user_id',
      email: 'sender_user_email',
      name: 'sender_user_name',
      password: 'sender_user_password',
      session: 'sender_user_session',
    });
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
        content: 'any_content',
        sender: sender,
      });

    it('Should change message content', () => {
      const message = messageFactory();
      message.updateMessageContent('new_content');
      expect(message.content).toBe('new_content');
    });
  });
});
