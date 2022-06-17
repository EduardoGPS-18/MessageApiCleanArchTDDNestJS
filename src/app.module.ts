import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Encrypter, Hasher } from './@core/application/protocols';
import {
  AddUserUseCase,
  AddUserUseCaseI,
  LoginUserUseCase,
  LoginUserUseCaseI,
} from './@core/application/usecases';
import { UserRepository } from './@core/domain/repositories';
import { BcryptAdapter } from './@core/infra/adapters/bcrypt';
import { OrmUserRepositoryAdapter } from './@core/infra/db/repositories/user';
import { UserSchema } from './@core/infra/db/typeorm/user';
import { LoginController } from './@core/infra/http/controllers/login';
import { SignupController } from './@core/infra/http/controllers/signup';

//TODO: IMPLEMENT APP MODULE

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: BcryptAdapter,
    },
    {
      provide: Hasher,
      useClass: BcryptAdapter,
    },
    {
      provide: UserRepository,
      useFactory: (dataSource: DataSource) => {
        const ormUserRepo = dataSource.getRepository(UserSchema);
        return new OrmUserRepositoryAdapter(ormUserRepo);
      },
      inject: [getDataSourceToken()],
    },
    {
      provide: AddUserUseCaseI,
      useFactory: (userRepository: UserRepository, hasher: Hasher) => {
        return new AddUserUseCase(userRepository, hasher);
      },
      inject: [UserRepository, Hasher],
    },
    {
      provide: LoginUserUseCaseI,
      useFactory: (userRepository: UserRepository, encrypter: Encrypter) => {
        return new LoginUserUseCase(encrypter, userRepository);
      },
      inject: [UserRepository, Encrypter],
    },
  ],
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.ENV}`],
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
    TypeOrmModule.forFeature([UserSchema]),
  ],
  controllers: [LoginController, SignupController],
})
export class AppModule {}
