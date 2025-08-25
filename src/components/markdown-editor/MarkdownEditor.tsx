import React, { useState, useEffect, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { EditorToolbar } from './EditorToolbar';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface MarkdownEditorProps {
  initialValue?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '# Welcome to Markdown Editor\n\nStart typing your markdown here...\n\n## Features\n\n- **Live Preview**: See your markdown rendered in real-time\n- **Syntax Highlighting**: Beautiful code highlighting\n- **Resizable Panels**: Adjust the layout to your preference\n- **Auto-save**: Your work is automatically saved\n\n```javascript\nconst greeting = "Hello, World!";\nconsole.log(greeting);\n```\n\n> This is a blockquote example\n\n## Learn More\n\nVisit [Markdown Guide](https://www.markdownguide.org/) for comprehensive documentation.\n\nEnjoy writing!',
  className = '',
}) => {
  const [content, setContent] = useState(initialValue);
  const [textContent, setTextContent] = useState('Welcome to Text-to-Markdown Converter!\n\nPaste or type your text here and see it converted to markdown format in real-time.\n\nThis tool will automatically:\n- Convert paragraphs\n- Detect and format headings\n- Preserve line breaks\n- Handle lists and other formatting\n\nTry pasting some text to see the magic happen!');
  const [viewMode, setViewMode] = useState<'editor' | 'preview' | 'split'>('split');
  const [editorMode, setEditorMode] = useState<'markdown' | 'text-to-markdown'>('markdown');
  const [isDark, setIsDark] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('markdown-editor-content', content);
      localStorage.setItem('text-to-markdown-content', textContent);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, textContent]);

  // Load saved content on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('markdown-editor-content');
    const savedTextContent = localStorage.getItem('text-to-markdown-content');
    
    if (savedContent && savedContent !== initialValue) {
      // Clear saved content to show the new initial value with link
      localStorage.removeItem('markdown-editor-content');
      setContent(initialValue);
    }
    
    if (savedTextContent) {
      setTextContent(savedTextContent);
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

  const handleTextContentChange = useCallback((newTextContent: string) => {
    setTextContent(newTextContent);
  }, []);

  const convertTextToMarkdown = useCallback((text: string): string => {
    if (!text.trim()) return '';
    
    let markdown = text
      // Convert double line breaks to paragraph breaks
      .split('\n\n')
      .map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';
        
        // Check if it looks like a heading (starts with caps, short, no punctuation at end)
        if (trimmed.length < 80 && /^[A-Z]/.test(trimmed) && !/[.!?]$/.test(trimmed) && !trimmed.includes('\n')) {
          return `## ${trimmed}`;
        }
        
        // Handle lists (lines starting with - or numbers)
        if (trimmed.includes('\n')) {
          const lines = trimmed.split('\n');
          const processedLines = lines.map(line => {
            const trimmedLine = line.trim();
            if (/^-\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
              return trimmedLine;
            }
            if (trimmedLine && lines.indexOf(line) > 0 && /^[A-Z]/.test(trimmedLine) && trimmedLine.length < 80) {
              return `- ${trimmedLine}`;
            }
            return trimmedLine;
          });
          return processedLines.join('\n');
        }
        
        return trimmed;
      })
      .filter(p => p)
      .join('\n\n');
    
    return markdown;
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
      <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as 'markdown' | 'text-to-markdown')} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
          <TabsTrigger value="text-to-markdown">Text to Markdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="markdown" className="flex-1 flex flex-col min-h-0">
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
        </TabsContent>
        
        <TabsContent value="text-to-markdown" className="flex-1 flex flex-col min-h-0">
          <EditorToolbar
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExport={() => {
              const markdown = convertTextToMarkdown(textContent);
              const blob = new Blob([markdown], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'converted-markdown.md';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            wordCount={textContent.split(/\s+/).filter(word => word.length > 0).length}
          />
          
          <div className="flex-1 min-h-0">
            {viewMode === 'split' && (
              <PanelGroup direction="horizontal" className="h-full">
                <Panel defaultSize={50} minSize={30}>
                  <EditorPane
                    content={textContent}
                    onChange={handleTextContentChange}
                  />
                </Panel>
                <PanelResizeHandle className="w-2 bg-border hover:bg-accent transition-colors" />
                <Panel defaultSize={50} minSize={30}>
                  <PreviewPane>
                    <pre className="whitespace-pre-wrap font-mono text-sm">{convertTextToMarkdown(textContent)}</pre>
                  </PreviewPane>
                </Panel>
              </PanelGroup>
            )}
            
            {viewMode === 'editor' && (
              <EditorPane
                content={textContent}
                onChange={handleTextContentChange}
              />
            )}
            
            {viewMode === 'preview' && (
              <PreviewPane>
                <pre className="whitespace-pre-wrap font-mono text-sm">{convertTextToMarkdown(textContent)}</pre>
              </PreviewPane>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};