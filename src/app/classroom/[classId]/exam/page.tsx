import { PageHeader } from '@/components/shared/page-header';
import { mockExams } from '@/lib/mock-data/exams';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ExamListPage({ params }: { params: { classId: string } }) {
  // In real app, fetch exams by classId
  const exams = mockExams;

  return (
    <div className="container py-8">
      <PageHeader 
        title="Đề thi & Đề ôn tập" 
        description="Danh sách các bài thi và ôn tập cho lớp học"
      />

      {exams.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl bg-card border-dashed mt-8">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Chưa có đề thi nào</h3>
          <p className="text-muted-foreground">Giáo viên chưa tạo đề thi cho lớp học này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {exams.map(exam => (
            <Card key={exam.id} className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
              <CardHeader>
                <CardTitle className="line-clamp-2 leading-tight">{exam.title}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {new Date(exam.createdAt).toLocaleDateString('vi-VN')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-col space-y-3 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Thời gian: <span className="font-medium text-foreground">{exam.durationMinutes} phút</span></span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Số câu hỏi: <span className="font-medium text-foreground">{exam.answerKeys.length} câu</span></span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <Link href={`/classroom/${params.classId}/exam/${exam.id}`} className="w-full">
                  <Button className="w-full">Bắt đầu làm bài</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
