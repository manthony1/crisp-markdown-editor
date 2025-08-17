import React, { useCallback, useRef, useEffect } from 'react';

export interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  content,
  onChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd } = textarea;

    // Tab support for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const newContent = content.substring(0, selectionStart) + '  ' + content.substring(selectionEnd);
      onChange(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
      }, 0);
    }

    // Enter key enhancements for lists
    if (e.key === 'Enter') {
      const lines = content.substring(0, selectionStart).split('\n');
      const currentLine = lines[lines.length - 1];
      
      // Check for list patterns
      const bulletMatch = currentLine.match(/^(\s*)([-*+])\s/);
      const numberedMatch = currentLine.match(/^(\s*)(\d+\.)\s/);
      
      if (bulletMatch) {
        e.preventDefault();
        const [, indent, bullet] = bulletMatch;
        const newContent = content.substring(0, selectionStart) + '\n' + indent + bullet + ' ' + content.substring(selectionEnd);
        onChange(newContent);
        
        setTimeout(() => {
          const newPosition = selectionStart + indent.length + bullet.length + 2;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      } else if (numberedMatch) {
        e.preventDefault();
        const [, indent] = numberedMatch;
        const nextNumber = parseInt(numberedMatch[2]) + 1;
        const newContent = content.substring(0, selectionStart) + '\n' + indent + nextNumber + '. ' + content.substring(selectionEnd);
        onChange(newContent);
        
        setTimeout(() => {
          const newPosition = selectionStart + indent.length + String(nextNumber).length + 3;
          textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
      }
    }
  }, [content, onChange]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="h-full flex">
      {/* Line numbers */}
      <div className="editor-gutter min-w-[60px] p-4 text-right text-sm font-mono flex-shrink-0">
        {content.split('\n').map((_, index) => (
          <div key={index} className="h-6 leading-6">
            {index + 1}
          </div>
        ))}
      </div>
      
      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="editor-container w-full h-full p-4 resize-none border-0 outline-none text-sm leading-6 font-mono"
          placeholder="Start typing your markdown here..."
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          style={{
            minHeight: '100%',
            lineHeight: '1.5rem',
          }}
        />
      </div>
    </div>
  );
};