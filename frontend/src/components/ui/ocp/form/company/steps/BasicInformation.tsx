import { CustomCard } from "@/components/ui/ocp/custom-card";
import {
  CompanyFormComponentProps,
  LegalForms,
} from "@/types/company-form-schema";
import { useTranslations } from "next-intl";
import FormFieldWrapper from "../../common/FormFieldWrapper";
import SelectWrapper from "../../common/FormSelectWrapper";

const BasicInformation: React.FC<CompanyFormComponentProps> = ({ form }) => {
  const t = useTranslations("companyRegistration");

  return (
    <div className="space-y-8">
      <CustomCard title={t("basicInfo.title")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            form={form}
            name="basicInfo.legalName"
            label={t("basicInfo.legalName")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="basicInfo.commercialName"
            label={t("basicInfo.commercialName")}
            required
          />
          <SelectWrapper
            form={form}
            name="basicInfo.legalForm"
            label={t("basicInfo.legalForm")}
            options={Object.values(LegalForms).map((form) => ({
              value: form,
              label: form,
            }))}
            required
          />
          <FormFieldWrapper
            form={form}
            name="basicInfo.ICE"
            label={t("basicInfo.iceNumber")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="basicInfo.siretNumber"
            label={t("basicInfo.siretNumber")}
          />
          <FormFieldWrapper
            form={form}
            name="basicInfo.vatNumber"
            label={t("basicInfo.vatNumber")}
          />
        </div>
      </CustomCard>

      <CustomCard title={t("contact.title")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            form={form}
            name="contact.primaryContact"
            label={t("contact.primaryContact")}
            placeholder={t("contact.primaryContactPlaceholder")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="contact.email"
            label={t("contact.email")}
            type="email"
            placeholder={t("contact.emailPlaceholder")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="contact.primaryPhone"
            label={t("contact.primaryPhone")}
            inputComponent="phone"
            placeholder={t("contact.primaryPhonePlaceholder")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="contact.secondaryPhone"
            label={t("contact.secondaryPhone")}
            inputComponent="phone"
            placeholder={t("contact.secondaryPhonePlaceholder")}
          />
        </div>
      </CustomCard>

      <CustomCard title={t("address.title")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormFieldWrapper
            form={form}
            name="address.registeredOffice"
            label={t("address.registeredOffice")}
            placeholder={t("address.registeredOfficePlaceholder")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="address.headquarters"
            label={t("address.headquarters")}
            placeholder={t("address.headquartersPlaceholder")}
            required
          />
          <FormFieldWrapper
            form={form}
            name="address.branchLocations"
            label={t("address.branchLocations")}
            placeholder={t("address.branchLocationsPlaceholder")}
            required
          />
        </div>
      </CustomCard>
    </div>
  );
};

export default BasicInformation;
