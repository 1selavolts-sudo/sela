// MTN MoMo Collections (request-to-pay). The driver approves the payment on their phone, and MTN reports the answer.
// The website never marks a payment as paid on its own: only MTN's status answer does.

export type MomoConfig = {
  baseUrl: string;
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  environment: string;
  currency: string;
};

export type MomoOutcome = {
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
  reason: string | null;
  financialTransactionId: string | null;
};

type MomoStep = 'token' | 'request' | 'status';

// Amounts a driver can pay in one go, in RWF.
export const momoAmountsRwf = [1000, 2000, 5000, 10000] as const;

// Reads the MTN settings from the server environment. Returns null until the three keys are set, so payments stay off.
export function momoConfig(): MomoConfig | null {
  const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
  const apiUser = process.env.MTN_MOMO_API_USER;
  const apiKey = process.env.MTN_MOMO_API_KEY;
  if (!subscriptionKey || !apiUser || !apiKey) return null;

  const environment = process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
  const sandbox = environment === 'sandbox';
  return {
    baseUrl: process.env.MTN_MOMO_BASE_URL || (sandbox ? 'https://sandbox.momodeveloper.mtn.com' : 'https://proxy.momoapi.mtn.com'),
    subscriptionKey,
    apiUser,
    apiKey,
    environment,
    // The sandbox accepts EUR only; live MTN Rwanda payments are in RWF.
    currency: process.env.MTN_MOMO_CURRENCY || (sandbox ? 'EUR' : 'RWF')
  };
}

export function momoConfigured() {
  return momoConfig() !== null;
}

// MTN expects the number in international form without "+": 0789662677 becomes 250789662677.
export function toMsisdn(localNumber: string) {
  return `250${localNumber.replace(/^0/, '')}`;
}

// MTN MoMo numbers start with 078 or 079. Other networks cannot pay this way.
export function isMtnNumber(localNumber: string) {
  return /^07[89]/.test(localNumber);
}

// Shows only the first three and last three digits.
export function maskPhone(localNumber: string) {
  return `${localNumber.slice(0, 3)} *** ${localNumber.slice(-3)}`;
}

// Only says which call failed and the HTTP status. Never includes keys or response bodies.
export class MomoError extends Error {
  constructor(readonly step: MomoStep, readonly httpStatus?: number) {
    super(`MTN MoMo ${step} call failed${httpStatus ? ` with HTTP ${httpStatus}` : ''}`);
    this.name = 'MomoError';
  }
}

let cachedToken: { value: string; expiresAt: number; owner: string } | null = null;

async function call(url: string, init: RequestInit, step: MomoStep) {
  const res = await fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new MomoError(step, res.status);
  return res;
}

async function accessToken(config: MomoConfig) {
  const owner = `${config.baseUrl}|${config.apiUser}`;
  if (cachedToken && cachedToken.owner === owner && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const basic = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64');
  const res = await call(`${config.baseUrl}/collection/token/`, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, 'Ocp-Apim-Subscription-Key': config.subscriptionKey }
  }, 'token');
  const body = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new MomoError('token');

  // Renew a minute early, so a request never goes out with an expired token.
  cachedToken = { value: body.access_token, expiresAt: Date.now() + ((body.expires_in ?? 3600) - 60) * 1000, owner };
  return body.access_token;
}

export type MomoRequest = {
  referenceId: string;
  amountRwf: number;
  localNumber: string;
  externalId: string;
  note: string;
};

// Asks MTN to send the driver a payment prompt. Resolves when MTN accepts the request, not when the money has moved.
export async function requestMomoPayment(config: MomoConfig, request: MomoRequest) {
  const token = await accessToken(config);
  await call(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Reference-Id': request.referenceId,
      'X-Target-Environment': config.environment,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: String(request.amountRwf),
      currency: config.currency,
      externalId: request.externalId,
      payer: { partyIdType: 'MSISDN', partyId: toMsisdn(request.localNumber) },
      payerMessage: 'SELA ENERGY charging',
      payeeNote: request.note.slice(0, 160)
    })
  }, 'request');
}

// The latest answer MTN has for a request.
export async function momoPaymentStatus(config: MomoConfig, referenceId: string): Promise<MomoOutcome> {
  const token = await accessToken(config);
  const res = await call(`${config.baseUrl}/collection/v1_0/requesttopay/${encodeURIComponent(referenceId)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'X-Target-Environment': config.environment,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey
    }
  }, 'status');
  const body = (await res.json()) as { status?: string; reason?: string; financialTransactionId?: string };
  return {
    status: body.status === 'SUCCESSFUL' || body.status === 'FAILED' ? body.status : 'PENDING',
    reason: body.reason ?? null,
    financialTransactionId: body.financialTransactionId ?? null
  };
}

const reasonMessages: Record<string, string> = {
  NOT_ENOUGH_FUNDS: 'There is not enough money in this MoMo account for the amount.',
  PAYER_NOT_FOUND: 'This number is not registered for MTN MoMo.',
  APPROVAL_REJECTED: 'The payment was cancelled on your phone.',
  EXPIRED: 'The approval took too long. Please try again.',
  PAYER_LIMIT_REACHED: 'This MoMo account has reached its limit for now. Try again later.',
  REQUEST_FAILED: 'We could not send the payment request to your phone. Please try again.'
};

// Plain words for the driver. A payment that did not go through has not taken any money.
export function momoReasonMessage(reason: string | null) {
  return (reason && reasonMessages[reason]) || 'The payment did not go through. Nothing was charged.';
}
