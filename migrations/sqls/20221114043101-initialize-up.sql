
CREATE TYPE public.currency_enum AS ENUM
    ('KZT', 'RUB');

CREATE TYPE public.time_unit AS ENUM
    ('DAY', 'WEEK', 'MONTH');

CREATE TABLE IF NOT EXISTS public.tariff
(
    id serial PRIMARY KEY,
    code character varying(255) COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    period integer,
    period_name time_unit,
    price integer,
    currency currency_enum
);

CREATE TABLE IF NOT EXISTS public.subscriber
(
    id serial PRIMARY KEY,
    user_id integer,
    token character varying(255),
    start_date date,
    is_on boolean,
    is_active boolean,
    tariff_id integer,
    CONSTRAINT fk_tariff_payments FOREIGN KEY (tariff_id)
        REFERENCES public.tariff (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public.payment_history
(
    id serial PRIMARY KEY,
    user_id integer,
    invoice_id character varying(255) COLLATE pg_catalog."default",
    pay_date date,
    status character varying(255) COLLATE pg_catalog."default"
);

INSERT INTO public.tariff(
	code, name, description, period, period_name, price, currency)
	VALUES ('test', 'Тест', 'Пробный период', 3, 'DAY', 0, 'RUB');

INSERT INTO public.tariff(
	code, name, description, period, period_name, price, currency)
	VALUES ('main', 'Основной', 'Подписка на тариф', 1, 'MONTH', 100, 'RUB');
