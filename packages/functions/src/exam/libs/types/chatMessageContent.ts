export type ChatMessageContent =
  | {
      type: 'image_url';
      image_url: {
        url: string;
      };
    }
  | {
      type: 'text';
      text: string;
    };
