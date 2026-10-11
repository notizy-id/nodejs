import type { Notizy } from '../core/notizy';
import type { CursorPage } from '../types/cursor-page';
import type {
  GetMessageResponse,
  ListMessagesOptions,
  ListMessagesResponse,
  Message,
} from './types';

export class Messages {
  constructor(private readonly notizy: Notizy) {}

  /** All messages of the organization, sent and received, newest first. */
  async list(options: ListMessagesOptions = {}): Promise<ListMessagesResponse> {
    return this.notizy.get<CursorPage<Message>>('/v1/messages', {
      query: options,
    });
  }

  /** One message with its delivery status and timestamps. */
  async get(id: string): Promise<GetMessageResponse> {
    return this.notizy.get<Message>(`/v1/messages/${encodeURIComponent(id)}`);
  }
}
