import { Form } from "@/components/ui/form";
import { FormField } from "@/types/entities";
import { FormFieldType } from "@/types/entities/enums/index.enum";
import { LayoutConfig } from "@/types/forms-controller";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";
import { Button } from "../button";
import { CustomCard } from "./custom-card";
import FileUploadWrapper from "./form/common/FileUploadWrapper";
import FormFieldWrapper from "./form/common/FormFieldWrapper";
import FormSelectWrapper from "./form/common/FormSelectWrapper";
import { getColSpan } from "./FormLayoutConfig";

// Add default layout values
const DEFAULT_LAYOUT: LayoutConfig = {
  groups: [
    {
      id: "default",
      title: "Form Fields",
      columns: 1,
      spacing: 4,
      formfieldIds: [],
    },
  ],
};

interface FormLayoutRendererProps {
  formFields: FormField[];
  layout?: LayoutConfig | null; // Make layout optional
  onSubmit: (data: Record<string, string>) => void;
  isPending: boolean;
}

// Reuse the schema creation logic from FormsAnswerTable
const createAnswerSetSchema = (formFields: FormField[]) => {
  const schemaFields = formFields.reduce((acc, formField) => {
    acc[`formfield_${formField.id}`] = formField.required
      ? z.string().min(1, "This field is required")
      : z.string().optional();
    return acc;
  }, {} as Record<string, z.ZodType>);

  return z.object(schemaFields);
};

export function FormLayoutRenderer({
  formFields,
  layout = DEFAULT_LAYOUT, // Provide default value
  onSubmit,
  isPending,
}: FormLayoutRendererProps) {
  const schema = createAnswerSetSchema(formFields);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: formFields.reduce((acc, formField) => {
      acc[`formfield_${formField.id}`] = "";
      return acc;
    }, {} as Record<string, string>),
  });

  const handleSubmit = (data: Record<string, string>) => {
    onSubmit(data);
  };

  const handleClear = () => {
    form.reset();
  };

  const getInputComponent = (formField: FormField) => {
    switch (formField.type) {
      case FormFieldType.TEXT:
        return "text";
      case FormFieldType.PHONE:
        return "phone";
      case FormFieldType.DATE:
        return "date";
      case FormFieldType.PASSWORD:
        return "password";
      case FormFieldType.TEXTAREA:
        return "textarea";
      default:
        throw new Error(`Invalid formfield type: ${formField.type}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {layout?.groups?.map((group) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CustomCard title={group.title}>
              <div
                className="grid grid-cols-12 gap-4"
                style={{
                  gap: `${group.spacing * 4}px`,
                }}
              >
                {group.formfieldIds.map((formFieldId) => {
                  const formField = formFields.find(
                    (q) => q.id === formFieldId
                  );

                  if (!formField) return null;

                  return (
                    <div
                      key={formField.id}
                      className={`${getColSpan(group.columns)}`}
                    >
                      <div className="space-y-2">
                        {formField.type === FormFieldType.FILE ? (
                          <FileUploadWrapper
                            form={form}
                            name={`formfield_${formField.id}`}
                            label={formField.label}
                            required={formField.required}
                            dropZoneConfig={{
                              accept: {
                                "*/*": [
                                  ".pdf",
                                  ".doc",
                                  ".docx",
                                  ".jpg",
                                  ".jpeg",
                                  ".png",
                                  ".gif",
                                ],
                              },
                              maxFiles: 1,
                              maxSize: 4 * 1024 * 1024,
                            }}
                          />
                        ) : formField.type === FormFieldType.SELECT ? (
                          <FormSelectWrapper
                            form={form}
                            name={`formfield_${formField.id}`}
                            label={formField.label}
                            placeholder={formField.description}
                            tooltip={formField.tooltip}
                            options={(formField.selectOptions || "")
                              .split("\n")
                              .filter((option) => option.trim())
                              .map((option) => ({
                                value: option.trim(),
                                label: option.trim(),
                              }))}
                            required={formField.required}
                          />
                        ) : formField.type === FormFieldType.BOOLEAN ? (
                          <FormSelectWrapper
                            form={form}
                            name={`formfield_${formField.id}`}
                            label={formField.label}
                            placeholder={formField.description}
                            tooltip={formField.tooltip}
                            options={[
                              { value: "true", label: "Yes" },
                              { value: "false", label: "No" },
                            ]}
                            required={formField.required}
                          />
                        ) : formField.type === FormFieldType.NUMBER ? (
                          <FormFieldWrapper
                            form={form}
                            name={`formfield_${formField.id}`}
                            label={formField.label}
                            placeholder={formField.description}
                            tooltip={formField.tooltip}
                            type="number"
                            required={formField.required}
                          />
                        ) : (
                          <FormFieldWrapper
                            form={form}
                            name={`formfield_${formField.id}`}
                            label={formField.label}
                            placeholder={formField.description}
                            tooltip={formField.tooltip}
                            inputComponent={getInputComponent(formField)}
                            required={formField.required}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CustomCard>
          </motion.div>
        ))}

        <div className="flex justify-end gap-4 mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all answers?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your answers will be
                  cleared.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClear}>
                  Clear
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-custom-green-500"
          >
            {isPending ? "Submitting..." : "Submit All Answers"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
