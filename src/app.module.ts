import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './postgres/postgres.module';

@Module({
  imports: [ConfigModule.forRoot(), PaymentModule, PostgresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
