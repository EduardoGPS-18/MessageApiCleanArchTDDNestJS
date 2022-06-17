import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../../../domain/entities';
import { UserSchema } from '../../typeorm/user';
import { OrmUserRepositoryAdapter } from './orm-user.adapter';

type SutTypes = {
  ormRepository: Repository<UserEntity>;
  sut: OrmUserRepositoryAdapter;
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
  const userRepository = dataSource.getRepository(UserEntity);
  const sut = new OrmUserRepositoryAdapter(userRepository);
  return { sut, userRepository };
};

describe('Orm User Repository adapter', () => {
  const mockedUser = {
    id: 'any_id',
    email: 'any_email',
    name: 'any_name',
    password: 'any_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  describe('FindOneByEmail', () => {
    beforeEach(async () => {
      const { userRepository } = await makeSut();
      userRepository.clear();
    });

    it('Should call orm with correct values', async () => {
      const { sut, userRepository } = await makeSut();
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockedUser);

      await sut.findOneByEmail('any_email');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: 'any_email',
      });
    });

    it('Should return same of orm', async () => {
      const { sut, userRepository } = await makeSut();

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockedUser);

      const user = await sut.findOneByEmail(mockedUser.email);
      expect(user).toEqual(mockedUser);
    });
  });

  describe('Insert', () => {
    beforeEach(async () => {
      const { userRepository } = await makeSut();
      userRepository.clear();
    });
    it('Should integrate correctly with orm', async () => {
      const { sut, userRepository } = await makeSut();
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(mockedUser);
      const result = await sut.insert(mockedUser);
      expect(userRepository.save).toHaveBeenCalledWith(mockedUser);
      expect(result).toBeUndefined();
    });
  });
});
