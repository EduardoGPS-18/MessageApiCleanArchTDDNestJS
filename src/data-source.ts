import dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
dotenv.config({ path: `.env.${process.env.ENV}` });

const appDataSource = new DataSource({
  type: 'postgres',

  ...(process.env.DB_URL
    ? {
        migrationsRun: true,
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

  synchronize: true,
  entities: [join(__dirname, '/@core/infra/db/typeorm/*.schema.*')],
  migrations: [join(__dirname, '/migrations/', '*.js')],
  migrationsTableName: 'migrations',
});

export = appDataSource;
