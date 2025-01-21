export type FormattedStatement =
  | {
      id: string;
      type: 'statement';
      text: string;
    }
  | {
      id: string;
      type: 'question';
      text: string;
      index: number;
      numberOfLines: number;
    };
