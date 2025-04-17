
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnPair {
  gstr2bKey: string;
  purchaseKey: string;
  id: string; // Unique identifier for each mapping
}

interface ColumnMappingProps {
  gstr2bHeaders: string[];
  purchaseHeaders: string[];
  onMappingComplete: (mappings: ColumnPair[]) => void;
  disabled?: boolean;
}

const ColumnMapping = ({ 
  gstr2bHeaders, 
  purchaseHeaders, 
  onMappingComplete,
  disabled = false
}: ColumnMappingProps) => {
  const [mappings, setMappings] = useState<ColumnPair[]>([
    { gstr2bKey: '', purchaseKey: '', id: '1' }
  ]);

  // Attempt to auto-map common columns
  useEffect(() => {
    if (gstr2bHeaders.length && purchaseHeaders.length && mappings.length === 1 && !mappings[0].gstr2bKey && !mappings[0].purchaseKey) {
      // Common column names for various fields
      const commonMappings: { terms: string[], type: string }[] = [
        { terms: ['invoice no', 'invoice number', 'bill no', 'bill number', 'document number'], type: 'invoice' },
        { terms: ['gstin', 'gst no', 'gst number'], type: 'gstin' },
        { terms: ['invoice date', 'bill date', 'document date'], type: 'date' },
        { terms: ['taxable value', 'invoice value', 'value', 'amount'], type: 'value' },
        { terms: ['vendor', 'supplier', 'party name', 'customer'], type: 'vendor' }
      ];
      
      const newMappings: ColumnPair[] = [];
      
      // Try to find matching columns for each mapping type
      for (const mapping of commonMappings) {
        const gstr2bMatch = gstr2bHeaders.find(h => 
          mapping.terms.some(term => h.toLowerCase().includes(term))
        );
        
        const purchaseMatch = purchaseHeaders.find(h => 
          mapping.terms.some(term => h.toLowerCase().includes(term))
        );
        
        if (gstr2bMatch && purchaseMatch) {
          newMappings.push({
            gstr2bKey: gstr2bMatch,
            purchaseKey: purchaseMatch,
            id: String(newMappings.length + 1)
          });
        }
      }
      
      if (newMappings.length > 0) {
        setMappings(newMappings);
      }
    }
  }, [gstr2bHeaders, purchaseHeaders, mappings]);

  const handleMappingChange = (index: number, field: 'gstr2bKey' | 'purchaseKey', value: string) => {
    const updatedMappings = [...mappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setMappings(updatedMappings);
  };

  const addMapping = () => {
    setMappings([...mappings, { gstr2bKey: '', purchaseKey: '', id: String(Date.now()) }]);
  };

  const removeMapping = (index: number) => {
    if (mappings.length > 1) {
      const updatedMappings = [...mappings];
      updatedMappings.splice(index, 1);
      setMappings(updatedMappings);
    }
  };

  const handleApplyMapping = () => {
    const validMappings = mappings.filter(m => m.gstr2bKey && m.purchaseKey);
    if (validMappings.length > 0) {
      onMappingComplete(validMappings);
    }
  };

  const canApply = mappings.some(m => m.gstr2bKey && m.purchaseKey);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Column Mapping</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappings.map((mapping, index) => (
            <div key={mapping.id} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor={`gstr2b-key-${index}`} className="mb-2 block">GSTR-2B Column</Label>
                <Select 
                  disabled={disabled} 
                  value={mapping.gstr2bKey} 
                  onValueChange={(value) => handleMappingChange(index, 'gstr2bKey', value)}
                >
                  <SelectTrigger id={`gstr2b-key-${index}`}>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {gstr2bHeaders.map((header) => (
                      <SelectItem key={`gstr-${index}-${header}`} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor={`purchase-key-${index}`} className="mb-2 block">Purchase Register Column</Label>
                <Select 
                  disabled={disabled} 
                  value={mapping.purchaseKey} 
                  onValueChange={(value) => handleMappingChange(index, 'purchaseKey', value)}
                >
                  <SelectTrigger id={`purchase-key-${index}`}>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseHeaders.map((header) => (
                      <SelectItem key={`purchase-${index}-${header}`} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeMapping(index)}
                disabled={disabled || mappings.length === 1}
                className="flex-shrink-0 mb-0.5"
              >
                <Trash2 className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          ))}
          
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              onClick={addMapping}
              disabled={disabled}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Another Mapping
            </Button>

            <Button
              onClick={handleApplyMapping}
              disabled={!canApply || disabled}
              variant="default"
              className="w-full"
            >
              Apply Mappings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColumnMapping;
