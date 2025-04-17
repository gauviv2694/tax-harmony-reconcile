
import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import ColumnMapping from '@/components/ColumnMapping';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import ReconciliationResults from '@/components/ReconciliationResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, FileSpreadsheet, RefreshCw } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  
  // File states
  const [gstr2bFile, setGstr2bFile] = useState<File | null>(null);
  const [purchaseFile, setPurchaseFile] = useState<File | null>(null);
  
  // Data states
  const [gstr2bData, setGstr2bData] = useState<any[]>([]);
  const [gstr2bHeaders, setGstr2bHeaders] = useState<string[]>([]);
  const [purchaseData, setPurchaseData] = useState<any[]>([]);
  const [purchaseHeaders, setPurchaseHeaders] = useState<string[]>([]);
  
  // Mapping state
  const [columnMapping, setColumnMapping] = useState<{
    gstr2bKey: string;
    purchaseKey: string;
  } | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  
  // Results state
  const [commonEntries, setCommonEntries] = useState<any[]>([]);
  const [moreInGstr2b, setMoreInGstr2b] = useState<any[]>([]);
  const [lessInGstr2b, setLessInGstr2b] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const handleGstr2bData = (data: any[], headers: string[]) => {
    setGstr2bData(data);
    setGstr2bHeaders(headers);
  };
  
  const handlePurchaseData = (data: any[], headers: string[]) => {
    setPurchaseData(data);
    setPurchaseHeaders(headers);
  };
  
  const handleColumnMappingComplete = (mapping: {
    gstr2bKey: string;
    purchaseKey: string;
  }) => {
    setColumnMapping(mapping);
    toast({
      title: "Column mapping applied",
      description: `GSTR-2B: ${mapping.gstr2bKey}, Purchase: ${mapping.purchaseKey}`,
    });
  };
  
  const canProcess = gstr2bFile && purchaseFile && columnMapping;
  
  const resetProcess = () => {
    setGstr2bFile(null);
    setPurchaseFile(null);
    setGstr2bData([]);
    setGstr2bHeaders([]);
    setPurchaseData([]);
    setPurchaseHeaders([]);
    setColumnMapping(null);
    setShowResults(false);
    setCommonEntries([]);
    setMoreInGstr2b([]);
    setLessInGstr2b([]);
  };
  
  const startProcessing = async () => {
    if (!canProcess) return;
    
    try {
      setIsProcessing(true);
      setShowResults(false);
      setProcessingStep('Preparing data for reconciliation');
      setProcessingProgress(10);
      
      // Simulate processing delay (would be handled by backend in a real app)
      await new Promise(r => setTimeout(r, 1000));
      setProcessingProgress(30);
      
      // Extract key columns
      const { gstr2bKey, purchaseKey } = columnMapping;
      const gstr2bKeyIndex = gstr2bHeaders.indexOf(gstr2bKey);
      const purchaseKeyIndex = purchaseHeaders.indexOf(purchaseKey);
      
      setProcessingStep('Extracting key values');
      await new Promise(r => setTimeout(r, 800));
      setProcessingProgress(50);
      
      // Extract unique key values
      const gstr2bKeys = gstr2bData
        .map(row => row[gstr2bKeyIndex])
        .filter(val => val !== undefined && val !== null && val !== '');
      
      const purchaseKeys = purchaseData
        .map(row => row[purchaseKeyIndex])
        .filter(val => val !== undefined && val !== null && val !== '');
      
      setProcessingStep('Finding common entries');
      await new Promise(r => setTimeout(r, 800));
      setProcessingProgress(70);
      
      // Find common entries
      const common = gstr2bKeys.filter(key => 
        purchaseKeys.some(pKey => String(pKey) === String(key))
      );
      
      // Find more in GSTR2B
      const more = gstr2bKeys.filter(key => 
        !purchaseKeys.some(pKey => String(pKey) === String(key))
      );
      
      // Find less in GSTR2B (more in Purchase)
      const less = purchaseKeys.filter(key => 
        !gstr2bKeys.some(gKey => String(gKey) === String(key))
      );
      
      setProcessingStep('Generating reconciliation report');
      await new Promise(r => setTimeout(r, 1000));
      setProcessingProgress(90);
      
      // Set results
      setCommonEntries(common);
      setMoreInGstr2b(more);
      setLessInGstr2b(less);
      
      await new Promise(r => setTimeout(r, 500));
      setProcessingProgress(100);
      
      // Show results
      setShowResults(true);
      
      toast({
        title: "Reconciliation Complete",
        description: `Found ${common.length} common entries, ${more.length} more in GSTR-2B, and ${less.length} less in GSTR-2B.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Reconciliation Failed",
        description: "An error occurred during processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          GSTR-2B vs Purchase Register Reconciliation
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your GSTR-2B and Purchase Register Excel files, map the matching columns, 
          and generate a detailed reconciliation report.
        </p>
      </div>
      
      {showResults ? (
        <div className="space-y-6">
          <Button 
            onClick={resetProcess} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Start New Reconciliation
          </Button>
          
          {columnMapping && (
            <ReconciliationResults
              commonEntries={commonEntries}
              moreInGstr2b={moreInGstr2b}
              lessInGstr2b={lessInGstr2b}
              gstr2bData={gstr2bData}
              purchaseData={purchaseData}
              gstr2bHeaders={gstr2bHeaders}
              purchaseHeaders={purchaseHeaders}
              gstr2bKey={columnMapping.gstr2bKey}
              purchaseKey={columnMapping.purchaseKey}
            />
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Step 1: File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center rounded-full bg-primary w-6 h-6 text-xs text-white font-medium">1</span>
                Upload Excel Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <FileUpload 
                  onFileSelect={setGstr2bFile} 
                  fileType="gstr2b" 
                  file={gstr2bFile} 
                />
                <FileUpload 
                  onFileSelect={setPurchaseFile} 
                  fileType="purchase" 
                  file={purchaseFile} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Step 2: Data Preview */}
          {(gstr2bFile || purchaseFile) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center rounded-full bg-primary w-6 h-6 text-xs text-white font-medium">2</span>
                  Preview Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {gstr2bFile && (
                  <DataPreview 
                    file={gstr2bFile} 
                    fileType="gstr2b" 
                    onSheetData={handleGstr2bData} 
                  />
                )}
                
                {purchaseFile && (
                  <DataPreview 
                    file={purchaseFile} 
                    fileType="purchase" 
                    onSheetData={handlePurchaseData} 
                  />
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Column Mapping */}
          {gstr2bHeaders.length > 0 && purchaseHeaders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center rounded-full bg-primary w-6 h-6 text-xs text-white font-medium">3</span>
                  Map Columns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ColumnMapping
                  gstr2bHeaders={gstr2bHeaders}
                  purchaseHeaders={purchaseHeaders}
                  onMappingComplete={handleColumnMappingComplete}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Process */}
          {canProcess && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center rounded-full bg-primary w-6 h-6 text-xs text-white font-medium">4</span>
                  Process Reconciliation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <ProcessingIndicator 
                    isProcessing={isProcessing}
                    progress={processingProgress}
                    currentStep={processingStep}
                  />
                ) : (
                  <div className="flex justify-center">
                    <Button 
                      onClick={startProcessing} 
                      className="flex items-center gap-2"
                      size="lg"
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                      Generate Reconciliation Report
                      <ArrowRight className="h-5 w-5 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
