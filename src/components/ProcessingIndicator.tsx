
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
  totalItems?: { gstr2b: number; purchase: number } | null;
}

const ProcessingIndicator = ({ 
  isProcessing, 
  progress, 
  currentStep,
  totalItems
}: ProcessingIndicatorProps) => {
  if (!isProcessing) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Processing Files
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-gray-500">{currentStep}</p>
          
          {totalItems && (
            <div className="text-xs text-gray-500 mt-2 flex justify-center gap-4">
              <span>GSTR-2B: {totalItems.gstr2b} rows</span>
              <span>Purchase Register: {totalItems.purchase} rows</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingIndicator;
