"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentInClass } from '../types';
import { useClassroomStore } from '../stores/classroom-store';
import { useAuthStore } from '@/features/auth/stores/auth-store';
import { Save, Edit } from 'lucide-react';

interface MonthlyReviewProps {
  students: StudentInClass[];
  isTeacher?: boolean;
}

export function MonthlyReview({ students, isTeacher = false }: MonthlyReviewProps) {
  const { monthlyReviews, addMonthlyReview } = useClassroomStore();
  const { user } = useAuthStore();
  
  // Teacher: select first student. Student: use their own ID
  const defaultStudentId = isTeacher ? (students[0]?.id || '') : (user?.id || '');
  
  const [selectedStudent, setSelectedStudent] = useState<string>(defaultStudentId);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const currentReview = monthlyReviews.find(r => r.studentId === selectedStudent && r.month === selectedMonth);

  useEffect(() => {
    if (!isTeacher && user?.id) {
      setSelectedStudent(user.id);
    }
  }, [isTeacher, user?.id]);

  useEffect(() => {
    if (currentReview) {
      setContent(currentReview.content);
      setIsSaved(true);
    } else {
      setContent('');
      setIsSaved(false);
    }
  }, [currentReview, selectedStudent, selectedMonth]);

  const handleStudentChange = (val: string) => {
    setSelectedStudent(val);
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
  };

  const handleSave = () => {
    if (selectedStudent && selectedMonth && content.trim()) {
      addMonthlyReview({ studentId: selectedStudent, month: selectedMonth, content });
      setIsSaved(true);
    }
  };

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().substring(0, 7);
  });

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Nhận xét tháng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          {isTeacher && (
            <Select value={selectedStudent} onValueChange={handleStudentChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn học sinh" />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>Tháng {m.split('-')[1]}/{m.split('-')[0]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isTeacher ? (
          <div className="space-y-2 flex flex-col">
            {isSaved && currentReview ? (
              <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg min-h-[100px] border border-border">
                <p className="whitespace-pre-wrap text-foreground/90">{content}</p>
              </div>
            ) : (
              <Textarea 
                placeholder="Nhập nhận xét..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-background"
              />
            )}
            
            <div className="self-end">
              {isSaved && currentReview ? (
                <Button onClick={() => setIsSaved(false)} variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa nhận xét
                </Button>
              ) : (
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu nhận xét
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 dark:bg-muted/20 p-4 rounded-lg min-h-[100px] border border-border">
            {currentReview ? (
              <p className="whitespace-pre-wrap text-foreground/90">{currentReview.content}</p>
            ) : (
              <p className="text-muted-foreground italic">Chưa có nhận xét cho tháng này.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
