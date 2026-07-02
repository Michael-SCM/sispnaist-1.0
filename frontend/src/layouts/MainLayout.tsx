import React from 'react';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { SkipLink } from '../components/SkipLink.js';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <div className="print:hidden">
        <SkipLink />
        <Header />
      </div>
      <main id="main-content" className="flex-1 w-full px-4 py-8" tabIndex={-1}>
        {children}
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};
