// C:\Users\steph\thebloodroom\app\lib\types.ts

export type Chamber = "queen" | "princess" | "king" | "workroom";

export type Attachment = {
  name?: string;
  path: string;
  type?: string;
  url?: string;
  thumbUrl?: string;
};

export type SmsResult = {
  recipient: string;
  to?: string;
  sid?: string;
  error?: string;
};

export type Message = {
  id: string;
  chamber: Chamber;
  author?: string;
  recipients?: string[];
  content?: string;
  content_html?: string;
  attachments?: Attachment[];
  createdAt?: string;
  smsResults?: SmsResult[];
};
