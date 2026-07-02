import React from 'react';
import { Helmet } from 'react-helmet-async';

export const useDocumentTitle = (title: string) => {
  React.useEffect(() => {
    document.title = `${title} | SISPNAIST`;
  }, [title]);
};

export const DocumentTitle: React.FC<{ title: string }> = ({ title }) => (
  <Helmet>
    <title>{title}</title>
  </Helmet>
);
