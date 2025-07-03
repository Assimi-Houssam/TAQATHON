import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config();
export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['dist/**/*.entity{.js,.ts}'],
  migrations: ['dist/src/db/migrations/*{.js,.ts}'],
  synchronize: process.env.ENV !== 'production',
};

export const AppDataSource = new DataSource(dataSourceConfig);
