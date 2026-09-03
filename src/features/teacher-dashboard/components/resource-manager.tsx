'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Video, FileQuestion, Plus, Trash2 } from "lucide-react";

export const ResourceManager = () => {
  const sections = [
    { title: 'Tài liệu', icon: FileText, items: [{ title: 'Đề cương ôn tập HK1', date: '10/10/2023' }] },
    { title: 'Video', icon: Video, items: [{ title: 'Bài giảng Phương trình bậc 2', date: '12/10/2023' }] },
    { title: 'Đề thi', icon: FileQuestion, items: [{ title: 'Đề thi thử lần 1', date: '15/10/2023' }] },
  ];

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Quản lý Tài nguyên</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map(sec => (
            <div key={sec.title} className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <sec.icon className="w-4 h-4 text-primary" /> {sec.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {sec.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {sec.items.length === 0 && <p className="text-sm text-muted-foreground italic">Chưa có dữ liệu</p>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};