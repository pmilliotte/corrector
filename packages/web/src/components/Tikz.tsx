import { ReactElement, useEffect, useRef } from 'react';

import { Skeleton } from './ui';

type TikzProps = {
  tikz: string;
  packages?: readonly string[];
};

export const Tikz = ({ tikz, packages }: TikzProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');

    script.type = 'text/tikz';
    script.innerText = tikz;
    packages !== undefined &&
      script.setAttribute(
        'data-tex-packages',
        `{${packages.map(pkg => `"${pkg}":""`).join(',')}}`,
      );

    const currentRef = ref.current;
    if (currentRef !== null) {
      currentRef.replaceChild(script, currentRef.firstChild as Node);
    }
  }, [ref, tikz, packages]);

  return (
    <div className="w-full flex items-center justify-around p-2">
      <div
        ref={ref}
        className="flex items-center justify-around p-1 w-full md:w-3/4 max-w-[400px]"
      >
        <div className="w-full pt-[100%] relative">
          <Skeleton className="absolute top-0 right-0 left-0 bottom-0 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
