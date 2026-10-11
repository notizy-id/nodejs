import type { Notizy } from '../core/notizy';
import type {
  Contact,
  ContactInput,
  ContactPage,
  ContactResponse,
  ListContactsOptions,
  ListContactsResponse,
  RemoveContactResponse,
} from './types';

const path = (id: string) => `/v1/contacts/${encodeURIComponent(id)}`;

export class Contacts {
  constructor(private readonly notizy: Notizy) {}

  /** Newest first. */
  async list(options: ListContactsOptions = {}): Promise<ListContactsResponse> {
    const { tags, subscribed, ...rest } = options;
    return this.notizy.get<ContactPage>('/v1/contacts', {
      query: {
        ...rest,
        tags: tags?.join(','),
        subscribed: subscribed === undefined ? undefined : String(subscribed),
      },
    });
  }

  async get(id: string): Promise<ContactResponse> {
    return this.notizy.get<Contact>(path(id));
  }

  /**
   * Creates the contact, or updates the one with the same phone number
   * (only the fields sent change). Counts toward the plan's contact limit.
   */
  async upsert(contact: ContactInput): Promise<ContactResponse> {
    return this.notizy.post<Contact>('/v1/contacts', contact);
  }

  /** Changes only the fields sent; tags/attributes replace the old value. */
  async update(
    id: string,
    changes: Partial<ContactInput>,
  ): Promise<ContactResponse> {
    return this.notizy.patch<Contact>(path(id), changes);
  }

  async remove(id: string): Promise<RemoveContactResponse> {
    return this.notizy.delete<{ id: string; deleted: true }>(path(id));
  }

  /** Adds and/or removes tags, keeping the others. */
  async updateTags(
    id: string,
    tags: { add?: string[]; remove?: string[] },
  ): Promise<ContactResponse> {
    return this.notizy.post<Contact>(`${path(id)}/tags`, tags);
  }

  /** Unsubscribes from broadcasts (`false` to resubscribe). */
  async optOut(id: string, optedOut = true): Promise<ContactResponse> {
    return this.notizy.post<Contact>(`${path(id)}/opt-out`, {
      opted_out: optedOut,
    });
  }
}
