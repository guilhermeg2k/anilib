import { useAutoAnimate } from '@formkit/auto-animate/react';
import React, { ElementType, HTMLAttributes } from 'react';

type AutoAnimateProps = {
  as?: ElementType;
} & HTMLAttributes<HTMLUListElement>;

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
