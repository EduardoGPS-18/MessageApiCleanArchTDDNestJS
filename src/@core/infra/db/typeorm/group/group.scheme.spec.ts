import * as crypto from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../../../domain/entities';
import { GroupEntity } from '../../../../domain/entities/group';
import { UserSchema } from '../user';
import { GroupScheme } from './group.scheme';

jest.setTimeout(15000);

interface SutTypes {
  sut: Repository<GroupEntity>;
  userRepository: Repository<UserEntity>;
  dataSource: DataSource;
}
const makeSut = async (): Promise<SutTypes> => {
  const dataSource = new DataSource({
    type: 'postgres',
    synchronize: true,
    database: 'message_db_tst',
    username: 'docker',
    host: 'localhost',
    password: 'senha123',
    port: 5432,
    logging: false,
    entities: [UserSchema, GroupScheme],
  });
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const userRepository = dataSource.getRepository(UserSchema);
  const sut = dataSource.getRepository(GroupScheme);
  return { sut, dataSource, userRepository };
};

describe('User Schema', () => {
  it('Should save group with orm', async () => {
    const { sut, userRepository } = await makeSut();
    const user = UserEntity.create({
      id: crypto.randomUUID(),
      name: 'any_name',
      email: 'any_mail',
      password: 'any_password',
    });
    await userRepository.save(user);
    const props = {
      id: crypto.randomUUID(),
      description: 'any_description',
      name: 'any_name',
      owner: user,
      users: [],
    };
    await sut.delete({ id: props.id });
    const group = GroupEntity.create(props);
    await sut.save(group);
  });
});
