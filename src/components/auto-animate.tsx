import { useAutoAnimate } from '@formkit/auto-animate/react';
import React, { ElementType, HTMLAttributes } from 'react';

interface AutoAnimateProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
}

const AutoAnimate: React.FC<AutoAnimateProps> = ({
  as: Tag = 'div',
  children,
  ...rest
}) => {
  const [ref] = useAutoAnimate<HTMLUListElement>();

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
};

export default AutoAnimate;
