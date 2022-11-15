import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PG_CONNECTION } from '../postgres/postgres.module';
import { Observable, of } from 'rxjs';
import { Tariff } from './constants/payment.constant';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockDb = {
    query: jest.fn(async (rawQuery: string): Promise<any> => {
      return {
        rows: [{}, {}, {}],
      };
    }),
  };
  const mockConfig = {
    getOrThrow: jest.fn((envName: string): string => {
      if (envName === 'PAYMENT_API') {
        return 'https://test.com';
      }
    }),
  };
  const mockHttp = {
    post: jest.fn((url: string, body, config): Observable<any> => {
      return of({
        data: {
          statusCode: 200,
          status: 'success',
          description: 'успех',
        },
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PG_CONNECTION, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfig },
        { provide: HttpService, useValue: mockHttp },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update subscription', () => {
    it('should send request to api', async () => {
      //   statusCode: 200,
      //   status: 'success',
      //   description: 'успех',
      // };
      expect(service.updateSubscriptions).toBeDefined();
    });
  });

  describe('get end subscribers', () => {
    it('should return array of subscribers', async () => {
      const mockRequestResult = [{}, {}, {}];
      expect(service.getEndSubscribers).toBeDefined();
      expect(await service.getEndSubscribers(Tariff.TEST)).toEqual(
        mockRequestResult,
      );
    });
  });

  describe('pay api request', () => {
    it('should return request response', async () => {
      const mockBody = {
        token: 'some-api-token',
        amount: 2000,
      };
      const mockRequestResult = {
        statusCode: 200,
        status: 'success',
        description: 'успех',
      };
      expect(service.payRequest).toBeDefined();
      expect(await service.payRequest(mockBody)).toEqual(mockRequestResult);
    });
  });
});
