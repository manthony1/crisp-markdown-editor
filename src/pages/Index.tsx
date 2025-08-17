import React from 'react';
import { MarkdownEditor } from '@/components/markdown-editor';

const Index = () => {
  return (
    <div className="h-screen bg-background">
      <MarkdownEditor className="animate-fade-in" />
    </div>
  );
};

export default Index;
