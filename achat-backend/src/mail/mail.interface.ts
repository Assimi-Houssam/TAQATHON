export interface Mail {
    from?: string;
    to: string;
    subject: string;
    html: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }[];
  }
  