"use client";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { ChangeEventHandler, useCallback, useState } from "react";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerInputProps {
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
}

export default function DatePickerInput({
  defaultValue,
  onChange,
  className,
  placeholder = "Pick a date",
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(() =>
    defaultValue ? format(defaultValue, "dd-MM-y") : ""
  );
  const [date, setDate] = useState<Date | undefined>(defaultValue);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setInputValue(e.currentTarget.value);
    const date = parse(e.currentTarget.value, "dd-MM-y", new Date());
    if (isValid(date)) {
      setDate(date);
      onChange?.(date);
    } else {
      setDate(undefined);
      onChange?.(undefined);
    }
  };

  const handleSelectDate = useCallback(
    (selected: Date | undefined) => {
      setDate(selected);
      onChange?.(selected);
      if (selected) {
        setOpen(false);
        setInputValue(format(selected, "dd-MM-y"));
      } else {
        setInputValue("");
      }
    },
    [onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelectDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
