"use client";

import React from "react";
import { Controller, Control, FieldError, FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Monday", short: "Mon" },
  { value: "TUESDAY", label: "Tuesday", short: "Tue" },
  { value: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { value: "THURSDAY", label: "Thursday", short: "Thu" },
  { value: "FRIDAY", label: "Friday", short: "Fri" },
  { value: "SATURDAY", label: "Saturday", short: "Sat" },
  { value: "SUNDAY", label: "Sunday", short: "Sun" },
] as const;

interface MultiSelectDaysFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function MultiSelectDaysField<T extends FieldValues>({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  className = "",
}: MultiSelectDaysFieldProps<T>) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const selectedDays = (field.value as string[]) || [];

          const toggleDay = (day: string) => {
            const newDays = selectedDays.includes(day)
              ? selectedDays.filter((d) => d !== day)
              : [...selectedDays, day];
            field.onChange(newDays);
          };

          return (
            <div
              className={cn(
                "flex flex-wrap gap-2",
                error && "border border-red-500 rounded-md p-2"
              )}
            >
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <div
                    key={day.value}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md border cursor-pointer transition-all min-w-[100px]",
                      isSelected
                        ? "bg-primary/10 border-primary hover:bg-primary/20"
                        : "bg-background border-border hover:bg-accent",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!disabled) {
                        toggleDay(day.value);
                      }
                    }}
                  >
                    <Checkbox
                      id={`${name}-${day.value}`}
                      checked={isSelected}
                      disabled={disabled}
                      className="pointer-events-none"
                    />
                    <Label
                      htmlFor={`${name}-${day.value}`}
                      className="text-sm font-medium cursor-pointer select-none flex-1 pointer-events-none"
                    >
                      {day.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          );
        }}
      />

      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );
}
