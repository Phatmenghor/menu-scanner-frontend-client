"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { fetchAllWorkSchedulesTypeService } from "@/redux/features/hr/store/thunks/work-schedule-type-thunks";

interface ScheduleType {
  enumName: string;
  id: string;
}

interface CustomOption {
  id: string;
  enumName: string;
}

interface ComboboxSelectScheduleTypeProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  customOptions?: CustomOption[];
  showCustomOptions?: boolean;
  fetchOnMount?: boolean;
}

export function ComboboxSelectScheduleType({
  value,
  onValueChange,
  disabled = false,
  label = "Schedule Type",
  required = false,
  placeholder = "Select schedule type...",
  error,
  customOptions = [],
  showCustomOptions = false,
  fetchOnMount = false,
}: ComboboxSelectScheduleTypeProps) {
  const dispatch = useAppDispatch();

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Helper function to merge custom options with schedule types
  const getMergedData = (types: ScheduleType[]): ScheduleType[] => {
    if (showCustomOptions && customOptions.length > 0) {
      return [...customOptions, ...types];
    }
    return types;
  };

  const fetchScheduleTypes = async () => {
    if (loading || dataFetched) return;

    setLoading(true);
    try {
      const result = await dispatch(
        fetchAllWorkSchedulesTypeService({ search: "", pageNo: 1 })
      ).unwrap();

      if (result?.content) {
        setScheduleTypes(result.content);
        setDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching schedule types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch schedule types on mount if fetchOnMount is true
  useEffect(() => {
    if (fetchOnMount) {
      fetchScheduleTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount]);

  // Fetch schedule types when combobox opens (if not already fetched)
  useEffect(() => {
    if (open && !dataFetched && !fetchOnMount) {
      fetchScheduleTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  // Get merged data with custom options
  const allScheduleTypes = getMergedData(scheduleTypes);

  // Filter schedule types based on search term
  const filteredScheduleTypes = allScheduleTypes.filter((type) =>
    type.enumName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find the selected schedule type to display
  const selectedScheduleType = allScheduleTypes.find(
    (type) => type.enumName === value
  );

  // Display value: show selected type, or value directly (for edit mode before data loads), or placeholder
  const displayValue = selectedScheduleType
    ? selectedScheduleType.enumName
    : value || placeholder;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-9 text-sm",
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500"
            )}
            disabled={disabled}
          >
            {displayValue}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search schedule type..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading schedule types...
                  </p>
                </div>
              ) : (
                <>
                  <CommandEmpty>No schedule type found.</CommandEmpty>
                  <CommandGroup>
                    {filteredScheduleTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        value={type.enumName}
                        onSelect={() => handleSelect(type.enumName)}
                        className="h-9 text-sm"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === type.enumName ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {type.enumName}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
