"use client";

import { useState } from 'react';
import { ResourceItem } from '../types';
import { Folder, Youtube, ExternalLink, Trash2, ChevronRight, ChevronDown, Video } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VideoFolderProps {
  name: string;
  items: ResourceItem[];
  isTeacher?: boolean;
  onDelete?: (id: string) => void;
}

export function VideoFolder({ name, items, isTeacher, onDelete }: VideoFolderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-2">
      <div 
        className="flex items-center gap-2 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" /> : <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />}
        <Folder className="w-4 h-4 text-red-500" />
        <span className="font-medium text-sm flex-1">{name}</span>
        <span className="text-xs text-muted-foreground">{items.length} mục</span>
      </div>
      
      {isOpen && (
        <div className="divide-y divide-border bg-card">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 pl-8 hover:bg-muted/20 group">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <Video className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-sm truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Link href={item.url} target="_blank" className="text-muted-foreground hover:text-primary">
                  <ExternalLink className="w-4 h-4" />
                </Link>
                {isTeacher && onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="p-3 pl-8 text-sm text-muted-foreground italic">
              Thư mục trống
            </div>
          )}
        </div>
      )}
    </div>
  );
}
