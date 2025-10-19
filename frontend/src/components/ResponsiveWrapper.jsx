import React from 'react';
import { useMediaQuery } from 'react-responsive';

const ResponsiveWrapper = ({ children }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  
  return (
    <div 
      style={{
        padding: isMobile ? '8px' : '24px',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
};

export default ResponsiveWrapper;