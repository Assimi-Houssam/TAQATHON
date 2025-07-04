import DatePicker from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye, EyeOff, Info } from "lucide-react";
import { ComponentProps, useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface FormFieldWrapperProps<TFormSchema extends FieldValues> {
  form: UseFormReturn<TFormSchema>;
  name: Path<TFormSchema>;
  label?: string;
  type?: ComponentProps<typeof Input>["type"];
  placeholder?: string;
  className?: string;
  required?: boolean;
  inputComponent?: "text" | "phone" | "date" | "password" | "textarea";
  maxLength?: number;
  pattern?: string;
  tooltip?: string;
  rows?: number;
  error?: string;
}

const FormFieldWrapper = <TFormSchema extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  className,
  required = false,
  inputComponent = "text",
  maxLength,
  pattern,
  tooltip,
  rows = 3,
  error,
}: FormFieldWrapperProps<TFormSchema>) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className="text-gray-700 font-medium flex items-center gap-1">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
              {error && <span className="text-red-500 ml-1">{error}</span>}
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
          <FormControl>
            {inputComponent === "phone" ? (
              <PhoneInput
                placeholder={placeholder}
                {...field}
                defaultCountry="MA"
              />
            ) : inputComponent === "date" ? (
              <DatePicker
                defaultValue={field.value}
                onChange={field.onChange}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            ) : inputComponent === "password" ? (
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  type={showPassword ? "text" : "password"}
                  {...field}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : inputComponent === "textarea" ? (
              <Textarea
                placeholder={placeholder}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                rows={rows}
                {...field}
                value={(field.value ?? "").toString()}
                onChange={(e) => {
                  field.onChange(e.target.value || "");
                }}
              />
            ) : (
              <Input
                type={type}
                placeholder={placeholder}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                maxLength={maxLength}
                pattern={pattern}
                {...field}
                value={(field.value ?? "").toString()}
                onChange={(e) => {
                  const value =
                    type === "number" ? Number(e.target.value) : e.target.value;
                  field.onChange(value || "");
                }}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FormFieldWrapper;
