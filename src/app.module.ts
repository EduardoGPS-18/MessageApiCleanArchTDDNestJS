import { Encrypter, Hasher, SessionHandler } from '@application/protocols';
import {
  AddUserToGroupUseCase,
  AddUserToGroupUseCaseI,
  CreateGroupUseCase,
  CreateGroupUseCaseI,
  DeleteMessageUseCase,
  DeleteMessageUseCaseI,
  EditMessageUseCase,
  EditMessageUseCaseI,
  GetGroupMessageListUseCase,
  GetGroupMessageListUseCaseI,
  GetUserGroupListUseCase,
  GetUserGroupListUseCaseI,
  LoginUserUseCase,
  LoginUserUseCaseI,
  RegisterUserUseCase,
  RegisterUserUseCaseI,
  RemoveUserFromGroupUseCase,
  RemoveUserFromGroupUseCaseI,
  SendMessageToGroupUseCase,
  SendMessageToGroupUseCaseI,
  ValidateUserUseCase,
  ValidateUserUseCaseI,
} from '@application/usecases';
import {
  GroupRepository,
  MessageRepository,
  UserRepository,
} from '@domain/repositories';
import { BcryptAdapter, JwtSessionHandlerAdapter } from '@infra/adapters';
import {
  OrmGroupRepositoryAdapter,
  OrmMessageRepositoryAdapter,
  OrmUserRepositoryAdapter,
} from '@infra/db/repositories';
import { GroupSchema, MessageScheme, UserSchema } from '@infra/db/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  AddUserToGroupController,
  CreateGroupController,
  GetGroupMessageListController,
  GetUserGroupListController,
  LoginController,
  RemoveUserFromGroupController,
  SignupController,
} from '@presentation/controllers';
import {
  DeleteMessageGateway,
  EditMessageGateway,
  SendMessageGateway,
} from '@presentation/gateways';
import { JwtAuthGuard } from '@presentation/helpers/guard';
import { GroupWebSocketProviderI } from '@presentation/protocols';
import { GroupWebSocketProviderGateway } from '@presentation/providers';
import { DataSource } from 'typeorm';
import { appDataSource } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.ENV}`],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      dataSourceFactory: async () => {
        await appDataSource.initialize();

        return appDataSource;
      },
      useFactory: () => ({}),
    }),
    TypeOrmModule.forFeature([UserSchema, GroupSchema, MessageScheme]),
  ],
  providers: [
    //PROTOCOLS
    {
      provide: SessionHandler,
      useFactory: (configService: ConfigService, jwtService: JwtService) => {
        return new JwtSessionHandlerAdapter(jwtService, configService);
      },
      inject: [ConfigService, JwtService],
    },
    {
      provide: Encrypter,
      useClass: BcryptAdapter,
    },
    {
      provide: Hasher,
      useClass: BcryptAdapter,
    },
    //REPOSITORIES
    {
      provide: GroupRepository,
      useFactory: (dataSource: DataSource) => {
        const ormGroupRepo = dataSource.getRepository(GroupSchema);
        return new OrmGroupRepositoryAdapter(ormGroupRepo);
      },
      inject: [getDataSourceToken()],
    },
    {
      provide: MessageRepository,
      useFactory: (dataSource: DataSource) => {
        const ormMessageRepo = dataSource.getRepository(MessageScheme);
        return new OrmMessageRepositoryAdapter(ormMessageRepo);
      },
      inject: [getDataSourceToken()],
    },
    {
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => {
        const ormUserRepo = dataSource.getRepository(UserSchema);
        return new OrmUserRepositoryAdapter(ormUserRepo);
      },
      inject: [getDataSourceToken()],
    },
    //USE CASES
    {
      provide: RegisterUserUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        hasher: Hasher,
        sessionHandler: SessionHandler,
      ) => {
        return new RegisterUserUseCase(userRepository, hasher, sessionHandler);
      },
      inject: [UserRepository, Hasher, SessionHandler],
    },
    {
      provide: LoginUserUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        encrypter: Encrypter,
        sessionHandler: SessionHandler,
      ) => {
        return new LoginUserUseCase(encrypter, userRepository, sessionHandler);
      },
      inject: [UserRepository, Encrypter, SessionHandler],
    },
    {
      provide: ValidateUserUseCaseI,
      useFactory: (
        sessionHandler: SessionHandler,
        userRepository: UserRepository,
      ) => new ValidateUserUseCase(sessionHandler, userRepository),
      inject: [SessionHandler, UserRepository],
    },
    {
      provide: JwtAuthGuard,
      useFactory: (validateUserUseCase: ValidateUserUseCaseI) =>
        new JwtAuthGuard(validateUserUseCase),
      inject: [ValidateUserUseCaseI],
    },
    {
      provide: CreateGroupUseCaseI,
      useFactory: (
        groupRepository: GroupRepository,
        userRepository: UserRepository,
      ) => {
        return new CreateGroupUseCase(groupRepository, userRepository);
      },
      inject: [GroupRepository, UserRepository],
    },
    {
      provide: SendMessageToGroupUseCaseI,
      useFactory: (
        groupRepository: GroupRepository,
        userRepository: UserRepository,
        messageRepository: MessageRepository,
      ) => {
        return new SendMessageToGroupUseCase(
          groupRepository,
          userRepository,
          messageRepository,
        );
      },
      inject: [GroupRepository, UserRepository, MessageRepository],
    },
    {
      provide: EditMessageUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        messageRepository: MessageRepository,
      ) => {
        return new EditMessageUseCase(userRepository, messageRepository);
      },
      inject: [UserRepository, MessageRepository],
    },
    {
      provide: GetGroupMessageListUseCaseI,
      useFactory: (
        groupRepository: GroupRepository,
        messageRepository: MessageRepository,
        userRepository: UserRepository,
      ) => {
        return new GetGroupMessageListUseCase(
          groupRepository,
          messageRepository,
          userRepository,
        );
      },
      inject: [GroupRepository, MessageRepository, UserRepository],
    },
    {
      provide: AddUserToGroupUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        groupRepository: GroupRepository,
      ) => {
        return new AddUserToGroupUseCase(groupRepository, userRepository);
      },
      inject: [UserRepository, GroupRepository],
    },
    {
      provide: DeleteMessageUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        groupRepository: GroupRepository,
        messageRepository: MessageRepository,
      ) => {
        return new DeleteMessageUseCase(
          userRepository,
          groupRepository,
          messageRepository,
        );
      },

      inject: [UserRepository, GroupRepository, MessageRepository],
    },
    {
      provide: GetUserGroupListUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        groupRepository: GroupRepository,
      ) => {
        return new GetUserGroupListUseCase(userRepository, groupRepository);
      },
      inject: [UserRepository, GroupRepository],
    },
    {
      provide: GroupWebSocketProviderI,
      useExisting: GroupWebSocketProviderGateway,
    },
    {
      provide: RemoveUserFromGroupUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        groupRepository: GroupRepository,
      ) => {
        return new RemoveUserFromGroupUseCase(userRepository, groupRepository);
      },
      inject: [UserRepository, GroupRepository],
    },
    GroupWebSocketProviderGateway,
    // Messages
    SendMessageGateway,
    DeleteMessageGateway,
    EditMessageGateway,
  ],
  controllers: [
    // Auth
    LoginController,
    SignupController,
    // Group
    CreateGroupController,
    // Group - Messages
    GetGroupMessageListController,
    //User - Group
    AddUserToGroupController,
    RemoveUserFromGroupController,
    GetUserGroupListController,
  ],
})
export class AppModule {}
