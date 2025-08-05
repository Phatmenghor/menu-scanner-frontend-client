"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: { label: string; value: string }[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function ProfileField({
  label,
  value,
  isEditing,
  onChange,
  type = "text",
  options = [],
  disabled = false,
  required = false,
  placeholder,
  className = "",
}: ProfileFieldProps) {
  if (!isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label className="text-sm font-medium text-gray-600">{label}</Label>
        <div className="min-h-[40px] flex items-center">
          <p className="text-sm text-gray-900 break-words">
            {value || (
              <span className="text-gray-400 italic">Not provided</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  const commonProps = {
    value,
    onChange: (e: any) => onChange?.(e.target?.value || e),
    disabled,
    className: "transition-all duration-200 focus:ring-2 focus:ring-blue-500",
    placeholder: placeholder || `Enter ${label.toLowerCase()}`,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {type === "textarea" ? (
        <Textarea {...commonProps} rows={3} />
      ) : type === "select" ? (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input {...commonProps} type={type} />
      )}
    </div>
  );
}
