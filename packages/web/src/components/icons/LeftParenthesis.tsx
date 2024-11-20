import { HTMLAttributes, ReactElement } from 'react';

import { cn } from '~/lib';

export const LeftParenthesis = (
  props: HTMLAttributes<Element> & { height?: number },
): ReactElement => (
  <div
    className={`${cn(props.className)} relative`}
    style={{
      height: props.height,
      width:
        props.height === undefined ? undefined : Math.ceil(props.height / 5),
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 20 100"
      className="absolute top-0 right-0 left-0 bottom-0"
    >
      <path d="m 15,10 q -20,40 0,80 q -10,-40 0,-80 z" />
    </svg>
  </div>
);
