import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import FormFieldWrapper from "./form/common/FormFieldWrapper";

interface Shareholder {
  name: string;
  type: string;
  nationality: string;
}

export interface OwnershipFormData {
  ownership: {
    shareholders: Shareholder[];
    shareholderPercentages: number[];
  };
}

interface ShareholderFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  index: number;
  onRemove: () => void;
}

const ShareholderFields = <T extends FieldValues>({
  form,
  index,
  onRemove,
}: ShareholderFieldsProps<T>) => {
  return (
    <div className="p-4 border rounded-lg bg-white space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">
          Shareholder {index + 1}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldWrapper
          form={form}
          name={`ownership.shareholders.${index}.name` as Path<T>}
          label="Shareholder Name"
          placeholder="Enter shareholder name"
          required
        />

        <FormFieldWrapper
          form={form}
          name={`ownership.shareholders.${index}.type` as Path<T>}
          label="Shareholder Type"
          placeholder="Individual/Company"
          required
        />

        <FormFieldWrapper
          form={form}
          name={`ownership.shareholderPercentages.${index}` as Path<T>}
          label="Ownership Percentage"
          type="number"
          placeholder="Enter percentage"
          className="md:col-span-2"
          required
        />

        <FormFieldWrapper
          form={form}
          name={`ownership.shareholders.${index}.nationality` as Path<T>}
          label="Nationality"
          placeholder="Enter nationality"
          required
        />
      </div>
    </div>
  );
};

export default ShareholderFields;
