
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  fileType: 'gstr2b' | 'purchase';
  className?: string;
  file: File | null;
}

const FileUpload = ({ onFileSelect, fileType, className, file }: FileUploadProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const title = fileType === 'gstr2b' ? 'GSTR-2B File' : 'Purchase Register File';

  return (
    <Card 
      {...getRootProps()} 
      className={cn(
        'border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200',
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
        file ? 'border-green-500 bg-green-50' : '',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="rounded-full bg-primary/10 p-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {file ? (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Selected: {file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500">Drag &amp; drop your Excel file here</p>
            <p className="text-sm text-gray-500">or</p>
            <Button variant="outline" size="sm" className="mt-2">
              Browse Files
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileUpload;
