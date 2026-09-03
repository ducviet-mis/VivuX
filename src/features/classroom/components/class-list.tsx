"use client";

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClassCard } from './class-card';
import { JoinClassDialog } from './join-class-dialog';
import { useClassroom } from '../hooks/use-classroom';
import { Search, Plus, Loader2 } from 'lucide-react';

export function ClassList() {
  const { classes, loading } = useClassroom();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm lớp học, giáo viên..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <JoinClassDialog>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Tham gia lớp mới
          </Button>
        </JoinClassDialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Đang tải lớp học...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">Chưa tham gia lớp học nào.</p>
          <p className="text-sm text-muted-foreground mt-2">Nhấn "Tham gia lớp mới" để bắt đầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClasses.map(cls => (
            <ClassCard key={cls.id} classroom={cls} status="active" />
          ))}
        </div>
      )}
    </div>
  );
}
