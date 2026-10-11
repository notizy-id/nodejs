import type { Notizy } from '../core/notizy';
import type { CursorPage } from '../types/cursor-page';
import type {
  Broadcast,
  BroadcastResponse,
  CreateBroadcastOptions,
  CreateBroadcastResponse,
  CreatedBroadcast,
  ListBroadcastsOptions,
  ListBroadcastsResponse,
} from './types';

const path = (id: string) => `/v1/broadcasts/${encodeURIComponent(id)}`;

export class Broadcasts {
  constructor(private readonly notizy: Notizy) {}

  /**
   * Builds the recipients from your contacts and schedules the broadcast
   * (now, or at `scheduled_at`). Quota is reserved up front (402 if short).
   */
  async create(
    options: CreateBroadcastOptions,
  ): Promise<CreateBroadcastResponse> {
    return this.notizy.post<CreatedBroadcast>('/v1/broadcasts', options);
  }

  /** Newest first, with stats. */
  async list(
    options: ListBroadcastsOptions = {},
  ): Promise<ListBroadcastsResponse> {
    return this.notizy.get<CursorPage<Broadcast>>('/v1/broadcasts', {
      query: options,
    });
  }

  /** With live stats. */
  async get(id: string): Promise<BroadcastResponse> {
    return this.notizy.get<Broadcast>(path(id));
  }

  /** Stops a scheduled, sending or paused broadcast; unsent quota is refunded. */
  async cancel(id: string): Promise<BroadcastResponse> {
    return this.notizy.post<Broadcast>(`${path(id)}/cancel`);
  }
}
