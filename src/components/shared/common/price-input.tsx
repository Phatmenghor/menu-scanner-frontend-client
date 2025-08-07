import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriceInputProps {
  value?: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  currency?: string;
  min?: number;
  max?: number;
  id?: string;
}

export function PriceInput({
  value = "",
  onChange,
  placeholder = "0.00",
  disabled = false,
  className,
  currency = "$",
  min = 0,
  max,
  id,
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Format number to display format
  const formatForDisplay = (num: number | string): string => {
    if (num === "" || num === null || num === undefined) return "";
    const numValue = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(numValue)) return "";
    return numValue.toFixed(2);
  };

  // Parse display value to number
  const parseDisplayValue = (str: string): number => {
    const cleaned = str.replace(/[^\d.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatForDisplay(value));
    }
  }, [value, isFocused]);

  // Initialize display value
  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow empty input
    if (inputValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Remove currency symbol and spaces for processing
    const cleanValue = inputValue.replace(/[$\s,]/g, "");

    // Validate input - allow numbers and one decimal point
    const regex = /^(\d+)?(\.\d{0,2})?$/;

    if (regex.test(cleanValue) || cleanValue === ".") {
      setDisplayValue(cleanValue);

      // Convert to number and call onChange
      const numValue = parseDisplayValue(cleanValue);

      // Apply min/max constraints
      let finalValue = numValue;
      if (min !== undefined && finalValue < min) finalValue = min;
      if (max !== undefined && finalValue > max) finalValue = max;

      onChange(finalValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    const numValue = typeof value === "string" ? parseFloat(value) : value || 0;
    setDisplayValue(numValue > 0 ? numValue.toString() : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format the display value when losing focus
    const numValue = parseDisplayValue(displayValue);
    setDisplayValue(formatForDisplay(numValue));

    // Ensure onChange is called with the final formatted value
    onChange(numValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if (
      [8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true)
    ) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if (
      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
      (e.keyCode < 96 || e.keyCode > 105)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    const numValue = parseFloat(paste.replace(/[^\d.]/g, ""));

    if (!isNaN(numValue)) {
      e.preventDefault();
      setDisplayValue(numValue.toString());
      onChange(numValue);
    }
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
        {currency}
      </div>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("pl-8", className)}
      />
    </div>
  );
}
