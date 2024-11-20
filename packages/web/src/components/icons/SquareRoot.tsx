import { HTMLAttributes, ReactElement } from 'react';

import { cn } from '~/lib';

export const SquareRoot = (
  props: HTMLAttributes<Element> & { height?: number },
): ReactElement => (
  <div
    className={`${cn(props.className)} relative`}
    style={{
      height: props.height,
      width:
        props.height === undefined
          ? undefined
          : Math.ceil((props.height * 2) / 5),
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 40 100"
      className="absolute top-0 right-0 left-0 bottom-0"
    >
      <path d="m 0,50 l 10,40 l 20,-80 l 10,0 l 0,-5 l -13.75,0 l -16.25,65 l -5,-20 z" />
    </svg>
  </div>
);
