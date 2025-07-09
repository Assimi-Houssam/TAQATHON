import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectWrapperProps<TFormSchema extends FieldValues> {
  form: UseFormReturn<TFormSchema>;
  name: Path<TFormSchema>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  tooltip?: string;
  onChange?: (value: string) => void;
}

const FormSelectWrapper = <TFormSchema extends FieldValues>({
  form,
  name,
  label,
  options,
  placeholder,
  className,
  required = false,
  tooltip,
  onChange,
}: FormSelectWrapperProps<TFormSchema>) => {
  const uniqueOptions = [
    ...new Map(options.map((item) => [item.value, item])).values(),
  ];

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const handleChange = (value: string) => {
          if (onChange) {
            onChange(value);
          }
          field.onChange(value);
        };

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
                {tooltip && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Info className="h-3 w-3 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </FormLabel>
            )}
            <Select onValueChange={handleChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {uniqueOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default FormSelectWrapper;
