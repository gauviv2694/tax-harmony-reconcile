
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DataPreviewProps {
  file: File | null;
  fileType: 'gstr2b' | 'purchase';
  onSheetData: (data: any[], headers: string[]) => void;
}

const DataPreview = ({ file, fileType, onSheetData }: DataPreviewProps) => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');

  useEffect(() => {
    if (!file) {
      setPreviewData([]);
      setHeaders([]);
      setSheetNames([]);
      setActiveSheet('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets = workbook.SheetNames;
        setSheetNames(sheets);
        
        if (sheets.length > 0) {
          const firstSheet = sheets[0];
          setActiveSheet(firstSheet);
          
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 0) {
            const headerRow = jsonData[0] as string[];
            setHeaders(headerRow);
            
            // Get first 5 rows for preview (excluding header)
            const previewRows = jsonData.slice(1, 6);
            setPreviewData(previewRows);
            
            // Send all data (excluding header) to parent
            const allData = jsonData.slice(1);
            onSheetData(allData, headerRow);
          }
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        setPreviewData([]);
        setHeaders([]);
      }
    };
    
    reader.readAsArrayBuffer(file);
  }, [file, onSheetData]);

  const handleSheetChange = (sheetName: string) => {
    if (!file) return;
    
    setActiveSheet(sheetName);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headerRow = jsonData[0] as string[];
          setHeaders(headerRow);
          
          // Get first 5 rows for preview
          const previewRows = jsonData.slice(1, 6);
          setPreviewData(previewRows);
          
          // Send all data to parent
          const allData = jsonData.slice(1);
          onSheetData(allData, headerRow);
        }
      } catch (error) {
        console.error("Error parsing Excel sheet:", error);
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  const title = fileType === 'gstr2b' ? 'GSTR-2B Preview' : 'Purchase Register Preview';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {file ? (
          <>
            {sheetNames.length > 1 && (
              <Tabs defaultValue={activeSheet} className="px-4 pt-2">
                <TabsList>
                  {sheetNames.map((sheet) => (
                    <TabsTrigger 
                      key={sheet} 
                      value={sheet}
                      onClick={() => handleSheetChange(sheet)}
                    >
                      {sheet}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((_, colIndex) => (
                        <TableCell key={`${rowIndex}-${colIndex}`}>
                          {row[colIndex] !== undefined ? row[colIndex] : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 0 && (
                <div className="text-center text-sm text-gray-500 py-2">
                  Showing first {previewData.length} rows
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center p-8 text-gray-500">
            Upload a file to see preview
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
