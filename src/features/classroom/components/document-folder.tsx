"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ResourceItem } from '../types';
import { Folder, FileText, Download, Trash2, ChevronRight, ChevronDown, ExternalLink, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DocumentFolderProps {
  name: string;
  items: ResourceItem[];
  isTeacher?: boolean;
  onDelete?: (id: string) => void;
}

export function DocumentFolder({ name, items, isTeacher, onDelete }: DocumentFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const classId = params?.classId as string;

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-2">
      <div 
        className="flex items-center gap-2 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform" /> : <ChevronRight className="w-4 h-4 text-muted-foreground transition-transform" />}
        <Folder className="w-4 h-4 text-primary" />
        <span className="font-medium text-sm flex-1">{name}</span>
        <span className="text-xs text-muted-foreground">{items.length} mục</span>
      </div>
      
      {isOpen && (
        <div className="divide-y divide-border bg-card">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 pl-8 hover:bg-muted/20 group">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.type === 'exam' && classId ? (
                  <Link href={`/classroom/${classId}/exam/${item.id}`}>
                    <Button variant="secondary" size="sm" className="h-6 text-xs px-2 py-0 gap-1 rounded-sm">
                      <PlayCircle className="w-3 h-3" /> Làm bài
                    </Button>
                  </Link>
                ) : (
                  <Link href={item.url} target="_blank" className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                
                {isTeacher && onDelete && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    title="Xóa tài liệu"
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
