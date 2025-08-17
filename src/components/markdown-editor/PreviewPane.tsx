import React from 'react';

export interface PreviewPaneProps {
  children: React.ReactNode;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({ children }) => {
  return (
    <div className="preview-container h-full overflow-auto">
      <div className="preview-content max-w-none p-6">
        {children}
      </div>
    </div>
  );
};