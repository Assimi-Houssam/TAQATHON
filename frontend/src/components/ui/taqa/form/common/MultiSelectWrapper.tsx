"use client";

import { Badge } from "@/components/ui/badge";
import { Command, CommandInput } from "@/components/ui/command";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectWrapperProps<TFormSchema extends FieldValues> {
  form: UseFormReturn<TFormSchema>;
  name: Path<TFormSchema>;
  label?: string;
  options: Option[];
  className?: string;
  required?: boolean;
  maxDisplayItems?: number;
  isLoading?: boolean;
}

const MultiSelectWrapper = <TFormSchema extends FieldValues>({
  form,
  name,
  label,
  options,
  className,
  required = false,
  maxDisplayItems = 10,
  isLoading = false,
}: MultiSelectWrapperProps<TFormSchema>) => {
  const [search, setSearch] = useState("");

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-gray-700 font-medium">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="border rounded-md p-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {(field.value || []).map((value: string) => (
                  <Badge key={value} variant="secondary">
                    {options.find((opt) => opt.value === value)?.label || value}
                    <button
                      type="button"
                      onClick={() => {
                        field.onChange(
                          field.value.filter((v: string) => v !== value)
                        );
                      }}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Command className="w-full">
                <div className="relative">
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                    className="mb-2"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div
                  className={`${
                    options.length > maxDisplayItems
                      ? "max-h-[200px] overflow-y-auto custom-scrollbar"
                      : ""
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : options.length === 0 ? (
                    <div className="px-2 py-1.5 text-gray-500">
                      No options available
                    </div>
                  ) : (
                    options
                      .filter((option) => !field.value?.includes(option.value))
                      .filter((option) =>
                        option.label
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((option) => (
                        <div
                          key={option.value}
                          className="px-2 py-1.5 cursor-pointer hover:bg-gray-100 rounded"
                          onClick={() => {
                            field.onChange([
                              ...(field.value || []),
                              option.value,
                            ]);
                          }}
                        >
                          {option.label}
                        </div>
                      ))
                  )}
                </div>
              </Command>
            </div>
          </FormControl>
          <FormMessage className="text-red-500" />
        </FormItem>
      )}
    />
  );
};

export default MultiSelectWrapper;
