import {
  GetUserGroupList,
  GetUserGroupListUseCaseI,
} from '@application/usecases';
import { GroupEntity, UserEntity } from '@domain/entities';
import { DomainError } from '@domain/errors';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GetUserGroupListController } from '@presentation/controllers';

const mockedOwner = UserEntity.create({
  id: 'any_owner_id',
  name: 'any_owner_name',
  email: 'any_owner_email',
  password: 'any_owner_password',
});

const mockedGroup = GroupEntity.create({
  id: 'any_group_id',
  name: 'any_group_name',
  description: 'any_group_description',
  owner: mockedOwner,
  messages: [],
  users: [],
});

class GetUserGroupListUseCaseStub implements GetUserGroupListUseCaseI {
  async execute({ userId }: GetUserGroupList): Promise<GroupEntity[]> {
    return [mockedGroup, mockedGroup];
  }
}
type SutTypes = {
  getUserGroupListStub: GetUserGroupListUseCaseStub;
  sut: GetUserGroupListController;
};
const makeSut = (): SutTypes => {
  const getUserGroupListStub = new GetUserGroupListUseCaseStub();
  const sut = new GetUserGroupListController(getUserGroupListStub);
  return { sut, getUserGroupListStub };
};

describe('GetUserGroupList || Controller || SUIT', () => {
  it('Should call usecase correctly', async () => {
    const { sut, getUserGroupListStub } = makeSut();
    jest.spyOn(getUserGroupListStub, 'execute');

    await sut.handle(mockedOwner);

    const { id: userId } = mockedOwner;
    expect(getUserGroupListStub.execute).toBeCalledWith({ userId });
  });

  it('Should throw Forbidden on InvalidUser', async () => {
    const { sut, getUserGroupListStub } = makeSut();
    jest
      .spyOn(getUserGroupListStub, 'execute')
      .mockRejectedValueOnce(new DomainError.InvalidUser());

    const promise = sut.handle(mockedOwner);

    const { id: userId } = mockedOwner;
    await expect(promise).rejects.toThrow(ForbiddenException);
  });

  it('Should throw InternalServerError on Unexpected', async () => {
    const { sut, getUserGroupListStub } = makeSut();
    jest
      .spyOn(getUserGroupListStub, 'execute')
      .mockRejectedValueOnce(new DomainError.Unexpected());

    const promise = sut.handle(mockedOwner);

    const { id: userId } = mockedOwner;
    await expect(promise).rejects.toThrow(InternalServerErrorException);
  });

  it('Should return GroupWithoutMessages on succeed', async () => {
    const { sut } = makeSut();

    const groups = await sut.handle(mockedOwner);

    expect(groups).toEqual([
      {
        id: 'any_group_id',
        name: 'any_group_name',
        description: 'any_group_description',
        owner: {
          id: 'any_owner_id',
          name: 'any_owner_name',
          email: 'any_owner_email',
        },
      },
      {
        id: 'any_group_id',
        name: 'any_group_name',
        description: 'any_group_description',
        owner: {
          id: 'any_owner_id',
          name: 'any_owner_name',
          email: 'any_owner_email',
        },
      },
    ]);
  });
});
