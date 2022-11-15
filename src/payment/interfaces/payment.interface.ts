export interface IPayApiRequestBody {
  token: string;
  amount: number;
}

export enum PayResponseStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

export interface IPayApiResponse {
  statusCode: number;
  status: PayResponseStatus;
  description: string;
}

export interface IPaymentHistory {
  user_id: number;
  invoice_id: string;
  pay_date?: Date;
  status: string;
}


export enum TimeUnit {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export enum Currency {
  RUB = 'RUB',
  KZT = 'KZT',
}

export interface ISubscriber {
  id?: number;
  user_id: number;
  token: string;
  start_date: Date;
  is_active: boolean;
  tariff_id: number;
}

export interface ITariff {
  id?: number;
  code: string;
  name: string;
  description: string;
  period: number;
  period_name: TimeUnit;
  price: number;
  currency: Currency;
}

export type IEndSubscribers = Pick<ISubscriber, 'user_id' | 'token'> &
  Pick<ITariff, 'price' | 'currency'>;
