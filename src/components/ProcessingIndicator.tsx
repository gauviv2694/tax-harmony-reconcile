
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
}

const ProcessingIndicator = ({ isProcessing, progress, currentStep }: ProcessingIndicatorProps) => {
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingIndicator;
