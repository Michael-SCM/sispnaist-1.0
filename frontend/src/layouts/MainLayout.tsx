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
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1 w-full px-4 py-8" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
};
