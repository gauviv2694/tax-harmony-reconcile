
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ReconciliationResultsProps {
  commonEntries: any[];
  moreInGstr2b: any[];
  lessInGstr2b: any[];
  gstr2bData: any[];
  purchaseData: any[];
  gstr2bHeaders: string[];
  purchaseHeaders: string[];
  gstr2bKey: string;
  purchaseKey: string;
}

const ReconciliationResults = ({
  commonEntries,
  moreInGstr2b,
  lessInGstr2b,
  gstr2bData,
  purchaseData,
  gstr2bHeaders,
  purchaseHeaders,
  gstr2bKey,
  purchaseKey,
}: ReconciliationResultsProps) => {
  const [activeTab, setActiveTab] = useState("common");

  const downloadExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add the common entries worksheet
    const commonWs = XLSX.utils.json_to_sheet(
      commonEntries.map((entry) => {
        const gstr2bRow = gstr2bData.find(
          (row) => row[gstr2bHeaders.indexOf(gstr2bKey)] === entry
        );
        const purchaseRow = purchaseData.find(
          (row) => row[purchaseHeaders.indexOf(purchaseKey)] === entry
        );

        const result: Record<string, any> = {};
        
        if (gstr2bRow) {
          gstr2bHeaders.forEach((header, index) => {
            result[`GSTR2B_${header}`] = gstr2bRow[index];
          });
        }
        
        if (purchaseRow) {
          purchaseHeaders.forEach((header, index) => {
            result[`PR_${header}`] = purchaseRow[index];
          });
        }

        return result;
      })
    );
    XLSX.utils.book_append_sheet(wb, commonWs, "Common Entries");

    // Add the more in GSTR-2B worksheet
    const moreInGstr2bWs = XLSX.utils.json_to_sheet(
      moreInGstr2b.map((entry) => {
        const gstr2bRow = gstr2bData.find(
          (row) => row[gstr2bHeaders.indexOf(gstr2bKey)] === entry
        );
        
        const result: Record<string, any> = {};
        
        if (gstr2bRow) {
          gstr2bHeaders.forEach((header, index) => {
            result[header] = gstr2bRow[index];
          });
        }

        return result;
      })
    );
    XLSX.utils.book_append_sheet(wb, moreInGstr2bWs, "More in GSTR-2B");

    // Add the less in GSTR-2B worksheet
    const lessInGstr2bWs = XLSX.utils.json_to_sheet(
      lessInGstr2b.map((entry) => {
        const purchaseRow = purchaseData.find(
          (row) => row[purchaseHeaders.indexOf(purchaseKey)] === entry
        );
        
        const result: Record<string, any> = {};
        
        if (purchaseRow) {
          purchaseHeaders.forEach((header, index) => {
            result[header] = purchaseRow[index];
          });
        }

        return result;
      })
    );
    XLSX.utils.book_append_sheet(wb, lessInGstr2bWs, "Less in GSTR-2B");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "Reconciliation_Report.xlsx");
  };

  const renderTable = (entries: any[], headers: string[], data: any[], keyField: string) => {
    if (entries.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No entries found in this category
        </div>
      );
    }

    return (
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
            {entries.slice(0, 10).map((entry, rowIndex) => {
              const row = data.find(
                (r) => r[headers.indexOf(keyField)] === entry
              );

              if (!row) return null;

              return (
                <TableRow key={rowIndex}>
                  {headers.map((_, colIndex) => (
                    <TableCell key={`${rowIndex}-${colIndex}`}>
                      {row[colIndex] !== undefined ? row[colIndex].toString() : ''}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Reconciliation Results</span>
          <Button onClick={downloadExcel} variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4 mr-1" />
            Download Excel
          </Button>
        </CardTitle>
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
            {renderTable(commonEntries, gstr2bHeaders, gstr2bData, gstr2bKey)}
          </TabsContent>
          <TabsContent value="more" className="m-0">
            {renderTable(moreInGstr2b, gstr2bHeaders, gstr2bData, gstr2bKey)}
          </TabsContent>
          <TabsContent value="less" className="m-0">
            {renderTable(lessInGstr2b, purchaseHeaders, purchaseData, purchaseKey)}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="text-sm text-gray-500">
          Total {totalCount} entries found
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
