import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import MobileLayout from './MobileLayout';

const ResponsiveLayout = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <Layout>{children}</Layout>
  );
};

export default ResponsiveLayout;