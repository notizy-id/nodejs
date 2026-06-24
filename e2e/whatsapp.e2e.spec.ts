import { Notizy } from '../src/core/notizy';

const apiKey = process.env.NOTIZY_TEST_API_KEY;
const phoneNumber = process.env.NOTIZY_TEST_PHONE_NUMBER;
const accountId = process.env.NOTIZY_TEST_ACCOUNT_ID;
const templateName = process.env.NOTIZY_TEST_OTP_TEMPLATE_NAME;
const templateLanguage = process.env.NOTIZY_TEST_OTP_TEMPLATE_LANGUAGE || 'id';
const baseUrl = process.env.NOTIZY_BASE_URL;

const hasAllCredentials = !!(
  apiKey &&
  phoneNumber &&
  accountId &&
  templateName
);

const describeIfReady = hasAllCredentials ? describe : describe.skip;

let notizy: Notizy;

describeIfReady('WhatsApp E2E', () => {
  beforeAll(() => {
    notizy = baseUrl ? new Notizy(apiKey!, { baseUrl }) : new Notizy(apiKey!);
  });

  it('should send a WhatsApp template message and receive a valid response', async () => {
    const response = await notizy.whatsapp.sendTemplate({
      account_id: accountId!,
      to: phoneNumber!,
      template: {
        name: templateName!,
        language: templateLanguage,
        body: ['123456'],
        buttons: [{ url: '123456', payload: '123456' }],
      },
    });

    expect(response.error).toBeNull();
    expect(response.data).not.toBeNull();
    expect(response.data!.id).toBeDefined();
    expect(typeof response.data!.id).toBe('string');
    expect(response.data!.status).toBe('PENDING');
    expect(response.data!.to).toBe(phoneNumber);
  });
});
