export type ChatMessageContent =
  | {
      type: 'image_url';
      image_url: {
        url: string;
        detail?: 'high' | 'low';
      };
    }
  | {
      type: 'text';
      text: string;
    };
