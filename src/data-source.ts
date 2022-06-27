import { DataSource } from 'typeorm';
export const databaseProvider = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      return appDataSource.initialize();
    },
  },
];

export const appDataSource = new DataSource({
  type: 'postgres',
  database: 'message_db_dev',
  host: 'db',
  username: 'docker',
  port: 5432,
  password: 'senha123',
  entities: [__dirname + '/@core/infra/db/typeorm/*.schema.*'],
  migrations: [__dirname + '/@core/infra/db/migrations/*'],
  migrationsTableName: 'migrations',
});
