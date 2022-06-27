import { UserEntity } from '@domain/entities';

jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

describe('User || Entity || Suit', () => {
  it('Should create a user with correct data', () => {
    const id = 'any_id';
    const email = 'any_email';
    const name = 'any_name';
    const password = 'any_password';
    const user = UserEntity.create({ id, email, name, password });

    const createdAt = new Date();
    const updatedAt = new Date();
    const toMatchUser = { id, email, name, password, createdAt, updatedAt };
    expect(user).toMatchObject(toMatchUser);
  });

  describe('updateSession', () => {
    const id = 'any_id';
    const email = 'any_email';
    const name = 'any_name';
    const password = 'any_password';
    const user = UserEntity.create({ id, email, name, password });

    user.updateSession('newSession');
    expect(user.session).toBe('newSession');
  });
});
