import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  Encrypter,
  Hasher,
  SessionHandler,
} from './@core/application/protocols';
import {
  AddUserUseCase,
  AddUserUseCaseI,
  LoginUserUseCase,
  LoginUserUseCaseI,
} from './@core/application/usecases';
import {
  CreateGroupUseCase,
  CreateGroupUseCaseI,
} from './@core/application/usecases/create-group';
import {
  ValidateUserUseCase,
  ValidateUserUseCaseI,
} from './@core/application/usecases/validate-user';
import { GroupRepository, UserRepository } from './@core/domain/repositories';
import { BcryptAdapter } from './@core/infra/adapters/bcrypt';
import { JwtSessionHandlerAdapter } from './@core/infra/adapters/session';
import { OrmGroupRepositoryAdapter } from './@core/infra/db/repositories/group';
import { OrmUserRepositoryAdapter } from './@core/infra/db/repositories/user';
import { GroupSchema } from './@core/infra/db/typeorm/group';
import { UserSchema } from './@core/infra/db/typeorm/user';
import { CreateGroupController } from './@core/infra/http/controllers/add-group';
import { LoginController } from './@core/infra/http/controllers/login';
import { SignupController } from './@core/infra/http/controllers/signup';
import { JwtAuthGuard } from './@core/infra/http/helpers/guard';

//TODO: IMPLEMENT APP MODULE

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'postgres',
        database: config.get('DB_NAME'),
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        entities: [__dirname + './**/**/**/**/*.scheme{.ts,.js}'],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([UserSchema, GroupSchema]),
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
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => {
        const ormUserRepo = dataSource.getRepository(UserSchema);
        return new OrmUserRepositoryAdapter(ormUserRepo);
      },
      inject: [getDataSourceToken()],
    },
    //USE CASES
    {
      provide: AddUserUseCaseI,
      useFactory: (
        userRepository: UserRepository,
        hasher: Hasher,
        sessionHandler: SessionHandler,
      ) => {
        return new AddUserUseCase(userRepository, hasher, sessionHandler);
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
      provide: JwtAuthGuard,
      useFactory: (validateUserUseCase: ValidateUserUseCaseI) =>
        new JwtAuthGuard(validateUserUseCase),
      inject: [ValidateUserUseCaseI],
    },
  ],
  controllers: [LoginController, SignupController, CreateGroupController],
})
export class AppModule {}
