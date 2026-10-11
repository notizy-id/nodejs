import type { Notizy } from '../core/notizy';
import type { Response } from '../types/http';

export interface UploadMediaOptions {
  account_id: string;
  /** File or Blob, max 100MB (WhatsApp: images 5MB, audio/video 16MB). */
  file: Blob;
  /** Needed when `file` is a Blob without a name. */
  filename?: string;
}

export interface UploadedMedia {
  /** Pass as `media_id` when sending. */
  media_id: string;
  /** Public URL; pass as `url` when sending. */
  url: string;
}

export type UploadMediaResponse = Response<UploadedMedia>;

export class Media {
  constructor(private readonly notizy: Notizy) {}

  /** Upload once, then send it with its `media_id` and `url`. */
  async upload(options: UploadMediaOptions): Promise<UploadMediaResponse> {
    const form = new FormData();
    form.set('account_id', options.account_id);
    const name =
      options.filename ??
      ('name' in options.file ? (options.file as File).name : 'file');
    form.set('file', options.file, name);
    return this.notizy.postForm<UploadedMedia>('/v1/media', form);
  }
}
