import { CompanyFormComponentProps } from "@/types/company-form-schema";
import { useTranslations } from "next-intl";
import { DropzoneOptions } from "react-dropzone";
import FileUploadWrapper from "../../common/FileUploadWrapper";

const DocumentUpload: React.FC<CompanyFormComponentProps> = ({ form }) => {
  const t = useTranslations("companyRegistration");
  const dropzoneOptions: DropzoneOptions = {
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc", ".docx"],
    },
    maxFiles: 3,
    maxSize: 4 * 1024 * 1024,
    multiple: true,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <FileUploadWrapper
        form={form}
        name="documents.companyStatutes"
        label={t("documents.companyStatutes")}
        dropZoneConfig={dropzoneOptions}
        required
      />
      <FileUploadWrapper
        form={form}
        name="documents.termsOfUseAndAccess"
        label={t("documents.termsOfUse")}
        dropZoneConfig={dropzoneOptions}
        required
      />
      <FileUploadWrapper
        form={form}
        name="documents.commercialRegistry"
        label={t("documents.commercialRegistry")}
        dropZoneConfig={dropzoneOptions}
        required
      />
      <FileUploadWrapper
        form={form}
        name="documents.financialStatements"
        label={t("documents.financialStatements")}
        dropZoneConfig={dropzoneOptions}
        required
      />
      <FileUploadWrapper
        form={form}
        name="documents.clientReferences"
        label={t("documents.clientReferences")}
        dropZoneConfig={dropzoneOptions}
      />
    </div>
  );
};

export default DocumentUpload;
