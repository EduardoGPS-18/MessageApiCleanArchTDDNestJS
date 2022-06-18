import * as crypto from 'crypto';
import { DataSource } from 'typeorm';
import { UserEntity } from '../../../../domain/entities';
import { UserRepository } from '../../../../domain/repositories';
import { UserSchema } from './user.scheme';

jest.setTimeout(15000);
jest.useRealTimers();
type SutTypes = {
  sut: UserRepository;
  dataSource: DataSource;
};
const makeSut = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    synchronize: true,
    database: 'message_db_tst',
    username: 'docker',
    host: 'localhost',
    password: 'senha123',
    port: 5432,
    logging: false,
    entities: [UserSchema],
  });
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const sut = dataSource.getRepository(UserEntity);
  return { dataSource, sut };
};

describe('User Schema', () => {
  it('Should save user with orm', async () => {
    const { sut } = await makeSut();
    const user = UserEntity.create({
      id: crypto.randomUUID(),
      name: 'any_name',
      email: 'any_mail',
      password: 'any_password',
    });
    await sut.save(user);
    await expect(sut.findOneBy({ id: user.id })).resolves.toEqual(user);
  });
});
