import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useVendors } from '@/hooks/useVendors';
import { toast } from 'sonner';

interface VendorComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const VendorCombobox = ({ value, onChange }: VendorComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const { vendors, addVendor } = useVendors();

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
    setSearchValue('');
  };

  const handleAddNew = () => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      toast.error('Please enter a vendor name');
      return;
    }

    const added = addVendor(trimmed);
    if (added) {
      toast.success(`Vendor "${trimmed}" added successfully`);
      onChange(trimmed);
    } else {
      onChange(trimmed);
    }
    setOpen(false);
    setSearchValue('');
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showAddOption =
    searchValue.trim() &&
    !vendors.some(
      (v) => v.toLowerCase() === searchValue.trim().toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || 'Select or add vendor...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50" align="start">
        <Command>
          <CommandInput
            placeholder="Search or add vendor..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() ? (
                <div className="py-2 text-sm text-muted-foreground">
                  No vendor found. Click below to add.
                </div>
              ) : (
                'No vendors found.'
              )}
            </CommandEmpty>
            {showAddOption && (
              <>
                <CommandGroup>
                  <CommandItem
                    onSelect={handleAddNew}
                    className="text-primary cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add "{searchValue.trim()}"
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Vendors">
              {filteredVendors.map((vendor) => (
                <CommandItem
                  key={vendor}
                  value={vendor}
                  onSelect={handleSelect}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === vendor ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {vendor}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default VendorCombobox;
