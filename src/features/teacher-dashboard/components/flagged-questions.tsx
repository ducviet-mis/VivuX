'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, CheckCircle2, Clock } from "lucide-react";
import { useTeacherDashboard } from "../hooks/use-teacher-dashboard";
import { useState } from "react";

export const FlaggedQuestions = () => {
  const { flaggedQuestions: initialFlags } = useTeacherDashboard();
  const [flags, setFlags] = useState(initialFlags);

  const handleDismiss = (id: string, qNum: number) => {
    setFlags(flags.filter(f => !(f.examId === id && f.questionNumber === qNum)));
  };

  const grouped = flags.reduce((acc, curr) => {
    if (!acc[curr.examTitle]) acc[curr.examTitle] = [];
    acc[curr.examTitle].push(curr);
    return acc;
  }, {} as Record<string, typeof initialFlags>);

  return (
    <Card id="flagged-questions" className="rounded-2xl border border-border bg-card shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Flag className="w-5 h-5 text-red-500" />
          Câu hỏi cần giải đáp
          <Badge variant="destructive" className="ml-auto">{flags.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flags.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3 opacity-50" />
            <p>Không có câu hỏi nào cần giải đáp.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([exam, items]) => (
              <div key={exam} className="space-y-3">
                <h4 className="font-semibold text-primary">{exam}</h4>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="font-medium">Câu {item.questionNumber} <span className="text-muted-foreground font-normal text-sm ml-2">- {item.studentName}</span></p>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" /> {new Date(item.flaggedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleDismiss(item.examId, item.questionNumber)}>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Đã giải đáp
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};