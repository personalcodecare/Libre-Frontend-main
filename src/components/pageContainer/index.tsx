import { ReactNode, FC } from 'react';

type PageContainerProps = {
  children: ReactNode;
};

export const PageContainer: FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="container h-full flex-grow px-8 py-8 m-auto mobile:px-4">
      {children}
    </div>
  );
};
