
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColumnMappingProps {
  gstr2bHeaders: string[];
  purchaseHeaders: string[];
  onMappingComplete: (mapping: {
    gstr2bKey: string;
    purchaseKey: string;
  }) => void;
  disabled?: boolean;
}

const ColumnMapping = ({ 
  gstr2bHeaders, 
  purchaseHeaders, 
  onMappingComplete,
  disabled = false
}: ColumnMappingProps) => {
  const [gstr2bKey, setGstr2bKey] = useState<string>('');
  const [purchaseKey, setPurchaseKey] = useState<string>('');

  // Attempt to auto-map common columns
  useEffect(() => {
    if (gstr2bHeaders.length && purchaseHeaders.length && !gstr2bKey && !purchaseKey) {
      // Common column names for invoice number
      const invoiceColumns = ['invoice no', 'invoice number', 'bill no', 'bill number', 'document number'];
      
      // Try to find matching columns
      for (const term of invoiceColumns) {
        const gstr2bMatch = gstr2bHeaders.find(h => 
          h.toLowerCase().includes(term)
        );
        
        const purchaseMatch = purchaseHeaders.find(h => 
          h.toLowerCase().includes(term)
        );
        
        if (gstr2bMatch && purchaseMatch) {
          setGstr2bKey(gstr2bMatch);
          setPurchaseKey(purchaseMatch);
          break;
        }
      }
    }
  }, [gstr2bHeaders, purchaseHeaders, gstr2bKey, purchaseKey]);

  const handleApplyMapping = () => {
    if (gstr2bKey && purchaseKey) {
      onMappingComplete({
        gstr2bKey,
        purchaseKey
      });
    }
  };

  const canApply = gstr2bKey && purchaseKey;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gstr2b-key">GSTR-2B Key Column</Label>
              <Select 
                disabled={disabled} 
                value={gstr2bKey} 
                onValueChange={setGstr2bKey}
              >
                <SelectTrigger id="gstr2b-key">
                  <SelectValue placeholder="Select matching column" />
                </SelectTrigger>
                <SelectContent>
                  {gstr2bHeaders.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase-key">Purchase Register Key Column</Label>
              <Select 
                disabled={disabled} 
                value={purchaseKey} 
                onValueChange={setPurchaseKey}
              >
                <SelectTrigger id="purchase-key">
                  <SelectValue placeholder="Select matching column" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseHeaders.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleApplyMapping}
              disabled={!canApply || disabled}
              variant="default"
            >
              Apply Mapping
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMapping;
