"use client";

import React from "react";
import { Controller, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextFieldProps {
  name: string;
  label: string;
  control: any;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  type?: "text" | "email" | "tel" | "password" | "number" | "url";
  placeholder?: string;
  className?: string;
  valueAsNumber?: boolean; // New prop
}

export function TextField({
  name,
  label,
  control,
  error,
  disabled = false,
  required = false,
  type = "text",
  placeholder = "",
  className = "",
  valueAsNumber = false, // Default false
}: TextFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-[12px] font-normal text-gray-300">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
            onChange={(e) => {
              if (valueAsNumber && type === "number") {
                const value = e.target.valueAsNumber;
                // If NaN or 0, set as undefined (for optional fields)
                field.onChange(isNaN(value) || value === 0 ? undefined : value);
              } else {
                field.onChange(e.target.value);
              }
            }}
            className={`transition-colors ${disabled ? "bg-muted/50" : ""} ${
              error ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
        )}
      />
      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
