import dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
dotenv.config({ path: `.env.${process.env.ENV}` });

export const appDataSource = new DataSource({
  type: 'postgres',

  ...(process.env.DB_URL
    ? {
        url: process.env.DB_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        username: process.env.DB_USER,
        port: Number(process.env.DB_PORT),
        password: process.env.DB_PASSWORD,
      }),
  migrationsRun: process.env.ENV === 'prod',
  synchronize: true,
  entities: [join(__dirname, '/@core/infra/db/typeorm/*.schema.*')],
  migrations: [join(__dirname, '/migrations/', '*.js')],
  migrationsTableName: 'migrations',
});
