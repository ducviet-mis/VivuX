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
            className={cn(
              "rounded-full transition-all duration-300 w-10 h-10",
              isActive 
                ? "bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50" 
                : "text-muted-foreground hover:text-red-400"
            )}
          >
            <Flag 
              className={cn("w-5 h-5", isActive && "fill-current animate-pulse")} 
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
