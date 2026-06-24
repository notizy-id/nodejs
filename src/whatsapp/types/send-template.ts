import type { Response } from '../../types/http';
import type { PostOptions } from '../../types/post-options';

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

type Header = HeaderText | HeaderImage | HeaderVideo | HeaderDocument;

type Button = {
  payload?: string;
  url?: string;
};

export interface SendWhatsAppTemplateMessageOptions {
  account_id: string;
  to: string;
  template: {
    name: string;
    language: string;
    header?: Header;
    body?: string[];
    buttons?: Array<Button>;
  };
}

export interface SendWhatsAppTemplateMessageRequestOptions
  extends PostOptions {}

export interface SendWhatsAppTemplateMessageResponseSuccess {
  id: string;
  status: 'PENDING';
  to: string;
  created_at: string;
  conversation_id: string;
}

export type SendWhatsAppTemplateMessageResponse =
  Response<SendWhatsAppTemplateMessageResponseSuccess>;
