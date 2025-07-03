import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { CloudUpload, Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DropzoneOptions } from "react-dropzone";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";

interface FileUploadWrapperProps<TFormSchema extends FieldValues> {
  form: UseFormReturn<TFormSchema>;
  name: Path<TFormSchema>;
  label?: string;
  required?: boolean;
  dropZoneConfig: DropzoneOptions;
}

const FileUploadWrapper = <TFormSchema extends FieldValues>({
  form,
  name,
  label,
  required,
  dropZoneConfig,
}: FileUploadWrapperProps<TFormSchema>) => {
  const t = useTranslations("fileUploadWrapper");
  const [files, setFiles] = useState<File[] | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const getAcceptedFileTypes = () => {
    const accept = dropZoneConfig.accept;
    if (!accept) return t("allFiles");

    return Object.entries(accept)
      .flatMap(([, values]) => values)
      .join(" | ");
  };

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      return response.data;
    },
    onSuccess: (response) => {
      const currentValues = form.getValues(name) || [];
      const newValues = Array.isArray(currentValues)
        ? [...currentValues, response.id]
        : [response.id];

      form.setValue(
        name,
        newValues as unknown as PathValue<TFormSchema, Path<TFormSchema>>
      );
      setUploadProgress(100);
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setFiles(null);
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiClient.delete(`/documents/${fileId}`);
    },
    onSuccess: () => {
      setFiles(null);
      setUploadProgress(0);
      form.setValue(
        name,
        [] as unknown as PathValue<TFormSchema, Path<TFormSchema>>
      );
    },
    onError: (error) => {
      console.error("Delete failed:", error);
    },
  });

  const handleFileChange = async (newFiles: File[] | null) => {
    setFiles(newFiles);
    setUploadProgress(0);

    if (newFiles && newFiles[0]) {
      try {
        await uploadMutation.mutateAsync(newFiles[0]);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  const handleDelete = async () => {
    const fileIds = form.getValues(name);
    if (fileIds && Array.isArray(fileIds) && fileIds.length > 0) {
      try {
        const lastFileId = fileIds[fileIds.length - 1];
        await deleteMutation.mutateAsync(lastFileId);

        const remainingFiles = fileIds.slice(0, -1);
        form.setValue(name, remainingFiles);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    } else {
      setFiles(null);
      setUploadProgress(0);
      form.setValue(
        name,
        [] as unknown as PathValue<TFormSchema, Path<TFormSchema>>
      );
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          {label && (
            <FormLabel className="text-gray-700 font-medium">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-2">
              <FileUploader
                value={files}
                onValueChange={handleFileChange}
                dropzoneOptions={dropZoneConfig}
                className="relative bg-background rounded-lg p-2 group"
              >
                <FileInput
                  id="fileInput"
                  className="group-hover:hover:border-primary group-hover:bg-primary/5 outline-dashed outline-2 outline-slate-200 hover:outline-primary transition-all duration-300"
                >
                  <div className="flex items-center justify-center flex-col p-4 w-full ">
                    <CloudUpload className="text-gray-500 w-10 h-10" />
                    <div className="mb-1 text-sm text-gray-500 dark:text-gray-400 text-center">
                      <div className="font-semibold">{t("clickToUpload")}</div>{" "}
                      <div className="font-light">{t("orDragAndDrop")}</div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getAcceptedFileTypes()}
                    </div>
                  </div>
                </FileInput>
                <FileUploaderContent>
                  {files &&
                    files.length > 0 &&
                    files.map((file, i) => (
                      <div key={i} className="space-y-2">
                        <FileUploaderItem index={i} onDelete={handleDelete}>
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="h-4 w-4 flex-shrink-0 stroke-current" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        </FileUploaderItem>
                        {uploadProgress > 0 && (
                          <Progress value={uploadProgress} className="h-1" />
                        )}
                      </div>
                    ))}
                </FileUploaderContent>
              </FileUploader>
            </div>
          </FormControl>
          <FormDescription>{t("selectAFileToUpload")}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FileUploadWrapper;
