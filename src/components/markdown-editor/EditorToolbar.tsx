import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Edit3, 
  PanelLeftClose, 
  Download, 
  FileText,
  Type,
  Hash,
  MoreHorizontal 
} from 'lucide-react';

export interface EditorToolbarProps {
  viewMode: 'editor' | 'preview' | 'split';
  onViewModeChange: (mode: 'editor' | 'preview' | 'split') => void;
  onExport: () => void;
  wordCount: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onExport,
  wordCount,
}) => {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-card">
      {/* Left side - View controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('split')}
          className="toolbar-button"
        >
          <PanelLeftClose className="h-4 w-4 mr-2" />
          Split
        </Button>
        <Button
          variant={viewMode === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('editor')}
          className="toolbar-button"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Editor
        </Button>
        <Button
          variant={viewMode === 'preview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('preview')}
          className="toolbar-button"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-2" />
        
        {/* Quick formatting */}
        <Button
          variant="ghost"
          size="sm"
          className="toolbar-button"
          title="Bold"
        >
          <Type className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="toolbar-button"
          title="Heading"
        >
          <Hash className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="toolbar-button"
          title="More formatting"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Right side - Stats and actions */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <span>{wordCount} words</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-subtle"></div>
            Auto-saved
          </span>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="toolbar-button"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};