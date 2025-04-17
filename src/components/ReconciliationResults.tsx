import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColumnPair {
  gstr2bKey: string;
  purchaseKey: string;
  id: string;
}

interface CommonEntry {
  key: string;
  gstr2bData: any[];
  purchaseData: any[];
}

interface SingleEntry {
  key: string;
  data: any[];
}

interface ReconciliationResultsProps {
  commonEntries: CommonEntry[];
  moreInGstr2b: SingleEntry[];
  lessInGstr2b: SingleEntry[];
  gstr2bData: any[];
  purchaseData: any[];
  gstr2bHeaders: string[];
  purchaseHeaders: string[];
  columnMappings: ColumnPair[];
}

const ReconciliationResults = ({
  commonEntries,
  moreInGstr2b,
  lessInGstr2b,
  gstr2bHeaders,
  purchaseHeaders,
  columnMappings,
}: ReconciliationResultsProps) => {
  const [activeTab, setActiveTab] = useState("common");

  const downloadExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add the common entries worksheet
    const commonData = commonEntries.map(entry => {
      const result: Record<string, any> = {};
      
      // Add GSTR2B data
      gstr2bHeaders.forEach((header, index) => {
        result[`GSTR2B_${header}`] = entry.gstr2bData[index];
      });
      
      // Add Purchase data
      purchaseHeaders.forEach((header, index) => {
        result[`PR_${header}`] = entry.purchaseData[index];
      });

      return result;
    });
    
    const commonWs = XLSX.utils.json_to_sheet(commonData);
    XLSX.utils.book_append_sheet(wb, commonWs, "Common Entries");

    // Add the more in GSTR-2B worksheet
    const moreData = moreInGstr2b.map(entry => {
      const result: Record<string, any> = {};
      
      gstr2bHeaders.forEach((header, index) => {
        result[header] = entry.data[index];
      });

      return result;
    });
    
    const moreInGstr2bWs = XLSX.utils.json_to_sheet(moreData);
    XLSX.utils.book_append_sheet(wb, moreInGstr2bWs, "More in GSTR-2B");

    // Add the less in GSTR-2B worksheet
    const lessData = lessInGstr2b.map(entry => {
      const result: Record<string, any> = {};
      
      purchaseHeaders.forEach((header, index) => {
        result[header] = entry.data[index];
      });

      return result;
    });
    
    const lessInGstr2bWs = XLSX.utils.json_to_sheet(lessData);
    XLSX.utils.book_append_sheet(wb, lessInGstr2bWs, "Less in GSTR-2B");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Reconciliation_Report.xlsx");
  };

  const renderCommonEntriesTable = () => {
    if (commonEntries.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No common entries found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnMappings.map((mapping, index) => (
                <TableHead key={`map-${index}`} className="bg-gray-100 font-bold">
                  <div className="flex items-center gap-1">
                    <span>{mapping.gstr2bKey} / {mapping.purchaseKey}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>GSTR-2B: {mapping.gstr2bKey}</p>
                          <p>Purchase: {mapping.purchaseKey}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              ))}
              <TableHead className="bg-gray-50">Other GSTR-2B Columns</TableHead>
              <TableHead className="bg-gray-50">Other Purchase Columns</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commonEntries.slice(0, 10).map((entry, rowIndex) => {
              const mappingIndicesGstr = columnMappings.map(m => gstr2bHeaders.indexOf(m.gstr2bKey));
              const mappingIndicesPurchase = columnMappings.map(m => purchaseHeaders.indexOf(m.purchaseKey));
              
              return (
                <TableRow key={rowIndex}>
                  {/* Render matched columns */}
                  {columnMappings.map((mapping, i) => {
                    const gstr2bIndex = gstr2bHeaders.indexOf(mapping.gstr2bKey);
                    const purchaseIndex = purchaseHeaders.indexOf(mapping.purchaseKey);
                    const gstr2bValue = entry.gstr2bData[gstr2bIndex];
                    const purchaseValue = entry.purchaseData[purchaseIndex];
                    const valueMatch = String(gstr2bValue) === String(purchaseValue);
                    
                    return (
                      <TableCell key={`col-${i}`} className={!valueMatch ? "bg-yellow-50" : ""}>
                        <div className="flex flex-col">
                          <span>{gstr2bValue !== undefined ? gstr2bValue.toString() : ''}</span>
                          {!valueMatch && (
                            <span className="text-xs text-red-500 mt-1">
                              ≠ {purchaseValue !== undefined ? purchaseValue.toString() : ''}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  
                  {/* Other GSTR-2B columns */}
                  <TableCell>
                    <div className="max-w-xs space-y-1">
                      {gstr2bHeaders
                        .filter((_, i) => !mappingIndicesGstr.includes(i))
                        .map((header, i) => (
                          entry.gstr2bData[gstr2bHeaders.indexOf(header)] !== undefined && 
                          entry.gstr2bData[gstr2bHeaders.indexOf(header)] !== null && 
                          entry.gstr2bData[gstr2bHeaders.indexOf(header)] !== '' ? (
                            <div key={`gstr-other-${i}`} className="text-xs">
                              <span className="font-medium">{header}: </span>
                              {entry.gstr2bData[gstr2bHeaders.indexOf(header)].toString()}
                            </div>
                          ) : null
                        ))
                        .filter(Boolean)
                        .slice(0, 3)
                      }
                      {gstr2bHeaders.filter((_, i) => !mappingIndicesGstr.includes(i)).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{gstr2bHeaders.filter((_, i) => !mappingIndicesGstr.includes(i)).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Other Purchase columns */}
                  <TableCell>
                    <div className="max-w-xs space-y-1">
                      {purchaseHeaders
                        .filter((_, i) => !mappingIndicesPurchase.includes(i))
                        .map((header, i) => (
                          entry.purchaseData[purchaseHeaders.indexOf(header)] !== undefined && 
                          entry.purchaseData[purchaseHeaders.indexOf(header)] !== null && 
                          entry.purchaseData[purchaseHeaders.indexOf(header)] !== '' ? (
                            <div key={`pur-other-${i}`} className="text-xs">
                              <span className="font-medium">{header}: </span>
                              {entry.purchaseData[purchaseHeaders.indexOf(header)].toString()}
                            </div>
                          ) : null
                        ))
                        .filter(Boolean)
                        .slice(0, 3)
                      }
                      {purchaseHeaders.filter((_, i) => !mappingIndicesPurchase.includes(i)).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{purchaseHeaders.filter((_, i) => !mappingIndicesPurchase.includes(i)).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {commonEntries.length > 10 && (
          <div className="text-center text-sm text-gray-500 py-2">
            Showing 10 of {commonEntries.length} entries
          </div>
        )}
      </div>
    );
  };

  const renderSingleSourceTable = (entries: SingleEntry[], headers: string[], mappedColumns: string[]) => {
    if (entries.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No entries found in this category
        </div>
      );
    }

    const mappedIndices = mappedColumns.map(col => headers.indexOf(col));

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {mappedColumns.map((col, i) => (
                <TableHead key={`col-${i}`} className="bg-gray-100 font-bold">{col}</TableHead>
              ))}
              <TableHead className="bg-gray-50">Other Columns</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 10).map((entry, rowIndex) => (
              <TableRow key={rowIndex}>
                {/* Mapped columns */}
                {mappedColumns.map((col, i) => (
                  <TableCell key={`mapped-${i}`}>
                    {entry.data[headers.indexOf(col)] !== undefined ? entry.data[headers.indexOf(col)].toString() : ''}
                  </TableCell>
                ))}
                
                {/* Other columns */}
                <TableCell>
                  <div className="max-w-xs space-y-1">
                    {headers
                      .filter((_, i) => !mappedIndices.includes(i))
                      .map((header, i) => (
                        entry.data[headers.indexOf(header)] !== undefined && 
                        entry.data[headers.indexOf(header)] !== null && 
                        entry.data[headers.indexOf(header)] !== '' ? (
                          <div key={`other-${i}`} className="text-xs">
                            <span className="font-medium">{header}: </span>
                            {entry.data[headers.indexOf(header)].toString()}
                          </div>
                        ) : null
                      ))
                      .filter(Boolean)
                      .slice(0, 3)
                    }
                    {headers.filter((_, i) => !mappedIndices.includes(i)).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{headers.filter((_, i) => !mappedIndices.includes(i)).length - 3} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {entries.length > 10 && (
          <div className="text-center text-sm text-gray-500 py-2">
            Showing 10 of {entries.length} entries
          </div>
        )}
      </div>
    );
  };

  const commonCount = commonEntries.length;
  const moreCount = moreInGstr2b.length;
  const lessCount = lessInGstr2b.length;
  const totalCount = commonCount + moreCount + lessCount;

  // Mapping information for display
  const mappingInfo = columnMappings.map(m => `${m.gstr2bKey} ↔ ${m.purchaseKey}`);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="flex justify-between items-center">
            <span>Reconciliation Results</span>
            <Button onClick={downloadExcel} variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4 mr-1" />
              Download Excel
            </Button>
          </CardTitle>
          <div className="text-sm text-gray-500">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span>Matched using:</span>
              {mappingInfo.map((info, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{info}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-4 p-4">
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-bold text-green-600">{commonCount}</h3>
              <p className="text-sm text-gray-500">Common Entries</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-bold text-blue-600">{moreCount}</h3>
              <p className="text-sm text-gray-500">More in GSTR-2B</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-bold text-amber-600">{lessCount}</h3>
              <p className="text-sm text-gray-500">Less in GSTR-2B</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="common" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4 mx-4">
            <TabsTrigger value="common">Common Entries ({commonCount})</TabsTrigger>
            <TabsTrigger value="more">More in GSTR-2B ({moreCount})</TabsTrigger>
            <TabsTrigger value="less">Less in GSTR-2B ({lessCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="common" className="m-0">
            {renderCommonEntriesTable()}
          </TabsContent>
          <TabsContent value="more" className="m-0">
            {renderSingleSourceTable(
              moreInGstr2b, 
              gstr2bHeaders, 
              columnMappings.map(m => m.gstr2bKey)
            )}
          </TabsContent>
          <TabsContent value="less" className="m-0">
            {renderSingleSourceTable(
              lessInGstr2b, 
              purchaseHeaders, 
              columnMappings.map(m => m.purchaseKey)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          Total {totalCount} entries analyzed
        </div>
        <Button onClick={downloadExcel} className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Download Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ReconciliationResults;
