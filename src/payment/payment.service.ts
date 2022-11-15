import { Inject, Injectable } from '@nestjs/common';
import { PG_CONNECTION } from '../postgres/postgres.module';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import {
  invoiceLength,
  startInvoiceId,
  Tariff,
} from './constants/payment.constant';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  IEndSubscribers,
  IPayApiRequestBody,
  IPayApiResponse,
  IPaymentHistory,
  PayResponseStatus,
} from './interfaces/payment.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(PG_CONNECTION) private conn: any,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async subscribe(dto: PaymentCallbackDto, tariffCode: Tariff) {
    const testTariffRaw = await this.conn.query(`
      SELECT * FROM tariff WHERE code = '${tariffCode}'
    `);
    const testTariff = testTariffRaw.rows[0];
    await this.conn.query(`
        INSERT INTO subscriber (user_id, token, start_date, tariff_id, is_active, is_on)
        SELECT ${+dto.user_id}, '${dto.token}', now()::date, ${testTariff.id}, true, true
        `);
  }

  async updateSubscriptions(): Promise<void> {
    const users = await this.getEndSubscribers(Tariff.TEST);
    for (const user of users) {
      const { token, price } = user;
      const res = await this.payRequest({ token, amount: price });
      if (res.status === PayResponseStatus.SUCCESS) {
        await this.continueSubscription(user.user_id);
      } else {
        await this.cancelSubscriber(user.user_id);
      }
      const invoice_id = await this.getInvoiceId();
      await this.createPaymentHistory({
        user_id: user.user_id,
        invoice_id,
        status: res.status,
      });
    }
  }

  async cancelSubscriber(user_id: number) {
    await this.conn.query(`
    UPDATE subscriber SET is_active = false WHERE user_id = ${user_id}
    `);
  }

  async getEndSubscribers(tariff: Tariff): Promise<IEndSubscribers[]> {
    const usersRaw = await this.conn.query(`
      SELECT p.user_id, p.token, t.price, t.currency FROM subscriber p 
      JOIN tariff t on tariff_id = t.id
      WHERE now()::date > start_date + (t.period::text || t.period_name)::interval
      AND p.is_on = true AND t.code = '${tariff}'
    `);

    return usersRaw.rows;
  }

  async payRequest(body: IPayApiRequestBody): Promise<IPayApiResponse> {
    const url = this.configService.getOrThrow('PAYMENT_API');
    const res = await firstValueFrom(
      this.httpService.post<IPayApiResponse>(url, body, {
        timeout: 30000,
      }),
    );
    if (res.data.status === PayResponseStatus.FAILED) {
      console.log(res.data.status);
    }
    return res.data;
  }

  async continueSubscription(user_id: number): Promise<void> {
    await this.conn.query(`
      UPDATE TABLE subscriber
      SET start_date = now()::date
      SET is_active = true
      WHERE user_id = ${user_id}
    `);
  }

  async createPaymentHistory(paymentInfo: IPaymentHistory): Promise<void> {
    const { user_id, invoice_id, status } = paymentInfo;
    await this.conn.query(`
      INSERT INTO payment_history (user_id, invoice_id, pay_date, status)
      SELECT (${user_id}, '${invoice_id}', now()::date, '${status}')
    `);
  }

  private async getInvoiceId(): Promise<string> {
    const paymentHistoryRaw = await this.conn.query(`
      SELECT invoice_id FROM payment_history ORDER BY createdAt desc LIMIT 1
    `);
    const paymentHistory = paymentHistoryRaw.rows[0];
    const invoiceId = paymentHistory.invoice_id;
    if (!invoiceId) {
      return startInvoiceId;
    }
    let nextInvoiceId = (Number(invoiceId) + 1).toString();
    while (nextInvoiceId.length !== invoiceLength) {
      nextInvoiceId = '0' + nextInvoiceId;
    }
    return nextInvoiceId;
  }
}
