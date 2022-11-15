import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PostgresModule } from '../postgres/postgres.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule, PostgresModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
