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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormField } from "@/types/entities";
import { FormFieldType } from "@/types/entities/enums/index.enum";
import { useTranslations } from "next-intl";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import FileUploadWrapper from "./form/common/FileUploadWrapper";
import FormFieldWrapper from "./form/common/FormFieldWrapper";
import FormSelectWrapper from "./form/common/FormSelectWrapper";

interface FormsAnswerTableProps<T extends FieldValues> {
  formFields: FormField[];
  form: UseFormReturn<T>;
  fieldPath: Path<T>;
  isPending?: boolean;
}

type Answer = {
  formfieldId: number;
  content: string;
};

export function FormsAnswerTable<T extends FieldValues>({
  formFields,
  form,
  fieldPath,
  isPending = false,
}: FormsAnswerTableProps<T>) {
  const t = useTranslations("formAnswerTable");
  const sortedFormFields = [...formFields].sort((a, b) => a.order - b.order);

  const getFieldIndex = (fieldId: number) => {
    const answers = form.getValues(fieldPath) || [];
    let index = answers.findIndex(
      (answer: Answer) => answer.formfieldId === fieldId
    );

    if (index === -1) {
      index = answers.length;
      form.setValue(fieldPath, [
        ...answers,
        { formfieldId: fieldId, content: "" },
      ] as PathValue<T, Path<T>>);
    }

    return index;
  };

  const handleClear = () => {
    form.setValue(fieldPath, [] as PathValue<T, Path<T>>);
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
        throw new Error(`Invalid form field type: ${formField.type}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("order")}</TableHead>
              <TableHead>{t("question")}</TableHead>
              <TableHead>{t("description")}</TableHead>
              <TableHead>{t("answer")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFormFields.map((formField) => (
              <TableRow key={formField.id}>
                <TableCell className="text-muted-foreground">
                  {formField.order}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formField.label} {formField.required && " *"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">
                    {formField.description}
                  </p>
                </TableCell>
                <TableCell>
                  {formField.type === FormFieldType.FILE ? (
                    <FileUploadWrapper
                      form={form}
                      name={
                        `${fieldPath}.${getFieldIndex(
                          formField.id
                        )}.content` as Path<T>
                      }
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
                      name={
                        `${fieldPath}.${getFieldIndex(
                          formField.id
                        )}.content` as Path<T>
                      }
                      options={(formField.selectOptions || "")
                        .split("\n")
                        .filter((option) => option.trim())
                        .map((option) => ({
                          value: option.trim(),
                          label: option,
                        }))}
                      required={formField.required}
                    />
                  ) : formField.type === FormFieldType.MULTIPLE_CHOICE ? (
                    <div className="space-y-2">
                      {(formField.selectOptions || "")
                        .split("\n")
                        .filter((option) => option.trim())
                        .map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              value={option}
                              onChange={(e) => {
                                const fieldIndex = getFieldIndex(formField.id);
                                const currentValue = form.getValues(
                                  `${fieldPath}.${fieldIndex}.content` as Path<T>
                                );
                                const values = currentValue
                                  ? currentValue.split(",")
                                  : [];
                                if (e.target.checked) {
                                  values.push(option);
                                } else {
                                  const index = values.indexOf(option);
                                  if (index > -1) values.splice(index, 1);
                                }
                                form.setValue(
                                  `${fieldPath}.${fieldIndex}.content` as Path<T>,
                                  values.join(",") as PathValue<T, Path<T>>
                                );
                              }}
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                    </div>
                  ) : formField.type === FormFieldType.BOOLEAN ? (
                    <FormSelectWrapper
                      form={form}
                      name={
                        `${fieldPath}.${getFieldIndex(
                          formField.id
                        )}.content` as Path<T>
                      }
                      options={[
                        { value: "true", label: "Yes" },
                        { value: "false", label: "No" },
                      ]}
                      required={formField.required}
                    />
                  ) : formField.type === FormFieldType.NUMBER ? (
                    <FormFieldWrapper
                      form={form}
                      name={
                        `${fieldPath}.${getFieldIndex(
                          formField.id
                        )}.content` as Path<T>
                      }
                      type="number"
                      required={formField.required}
                    />
                  ) : (
                    <FormFieldWrapper
                      form={form}
                      name={
                        `${fieldPath}.${getFieldIndex(
                          formField.id
                        )}.content` as Path<T>
                      }
                      inputComponent={getInputComponent(formField)}
                      required={formField.required}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              {t("clearAll")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("clearAllTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("clearAllConfirmation")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={handleClear}>
                {t("clear")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
