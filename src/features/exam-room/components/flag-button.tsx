'use client';

import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FlagButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export function FlagButton({ isActive, onClick }: FlagButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label="Đánh dấu câu cần hỏi gia sư"
            aria-pressed={isActive}
            className={cn(
              "rounded-md transition-colors w-11 h-11",
              isActive
                ? "bg-destructive-soft text-destructive hover:bg-destructive-soft hover:text-destructive"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Flag
              className={cn("w-5 h-5", isActive && "fill-current")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Đánh dấu câu cần hỏi gia sư</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
