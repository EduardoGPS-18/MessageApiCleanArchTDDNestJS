import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.dev' });

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
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD,
  entities: [__dirname + '/@core/infra/db/typeorm/*.schema.*'],
  migrations: [__dirname + '/@core/infra/db/migrations/*'],
  migrationsTableName: 'migrations',
});
