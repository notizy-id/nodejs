import type { Notizy } from '../core/notizy';
import type {
  SendWhatsAppTemplateMessageOptions,
  SendWhatsAppTemplateMessageRequestOptions,
  SendWhatsAppTemplateMessageResponse,
  SendWhatsAppTemplateMessageResponseSuccess,
} from './types/send-template';

export class Whatsapp {
  constructor(private readonly notizy: Notizy) {}

  async sendTemplate(
    payload: SendWhatsAppTemplateMessageOptions,
    options: SendWhatsAppTemplateMessageRequestOptions = {},
  ): Promise<SendWhatsAppTemplateMessageResponse> {
    const data =
      await this.notizy.post<SendWhatsAppTemplateMessageResponseSuccess>(
        '/v1/whatsapp/messages',
        payload,
        options,
      );

    return data;
  }
}
