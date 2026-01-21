"use client";

import { useEffect, useState, useRef } from "react";
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
import { useInView } from "react-intersection-observer";
import { useDebounce } from "@/utils/debounce/debounce";

export interface BaseComboboxProps<T> {
  // Data & Selection
  value: T | null;
  onValueChange: (value: T | null) => void;

  // Data Fetching
  fetchData: (params: {
    search: string;
    pageNo: number;
    pageSize?: number;
  }) => Promise<{
    content: T[];
    pageNo: number;
    last: boolean;
  }>;

  // Display Configuration
  getDisplayValue: (item: T) => string;
  getItemId: (item: T) => string;
  getItemValue: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode; // Optional custom item renderer

  // Custom Options
  customOptions?: T[];
  showCustomOptions?: boolean;
  isCustomOption?: (item: T) => boolean;

  // UI Configuration
  label?: string;
  required?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noMoreDataMessage?: string;
  loadingMessage?: string;
  error?: string;
  disabled?: boolean;

  // Styling
  size?: "sm" | "md" | "lg";
  labelClassName?: string;
  buttonClassName?: string;
  popoverClassName?: string;

  // Behavior
  fetchOnMount?: boolean;
  pageSize?: number;
  debounceMs?: number;
  enablePagination?: boolean;
  enableSearch?: boolean;
}

export function BaseCombobox<T>({
  value,
  onValueChange,
  fetchData,
  getDisplayValue,
  getItemId,
  getItemValue,
  renderItem,
  customOptions = [],
  showCustomOptions = false,
  isCustomOption = () => false,
  label,
  required = false,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  noMoreDataMessage = "No more items",
  loadingMessage = "Loading...",
  error,
  disabled = false,
  size = "md",
  labelClassName,
  buttonClassName,
  popoverClassName,
  fetchOnMount = false,
  pageSize = 10,
  debounceMs = 400,
  enablePagination = true,
  enableSearch = true,
}: BaseComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const { ref, inView } = useInView({ threshold: 0.5 });
  const debouncedSearch = useDebounce(searchTerm, debounceMs);

  const loadingRef = useRef(false);
  const lastPageRef = useRef(false);

  useEffect(() => {
    loadingRef.current = loading;
    lastPageRef.current = lastPage;
  }, [loading, lastPage]);

  const sizeClasses = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10 text-base",
  };

  // Helper function to remove duplicates by ID
  const removeDuplicates = (items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter((item) => {
      const id = getItemId(item);
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  };

  const loadData = async (search: string, newPage: number) => {
    if (loadingRef.current || (lastPageRef.current && newPage > 1 && enablePagination)) {
      return;
    }

    setLoading(true);

    try {
      const result = await fetchData({
        search,
        pageNo: newPage,
        pageSize,
      });

      if (!result) return;

      if (newPage === 1) {
        const newData = result.content;
        if (showCustomOptions && customOptions.length > 0 && !search) {
          setData(removeDuplicates([...customOptions, ...newData]));
        } else {
          setData(removeDuplicates(newData));
        }
      } else {
        setData((prev) => removeDuplicates([...prev, ...result.content]));
      }

      setPage(result.pageNo);
      setLastPage(result.last);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (fetchOnMount) {
      loadData("", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOnMount]);

  // Fetch on search change
  useEffect(() => {
    if (enableSearch) {
      setPage(1);
      setLastPage(false);
      setData([]);
      loadData(debouncedSearch, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch on open (if not already loaded)
  useEffect(() => {
    if (open && !fetchOnMount && data.length === 0) {
      loadData("", 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Infinite scroll
  useEffect(() => {
    if (
      enablePagination &&
      inView &&
      !loadingRef.current &&
      !lastPageRef.current &&
      data.length > 0
    ) {
      loadData(debouncedSearch, page + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSelect = (item: T) => {
    onValueChange(item);
    setOpen(false);
  };

  // Get display text
  const displayText = value
    ? getDisplayValue(value)
    : placeholder;

  return (
    <div className="space-y-2 w-full">
      {label && (
        <Label className={cn("text-[12px] font-normal text-gray-300", labelClassName)}>
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
              "w-full justify-between min-w-[150px]",
              sizeClasses[size],
              !value && "text-muted-foreground",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500",
              buttonClassName
            )}
            disabled={disabled}
          >
            {displayText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className={cn(
            "w-[var(--radix-popover-trigger-width)] p-0",
            popoverClassName
          )}
          align="start"
          side="bottom"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            {enableSearch && (
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchTerm}
                onValueChange={handleSearchChange}
              />
            )}
            <CommandList className="max-h-60 overflow-y-auto">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {data.map((item, index) => {
                  const itemId = getItemId(item);
                  const itemValue = getItemValue(item);
                  const displayValue = getDisplayValue(item);
                  const isSelected = value ? getItemId(value) === itemId : false;
                  const isCustom = isCustomOption(item);

                  return (
                    <CommandItem
                      key={itemId}
                      value={itemValue}
                      onSelect={() => handleSelect(item)}
                      ref={enablePagination && index === data.length - 1 ? ref : null}
                      className={sizeClasses[size]}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {renderItem ? renderItem(item) : (isCustom ? displayValue : <>{displayValue}</>)}
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {loading && (
                <div className="text-center py-2">
                  <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-1">{loadingMessage}</p>
                </div>
              )}

              {enablePagination && !loading && lastPage && data.length > 0 && (
                <div className="text-center py-2 text-sm text-gray-400">
                  {noMoreDataMessage}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
