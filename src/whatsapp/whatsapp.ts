import type { Notizy } from '../core/notizy';
import { withQuery } from '../utils/build-query';
import type {
  QueuedMessage,
  SendWhatsAppMessageOptions,
  SendWhatsAppMessageRequestOptions,
  SendWhatsAppMessageResponse,
} from './types/send-message';
import type {
  SendWhatsAppTemplateMessageOptions,
  SendWhatsAppTemplateMessageRequestOptions,
  SendWhatsAppTemplateMessageResponse,
} from './types/send-template';
import type {
  ListAccountsResponse,
  ListTemplatesOptions,
  ListTemplatesResponse,
  Template,
  WhatsappAccount,
} from './types/templates';

export class Whatsapp {
  constructor(private readonly notizy: Notizy) {}

  /**
   * Queues a message (template, text, image, video, audio or document).
   * Pass `idempotencyKey` to retry safely without sending twice.
   */
  async send(
    payload: SendWhatsAppMessageOptions,
    options: SendWhatsAppMessageRequestOptions = {},
  ): Promise<SendWhatsAppMessageResponse> {
    return this.notizy.post<QueuedMessage>(
      '/v1/whatsapp/messages',
      payload,
      options,
    );
  }

  /** Shorthand for `send({ type: 'template', ... })`. */
  async sendTemplate(
    payload: SendWhatsAppTemplateMessageOptions,
    options: SendWhatsAppTemplateMessageRequestOptions = {},
  ): Promise<SendWhatsAppTemplateMessageResponse> {
    return this.send({ ...payload, type: 'template' }, options);
  }

  readonly templates = {
    /** Approved templates, with how many variables each part needs. */
    list: (options: ListTemplatesOptions): Promise<ListTemplatesResponse> =>
      this.notizy.get<{ data: Template[] }>(
        withQuery('/v1/whatsapp/templates', { account_id: options.account_id }),
      ),
  };

  readonly accounts = {
    /** Connected WhatsApp numbers; `id` is the `account_id` to send from. */
    list: (): Promise<ListAccountsResponse> =>
      this.notizy.get<{ data: WhatsappAccount[] }>('/v1/whatsapp/accounts'),
  };
}
