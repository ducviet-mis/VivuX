'use client';

import { AnswerKey } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface AnswerPreviewProps {
  answers: AnswerKey[];
  onConfirm: () => void;
  onUpdateAnswer?: (questionNumber: number, newAnswer: string) => void;
  onDeleteAnswer?: (questionNumber: number) => void;
}

export function AnswerPreview({ answers, onConfirm, onUpdateAnswer, onDeleteAnswer }: AnswerPreviewProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (questionNumber: number, currentAnswer: string) => {
    setEditingId(questionNumber);
    setEditValue(currentAnswer);
  };

  const handleSave = (questionNumber: number) => {
    if (onUpdateAnswer && editValue.trim() !== '') {
      onUpdateAnswer(questionNumber, editValue.trim().toUpperCase());
    }
    setEditingId(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mcq': return 'Trắc nghiệm';
      case 'tf': return 'Đúng/Sai';
      case 'short': return 'Điền từ';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Xem trước đáp án</h3>
        <Badge variant="secondary">Tổng số: {answers.length} câu</Badge>
      </div>

      <div className="border rounded-md overflow-hidden bg-card">
        <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 border-b font-medium text-sm text-muted-foreground">
          <div className="col-span-1 text-center">Câu</div>
          <div className="col-span-1">Đáp án</div>
          <div className="col-span-1">Loại</div>
          <div className="col-span-1 text-right">Thao tác</div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {answers.map((answer) => (
            <div key={answer.questionNumber} className="grid grid-cols-4 gap-4 p-3 border-b last:border-0 items-center text-sm hover:bg-muted/30">
              <div className="col-span-1 text-center font-medium">{answer.questionNumber}</div>
              
              <div className="col-span-1">
                {editingId === answer.questionNumber ? (
                  <Input 
                    size={4} 
                    className="h-8 w-20" 
                    value={editValue} 
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave(answer.questionNumber);
                    }}
                  />
                ) : (
                  <span className="font-bold text-primary">{answer.answer}</span>
                )}
              </div>
              
              <div className="col-span-1">
                <Badge variant="outline" className="text-xs font-normal">
                  {getTypeLabel(answer.type)}
                </Badge>
              </div>
              
              <div className="col-span-1 flex justify-end gap-1">
                {editingId === answer.questionNumber ? (
                  <Button variant="ghost" size="sm" onClick={() => handleSave(answer.questionNumber)} className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(answer.questionNumber, answer.answer)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {onDeleteAnswer && (
                      <Button variant="ghost" size="sm" onClick={() => onDeleteAnswer(answer.questionNumber)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={onConfirm} className="w-full mt-4" size="lg">
        Xác nhận & Tạo đề thi
      </Button>
    </div>
  );
}
