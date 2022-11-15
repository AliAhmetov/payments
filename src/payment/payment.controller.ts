import { Body, Controller, Get, Post } from "@nestjs/common";
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { PaymentService } from './payment.service';
import { Cron } from '@nestjs/schedule';
import { Tariff } from './constants/payment.constant';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Cron('0 1 * * *')
  updateSubscription(): void {
    this.paymentService.updateSubscriptions();
  }

  @Get()
  updateSubscriptionGet(): string {
    this.paymentService.updateSubscriptions();
    return 'ok';
  }

  @Post('callback')
  payCallback(@Body() dto: PaymentCallbackDto): void {
    this.paymentService.subscribe(dto, Tariff.TEST);
  }
}
