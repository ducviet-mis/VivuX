"use client";

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading2, Heading3, Quote, ImageIcon, LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Bắt đầu viết nội dung ở đây...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        className: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadHandbookImage } = await import('@/features/handbook/utils/upload');
      const url = await uploadHandbookImage(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập đường dẫn liên kết:', previousUrl);
    
    if (url === null) {
      return; // cancelled
    }
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('bold') && "bg-muted text-primary font-bold")}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('italic') && "bg-muted text-primary")}
        >
          <Italic className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("h-8 px-2 font-bold", editor.isActive('heading', { level: 2 }) && "bg-muted text-primary")}
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("h-8 px-2 font-semibold", editor.isActive('heading', { level: 3 }) && "bg-muted text-primary")}
        >
          H3
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("h-8 w-8 p-0", editor.isActive('blockquote') && "bg-muted text-primary")}
        >
          <Quote className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={setLink}
          className={cn("h-8 w-8 p-0", editor.isActive('link') && "bg-muted text-primary")}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          disabled={isUploading}
          className="h-8 w-8 p-0"
        >
          {isUploading ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </Button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Editor Content */}
      <EditorContent editor={editor} />
      
      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          box-shadow: none !important;
        }
        .ProseMirror:focus {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem auto;
          display: block;
        }
        .ProseMirror blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          font-style: italic;
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}
