import React, { useState, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EditorToolbar } from './EditorToolbar';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';

export interface MarkdownEditorProps {
  initialValue?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '# Welcome to Markdown Editor\n\nStart typing your markdown here...\n\n## Features\n\n- **Live Preview**: See your markdown rendered in real-time\n- **Syntax Highlighting**: Beautiful code highlighting\n- **Resizable Panels**: Adjust the layout to your preference\n- **Auto-save**: Your work is automatically saved\n\n```javascript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```\n\n> This is a blockquote example\n\n## Learn More\n\nVisit [Markdown Guide](https://www.markdownguide.org/) for comprehensive documentation.\n\nEnjoy writing!',
  className = '',
}) => {
  const [content, setContent] = useState(initialValue);
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [isDark, setIsDark] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('markdown-editor-content', content);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content]);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-editor-content');
    if (savedContent && savedContent !== initialValue) {
      setContent(savedContent);
    }
  }, [initialValue]);

  // Dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const renderMarkdown = (content: string) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props: any) {
          const { className, children } = props;
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          
          return !isInline ? (
            <SyntaxHighlighter
              style={isDark ? oneDark : oneLight}
              language={match[1]}
              PreTag="div"
              className="rounded-lg"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <EditorToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        wordCount={content.split(/\s+/).filter(word => word.length > 0).length}
      />
      
      <div className="flex-1 min-h-0">
        {viewMode === 'split' && (
          <PanelGroup direction="horizontal" className="h-full">
            <Panel defaultSize={50} minSize={30}>
              <EditorPane
                content={content}
                onChange={handleContentChange}
              />
            </Panel>
            <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors" />
            <Panel defaultSize={50} minSize={30}>
              <PreviewPane>
                {renderMarkdown(content)}
              </PreviewPane>
            </Panel>
          </PanelGroup>
        )}
        
        {viewMode === 'editor' && (
          <EditorPane
            content={content}
            onChange={handleContentChange}
          />
        )}
        
        {viewMode === 'preview' && (
          <PreviewPane>
            {renderMarkdown(content)}
          </PreviewPane>
        )}
      </div>
    </div>
  );
};