import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join, resolve } from 'path';

dotenv.config({
  path: resolve(
    process.env.NODE_ENV === 'production' ? '.env' : 'development.env',
  ),
});

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  entities: [join(__dirname, '../..', '**', '*.entity.{ts,js}')],
  subscribers: [join(__dirname, '../..', '**', '*.subscriber.{ts,js}')],
  migrations: [join(__dirname, '../../migrations', '*.{ts,js}')],
});
