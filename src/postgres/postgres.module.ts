import { Module } from '@nestjs/common';
import { Pool } from 'pg';

require('dotenv').config();

export const PG_CONNECTION = 'PG_CONNECTION';

const dbProvider = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  }),
};

@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class PostgresModule {}
