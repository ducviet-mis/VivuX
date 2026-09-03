'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassroomStore } from '../stores/classroom-store';
import { DocumentFolder } from './document-folder';
import { VideoFolder } from './video-folder';
import { Plus, Check, X, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ResourceSidebarProps {
  isTeacher?: boolean;
}

export function ResourceSidebar({ isTeacher = false }: ResourceSidebarProps) {
  const { resources, addResource, removeResource } = useClassroomStore();
  const [addingTo, setAddingTo] = useState<'document' | 'video' | 'exam' | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [inputType, setInputType] = useState<'url' | 'file'>('url');
  const [file, setFile] = useState<File | null>(null);

  const documents = resources.filter(r => r.type === 'document');
  const videos = resources.filter(r => r.type === 'video');
  const exams = resources.filter(r => r.type === 'exam');

  const docFolders = Array.from(new Set(documents.map(d => d.folder)));
  const vidFolders = Array.from(new Set(videos.map(v => v.folder)));
  const examFolders = Array.from(new Set(exams.map(e => e.folder)));

  const handleDelete = (id: string) => {
    removeResource(id);
  };

  const handleSave = (type: 'document' | 'video' | 'exam') => {
    const finalUrl = inputType === 'file' && file ? URL.createObjectURL(file) : newUrl;
    if (newTitle && (finalUrl || inputType === 'file') && newFolder) {
      addResource({
        id: Math.random().toString(),
        title: newTitle,
        type: type,
        url: finalUrl || '#',
        folder: newFolder,
        createdAt: new Date().toISOString()
      });
      setAddingTo(null);
      setNewTitle('');
      setNewUrl('');
      setNewFolder('');
      setFile(null);
      setInputType('url');
    }
  };

  const renderAddForm = (type: 'document' | 'video' | 'exam', existingFolders: string[]) => {
    if (addingTo !== type) return null;
    return (
      <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3 border border-border">
        <div className="space-y-1">
          <Label className="text-xs">Tên tài nguyên</Label>
          <Input 
            placeholder="VD: Bài giảng số 1..." 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)}
            className="h-8 text-sm bg-background"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Thư mục</Label>
          <Select value={existingFolders.includes(newFolder) ? newFolder : 'new'} onValueChange={(val) => {
            if (val !== 'new') setNewFolder(val);
            else setNewFolder('');
          }}>
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Chọn thư mục..." />
            </SelectTrigger>
            <SelectContent>
              {existingFolders.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
              <SelectItem value="new">+ Thư mục mới</SelectItem>
            </SelectContent>
          </Select>
          {!existingFolders.includes(newFolder) && (
            <Input 
              placeholder="Nhập tên thư mục mới..." 
              value={newFolder} 
              onChange={e => setNewFolder(e.target.value)}
              className="h-8 text-sm bg-background mt-2"
            />
          )}
        </div>

        {(type === 'document' || type === 'exam') && (
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-1">
                <Button 
                  variant={inputType === 'url' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-6 text-xs px-2"
                  onClick={() => setInputType('url')}
                >
                  Link URL
                </Button>
                <Button 
                  variant={inputType === 'file' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="h-6 text-xs px-2"
                  onClick={() => setInputType('file')}
                >
                  Tải file
                </Button>
             </div>
             {inputType === 'url' ? (
                <Input 
                  placeholder="Đường dẫn (URL)..." 
                  value={newUrl} 
                  onChange={e => setNewUrl(e.target.value)}
                  className="h-8 text-sm bg-background"
                />
             ) : (
                <Input 
                  type="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  className="h-8 text-sm bg-background text-muted-foreground file:text-foreground file:mr-2 file:py-0 file:h-full file:bg-muted file:border-0 file:rounded-sm"
                />
             )}
          </div>
        )}

        {type === 'video' && (
          <div className="space-y-1">
            <Label className="text-xs">Đường dẫn Video (URL)</Label>
            <Input 
              placeholder="VD: https://youtube.com/..." 
              value={newUrl} 
              onChange={e => setNewUrl(e.target.value)}
              className="h-8 text-sm bg-background"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => {
            setAddingTo(null);
            setNewTitle('');
            setNewUrl('');
            setNewFolder('');
            setFile(null);
          }}>
            Hủy
          </Button>
          <Button variant="default" size="sm" className="h-7 px-3" onClick={() => handleSave(type)} disabled={!newTitle || !newFolder || (inputType === 'url' && !newUrl) || (inputType === 'file' && !file)}>
            Lưu
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Tài nguyên lớp học</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Kho tài liệu</h3>
            {isTeacher && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => setAddingTo('document')}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          {docFolders.length > 0 ? docFolders.map(folder => (
            <DocumentFolder key={folder} name={folder} items={documents.filter(d => d.folder === folder)} isTeacher={isTeacher} onDelete={handleDelete} />
          )) : <p className="text-sm text-muted-foreground italic">Chưa có tài liệu</p>}
          {renderAddForm('document', docFolders)}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Kho video</h3>
            {isTeacher && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => setAddingTo('video')}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          {vidFolders.length > 0 ? vidFolders.map(folder => (
            <VideoFolder key={folder} name={folder} items={videos.filter(v => v.folder === folder)} isTeacher={isTeacher} onDelete={handleDelete} />
          )) : <p className="text-sm text-muted-foreground italic">Chưa có video</p>}
          {renderAddForm('video', vidFolders)}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-muted-foreground uppercase">Kho đề thi</h3>
            {isTeacher && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" onClick={() => setAddingTo('exam')}>
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
          {examFolders.length > 0 ? examFolders.map(folder => (
            <DocumentFolder key={folder} name={folder} items={exams.filter(e => e.folder === folder)} isTeacher={isTeacher} onDelete={handleDelete} />
          )) : <p className="text-sm text-muted-foreground italic">Chưa có đề thi</p>}
          {renderAddForm('exam', examFolders)}
        </div>
      </CardContent>
    </Card>
  );
}
