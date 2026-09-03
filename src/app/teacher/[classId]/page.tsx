'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useClassroomStore } from '@/features/classroom/stores/classroom-store';
import { ResourceSidebar } from '@/features/classroom/components/resource-sidebar';
import { AnnouncementBoard } from '@/features/classroom/components/announcement-board';
import { ScheduleCalendar } from '@/features/classroom/components/schedule-calendar';
import { AttendanceTable } from '@/features/classroom/components/attendance-table';
import { MonthlyReview } from '@/features/classroom/components/monthly-review';
import { PageHeader } from '@/components/shared/page-header';
import { ExamUploadForm } from '@/features/exam-setup/components/exam-upload-form';
import { TimeSetting } from '@/features/exam-setup/components/time-setting';
import { AnswerKeyInput } from '@/features/exam-setup/components/answer-key-input';
import { AnswerPreview } from '@/features/exam-setup/components/answer-preview';
import { useExamSetup } from '@/features/exam-setup/hooks/use-exam-setup';
import { FeeCalculator } from '@/features/tuition/components/fee-calculator';
import { BankInfoForm } from '@/features/tuition/components/bank-info-form';
import { Home, FolderOpen, FileQuestion, DollarSign, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClassSettings } from '@/features/classroom/components/class-settings';

type TabKey = 'home' | 'resources' | 'exam' | 'tuition' | 'settings';

export default function TeacherClassPage({ params }: { params: { classId: string } }) {
  const { addResource, addExam, resources } = useClassroomStore();
  const examSetup = useExamSetup();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examFolder, setExamFolder] = useState('');
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [classroom, setClassroom] = useState<{ id: string; name: string; studentCount: number } | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const existingFolders = Array.from(new Set(resources.map(r => r.folder))).filter(Boolean);

  useEffect(() => {
    async function loadClass() {
      setPageLoading(true);
      const supabase = (await import('@/lib/supabase/client')).getSupabaseClient();
      const { data: cls } = await supabase.from('classes').select('*').eq('id', params.classId).single();
      if (cls) {
        const { data: members } = await supabase.from('class_members').select('student_id, status, joined_at').eq('class_id', params.classId);
        
        let loadedStudents: any[] = [];
        if (members && members.length > 0) {
          const studentIds = members.map((m: any) => m.student_id);
          const { data: profiles } = await supabase.from('profiles').select('id, name, email').in('id', studentIds);
          
          const profileMap = new Map();
          if (profiles) {
            profiles.forEach((p: any) => {
              profileMap.set(p.id, { name: p.name || '', email: p.email || '' });
            });
          }
          
          loadedStudents = members.map((m: any) => ({
            id: m.student_id,
            name: profileMap.get(m.student_id)?.name || 'Học sinh',
            email: profileMap.get(m.student_id)?.email || '',
            status: m.status || 'active',
            joinedAt: m.joined_at || ''
          }));
        }
        
        setClassroom({ id: cls.id, name: cls.name, studentCount: loadedStudents.length });
        setStudents(loadedStudents);
      }
      setPageLoading(false);
    }
    loadClass();
  }, [params.classId]);

  if (pageLoading) {
    return (
      <div className="container py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Đang tải lớp học...</p>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Không tìm thấy lớp học</h2>
        <p className="text-muted-foreground">Lớp học này không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  const isTeacher = true;

  const handleSaveExam = async () => {
    if (!examTitle || !examFolder) return;
    const newExam = await examSetup.createExam();
    newExam.title = examTitle;
    newExam.classId = params.classId;
    addExam(newExam);
    
    addResource({
      id: newExam.id,
      title: examTitle,
      type: 'exam',
      url: `/classroom/${params.classId}/exam/${newExam.id}`,
      folder: examFolder,
      createdAt: new Date().toISOString()
    });
    
    setSaveDialogOpen(false);
    setExamTitle('');
    setExamFolder('');
    alert("Tạo đề thi thành công! Đã thêm vào Kho đề thi.");
  };

  const tabs = [
    { key: 'home' as TabKey, label: 'Trang chủ', icon: Home },
    { key: 'resources' as TabKey, label: 'Tài nguyên', icon: FolderOpen },
    { key: 'exam' as TabKey, label: 'Tạo đề thi', icon: FileQuestion },
    { key: 'tuition' as TabKey, label: 'Học phí', icon: DollarSign },
    { key: 'settings' as TabKey, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <PageHeader 
        title={`Quản lý lớp: ${classroom.name}`} 
        description={`${classroom.studentCount} học sinh`}
      />

      <div className="flex gap-6 mt-6">
        {/* Sidebar Navigation */}
        <div className="w-48 shrink-0">
          <nav className="sticky top-6 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 space-y-6">
          {activeTab === 'home' && (
            <>
              <AnnouncementBoard classId={classroom.id} isTeacher={isTeacher} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ScheduleCalendar classId={classroom.id} isTeacher={isTeacher} />
                </div>
                <div className="lg:col-span-2">
                  <AttendanceTable 
                    classId={classroom.id} 
                    students={students} 
                    isTeacher={isTeacher}
                  />
                </div>
              </div>

              <MonthlyReview students={students} isTeacher={isTeacher} />
            </>
          )}

          {activeTab === 'resources' && (
            <div className="max-w-4xl">
              <ResourceSidebar isTeacher={isTeacher} />
            </div>
          )}

          {activeTab === 'exam' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <ExamUploadForm 
                  pdfFile={examSetup.pdfFile}
                  setPdfFile={examSetup.setPdfFile}
                />
                <TimeSetting 
                  duration={examSetup.examConfig.durationMinutes || 45}
                  setDuration={examSetup.setDuration}
                />
              </div>
              <div className="space-y-6">
                <AnswerKeyInput 
                  answerType={examSetup.answerType || 'mcq'}
                  setAnswerType={examSetup.setAnswerType}
                  answerInput={examSetup.answerInput}
                  setAnswerInput={examSetup.setAnswerInput}
                  parseAnswers={examSetup.parseAnswers}
                  error={examSetup.parseError}
                />
                {examSetup.parsedAnswers.length > 0 && (
                  <AnswerPreview 
                    answers={examSetup.parsedAnswers}
                    onConfirm={() => setSaveDialogOpen(true)}
                    onUpdateAnswer={examSetup.updateAnswer}
                    onDeleteAnswer={examSetup.deleteAnswer}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'tuition' && (
            <div className="space-y-6">
              <FeeCalculator />
              <BankInfoForm />
            </div>
          )}

          {activeTab === 'settings' && (
            <ClassSettings classId={classroom.id} />
          )}
        </div>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu đề thi mới</DialogTitle>
            <DialogDescription>
              Nhập tên và chọn thư mục để lưu đề thi này vào kho tài liệu của lớp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên đề thi</Label>
              <Input 
                placeholder="VD: Đề kiểm tra 15 phút Toán 8" 
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Thư mục</Label>
              {!isNewFolder ? (
                <Select 
                  value={examFolder} 
                  onValueChange={(val) => {
                    if (val === '__new__') {
                      setIsNewFolder(true);
                      setExamFolder('');
                    } else {
                      setExamFolder(val);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thư mục..." />
                  </SelectTrigger>
                  <SelectContent>
                    {existingFolders.map(folder => (
                      <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                    ))}
                    <SelectItem value="__new__" className="text-primary font-medium">
                      ＋ Tạo thư mục mới
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Tên thư mục mới..." 
                    value={examFolder}
                    onChange={(e) => setExamFolder(e.target.value)}
                    autoFocus
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="shrink-0"
                    onClick={() => { setIsNewFolder(false); setExamFolder(''); }}
                  >
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSaveDialogOpen(false); setIsNewFolder(false); }}>Hủy</Button>
            <Button onClick={handleSaveExam} disabled={!examTitle || !examFolder}>Lưu đề thi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}