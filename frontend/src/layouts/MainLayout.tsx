import React from 'react';
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 w-full px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};
