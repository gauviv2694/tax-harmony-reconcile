
import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import ColumnMapping from '@/components/ColumnMapping';
import ProcessingIndicator from '@/components/ProcessingIndicator';
import ReconciliationResults from '@/components/ReconciliationResults';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, FileSpreadsheet, RefreshCw } from 'lucide-react';

interface ColumnPair {
  gstr2bKey: string;
  purchaseKey: string;
  id: string;
}

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
  const [columnMappings, setColumnMappings] = useState<ColumnPair[] | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [totalItems, setTotalItems] = useState<{ gstr2b: number; purchase: number } | null>(null);
  
  // Results state
  const [commonEntries, setCommonEntries] = useState<any[]>([]);
  const [moreInGstr2b, setMoreInGstr2b] = useState<any[]>([]);
  const [lessInGstr2b, setLessInGstr2b] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const handleGstr2bData = (data: any[], headers: string[]) => {
    setGstr2bData(data);
    setGstr2bHeaders(headers);
    setTotalItems(prev => ({ gstr2b: data.length, purchase: prev?.purchase || 0 }));
  };
  
  const handlePurchaseData = (data: any[], headers: string[]) => {
    setPurchaseData(data);
    setPurchaseHeaders(headers);
    setTotalItems(prev => ({ gstr2b: prev?.gstr2b || 0, purchase: data.length }));
  };
  
  const handleColumnMappingComplete = (mappings: ColumnPair[]) => {
    setColumnMappings(mappings);
    
    const mappingDetails = mappings.map(m => `${m.gstr2bKey} ↔ ${m.purchaseKey}`).join(", ");
    
    toast({
      title: "Column mappings applied",
      description: `Applied ${mappings.length} column mappings: ${mappingDetails.length > 50 ? mappingDetails.substring(0, 50) + '...' : mappingDetails}`,
    });
  };
  
  const canProcess = gstr2bFile && purchaseFile && columnMappings && columnMappings.length > 0;
  
  const resetProcess = () => {
    setGstr2bFile(null);
    setPurchaseFile(null);
    setGstr2bData([]);
    setGstr2bHeaders([]);
    setPurchaseData([]);
    setPurchaseHeaders([]);
    setColumnMappings(null);
    setShowResults(false);
    setCommonEntries([]);
    setMoreInGstr2b([]);
    setLessInGstr2b([]);
    setTotalItems(null);
  };
  
  const startProcessing = async () => {
    if (!canProcess || !columnMappings) return;
    
    try {
      setIsProcessing(true);
      setShowResults(false);
      setProcessingStep('Preparing data for reconciliation');
      setProcessingProgress(10);
      
      // Simulate processing delay (would be handled by backend in a real app)
      await new Promise(r => setTimeout(r, 800));
      setProcessingProgress(20);
      
      // Extract indices for all mapped columns
      const mappingIndices = columnMappings.map(mapping => ({
        gstr2bKeyIndex: gstr2bHeaders.indexOf(mapping.gstr2bKey),
        purchaseKeyIndex: purchaseHeaders.indexOf(mapping.purchaseKey)
      }));
      
      setProcessingStep('Extracting key values');
      await new Promise(r => setTimeout(r, 800));
      setProcessingProgress(40);
      
      // Generate composite keys for comparison
      const generateCompositeKey = (row: any[], indices: number[]): string => {
        return indices
          .map(index => row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '')
          .join('|');
      };
      
      const gstr2bKeys = gstr2bData.map(row => {
        const keyParts = mappingIndices.map(m => row[m.gstr2bKeyIndex]);
        // Skip rows with any undefined/null key parts
        if (keyParts.some(part => part === undefined || part === null || part === '')) {
          return null;
        }
        return {
          key: generateCompositeKey(row, mappingIndices.map(m => m.gstr2bKeyIndex)),
          data: row
        };
      }).filter(item => item !== null) as { key: string; data: any[] }[];
      
      const purchaseKeys = purchaseData.map(row => {
        const keyParts = mappingIndices.map(m => row[m.purchaseKeyIndex]);
        // Skip rows with any undefined/null key parts
        if (keyParts.some(part => part === undefined || part === null || part === '')) {
          return null;
        }
        return {
          key: generateCompositeKey(row, mappingIndices.map(m => m.purchaseKeyIndex)),
          data: row
        };
      }).filter(item => item !== null) as { key: string; data: any[] }[];
      
      setProcessingStep('Finding common entries');
      await new Promise(r => setTimeout(r, 800));
      setProcessingProgress(60);
      
      // Find common entries
      const gstr2bKeySet = new Set(gstr2bKeys.map(item => item.key));
      const purchaseKeySet = new Set(purchaseKeys.map(item => item.key));
      
      const common = gstr2bKeys
        .filter(item => purchaseKeySet.has(item.key))
        .map(item => ({
          key: item.key,
          gstr2bData: item.data,
          purchaseData: purchaseKeys.find(pk => pk.key === item.key)?.data
        }));
      
      // Find more in GSTR2B
      const more = gstr2bKeys
        .filter(item => !purchaseKeySet.has(item.key))
        .map(item => ({
          key: item.key,
          data: item.data
        }));
      
      // Find less in GSTR2B (more in Purchase)
      const less = purchaseKeys
        .filter(item => !gstr2bKeySet.has(item.key))
        .map(item => ({
          key: item.key,
          data: item.data
        }));
      
      setProcessingStep('Generating reconciliation report');
      await new Promise(r => setTimeout(r, 1000));
      setProcessingProgress(80);
      
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
          Upload your GSTR-2B and Purchase Register Excel files, map matching columns, 
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
          
          {columnMappings && (
            <ReconciliationResults
              commonEntries={commonEntries}
              moreInGstr2b={moreInGstr2b}
              lessInGstr2b={lessInGstr2b}
              gstr2bData={gstr2bData}
              purchaseData={purchaseData}
              gstr2bHeaders={gstr2bHeaders}
              purchaseHeaders={purchaseHeaders}
              columnMappings={columnMappings}
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
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Select matching columns from GSTR-2B and Purchase Register files. You can add multiple mappings 
                    for a more precise comparison. At least one mapping is required.
                  </p>
                </div>
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
                    totalItems={totalItems}
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
