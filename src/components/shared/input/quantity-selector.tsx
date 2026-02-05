"use client";

import { useState, useEffect, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { CustomButton } from "@/components/shared/button/custom-button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max = 999,
  size = "md",
  className,
}: QuantitySelectorProps) {
  const [localValue, setLocalValue] = useState(value);
  const [inputText, setInputText] = useState(String(value));
  const inputDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external value when it changes
  useEffect(() => {
    setLocalValue(value);
    setInputText(String(value));
  }, [value]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    };
  }, []);

  const clamp = (v: number) => Math.min(Math.max(v, min), max);

  const commit = (newValue: number) => {
    const clamped = clamp(newValue);
    setLocalValue(clamped);
    setInputText(String(clamped));
    onChange(clamped);
  };

  const handleDecrement = () => {
    if (localValue <= min) return;
    commit(localValue - 1);
  };

  const handleIncrement = () => {
    if (localValue >= max) return;
    commit(localValue + 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setInputText("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    setInputText(raw);

    // Debounce commit for typed input
    if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    inputDebounceRef.current = setTimeout(() => {
      commit(parseInt(raw, 10));
    }, 600);
  };

  const handleBlur = () => {
    if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    const parsed = parseInt(inputText, 10);
    commit(isNaN(parsed) ? min : parsed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const isSmall = size === "sm";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CustomButton
        variant="outline"
        size="icon"
        onClick={handleDecrement}
        className={cn(
          isSmall ? "h-8 w-8" : "h-10 w-10",
          localValue <= min && "opacity-40"
        )}
      >
        <Minus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </CustomButton>

      <input
        type="text"
        inputMode="numeric"
        value={inputText}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "text-center font-bold bg-primary/10 text-primary rounded border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/30",
          isSmall ? "w-12 h-8 text-sm" : "w-16 h-10 text-lg"
        )}
      />

      <CustomButton
        variant="outline"
        size="icon"
        onClick={handleIncrement}
        className={cn(isSmall ? "h-8 w-8" : "h-10 w-10")}
      >
        <Plus className={cn(isSmall ? "h-3 w-3" : "h-4 w-4")} />
      </CustomButton>
    </div>
  );
}
