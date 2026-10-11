import type { Response } from '../../types/http';
import type { IdempotentRequest } from '../../types/idempotent-request';
import type { PostOptions } from '../../types/post-options';
import type { QueuedMessage } from './send-message';

type HeaderText = {
  type: 'text';
  values?: string[];
};
type HeaderImage = {
  type: 'image';
  url: string;
};
type HeaderVideo = {
  type: 'video';
  url: string;
};
type HeaderDocument = {
  type: 'document';
  url: string;
  filename?: string;
};
type HeaderLocation = {
  type: 'location';
  url: string;
};

type Header =
  | HeaderText
  | HeaderImage
  | HeaderVideo
  | HeaderDocument
  | HeaderLocation;

type Button = {
  /** Quick reply payload. */
  payload?: string;
  /** Dynamic URL suffix. */
  url?: string;
};

type CarouselCard = {
  header?: { type: 'image' | 'video'; url: string };
  body?: string[];
  buttons?: Button[];
};

export type TemplatePayload = {
  name: string;
  language: string;
  header?: Header;
  /** Body variables in order: {{1}}, {{2}}… */
  body?: string[];
  buttons?: Array<Button>;
  cards?: CarouselCard[];
};

export interface SendWhatsAppTemplateMessageOptions {
  account_id: string;
  to: string;
  template: TemplatePayload;
}

export interface SendWhatsAppTemplateMessageRequestOptions
  extends PostOptions,
    IdempotentRequest {}

export type SendWhatsAppTemplateMessageResponseSuccess = QueuedMessage;

export type SendWhatsAppTemplateMessageResponse =
  Response<SendWhatsAppTemplateMessageResponseSuccess>;
