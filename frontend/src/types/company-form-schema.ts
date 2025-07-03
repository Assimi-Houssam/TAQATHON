import { FieldPath, UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { Certifications } from "./entities/enums/index.enum";

export enum LegalForms {
  SOCIETE_ANONYME = "Société anonyme",
  SOCIETE_RESPONSABILITE_LIMITEE = "Société à responsabilité limitée",
  SOCIETE_COMMANDITE = "Société en commandité",
  SOCIETE_NOM_COLLECTIF = "Société en nom collectif",
  ENTREPRISE_INDIVIDUELLE = "Entreprise individuelle",
  SOCIETE_COMMANDITE_ACTIONS = "Société en commandite par actions",
  SOCIETE_NON_COMMERCIALE = "Société non commerciale",
  SOCIETE_COOPERATIVE = "Société coopérative",
  ENTREPRISE_ETRANGERE = "Entreprise étrangère",
  CONSORTIUM = "Consortium",
  CABINETS_ASSOCIES = "Cabinets d'associés / Etudes",
  ETABLISSEMENT_PUBLIC = "Etablissement public",
  ORGANISATION_CHARITE = "Organisation de charité",
  SAS = "Société par actions simplifiée",
  GIE = "Groupement d'intérêt économique",
  EIRL = "Entreprise individuelle à responsabilité limitée",
  EURL = "Entreprise unipersonnelle à responsabilité limitée",
  SELARL = "Société d'exercice libéral à responsabilité limitée",
  SCP = "Société civile professionnelle",
  SASU = "Société par actions simplifiée unipersonnelle",
  ASSOCIATION_1901 = "Association Loi 1901",
  SOCIETE_EUROPEENNE = "Société européenne (SE)",
  AUTRE = "Autre forme juridique",
}
export const USER_TITLES = ["M", "Mme"] as const;

export const USER_JOB_TITLES = [
  "Autre",
  "Propriétaire",
  "Chef de projet",
  "Service Commercial/Marketing",
  "Département Production",
  "Département Projet",
  "Département Achat",
  "Professionnel/Consultant",
  "Représentant légal",
  "Président",
  "Vice-président",
  "Dirigeant unique",
  "Directeur général",
] as const;

export const LANGUAGES = [
  { value: "fr", label: "Française" },
  { value: "en", label: "English" },
] as const;

export const TIMEZONES = [
  "UTC−12:00 – Baker Island, Howland Island",
  "UTC−11:00 – American Samoa, Niue",
  "UTC−10:00 – Hawaii, French Polynesia (Tahiti)",
  "UTC−09:30 – Marquesas Islands",
  "UTC−09:00 – Alaska, Gambier Islands",
  "UTC−08:00 – Pacific Time (US & Canada), Baja California",
  "UTC−07:00 – Mountain Time (US & Canada), Chihuahua",
  "UTC−06:00 – Central Time (US & Canada), Central America",
  "UTC−05:00 – Eastern Time (US & Canada), Colombia, Peru",
  "UTC−04:00 – Atlantic Time (Canada), Venezuela, Bolivia",
  "UTC−03:30 – Newfoundland Time (Canada)",
  "UTC−03:00 – Argentina, Brazil (East), Uruguay",
  "UTC−02:00 – South Georgia & the South Sandwich Islands",
  "UTC−01:00 – Azores, Cape Verde",
  "UTC±00:00 – Greenwich Mean Time (GMT), Coordinated Universal Time (UTC), Iceland, Senegal, Gambia",
  "UTC+01:00 – Central European Time (CET), West Africa Time (WAT)",
  "UTC+02:00 – Eastern European Time (EET), Egypt, South Africa",
  "UTC+03:00 – Moscow Time, Arabian Standard Time",
  "UTC+03:30 – Iran Standard Time",
  "UTC+04:00 – United Arab Emirates, Azerbaijan, Samara",
  "UTC+04:30 – Afghanistan",
  "UTC+05:00 – Pakistan, Yekaterinburg Time",
  "UTC+05:30 – India, Sri Lanka",
  "UTC+05:45 – Nepal",
  "UTC+06:00 – Bangladesh, Bhutan, Omsk Time",
  "UTC+06:30 – Myanmar, Cocos Islands",
  "UTC+07:00 – Thailand, Vietnam, Novosibirsk Time",
  "UTC+08:00 – China, Singapore, Western Australia",
  "UTC+08:45 – Southeastern Western Australia",
  "UTC+09:00 – Japan, Korea, Chita Time",
  "UTC+09:30 – Central Australia",
  "UTC+10:00 – Eastern Australia, Vladivostok Time",
  "UTC+10:30 – Lord Howe Island",
  "UTC+11:00 – Solomon Islands, Magadan Time",
  "UTC+12:00 – Fiji, Kamchatka, New Zealand Standard Time",
  "UTC+12:45 – Chatham Islands",
  "UTC+13:00 – Tonga, Samoa, Tokelau",
  "UTC+14:00 – Line Islands (Kiribati)",
] as const;

export const companyFormSchema = z.object({
  basicInfo: z.object({
    legalName: z.string().min(1, "Required"),
    commercialName: z.string().min(1, "Required"),
    legalForm: z.nativeEnum(LegalForms),
    ICE: z.string().min(1, "Required"),
    siretNumber: z.string().optional(),
    vatNumber: z.string().optional(),
  }),

  contact: z.object({
    primaryContact: z.string().min(1, "Required"),
    email: z.string().email().min(1, "Required"),
    primaryPhone: z.string().min(1, "Required"),
    secondaryPhone: z.string().optional(),
  }),

  address: z.object({
    registeredOffice: z.string().min(1, "Required"),
    headquarters: z.string().min(1, "Required"),
    branchLocations: z.string().min(1, "Required"),
  }),

  legal: z.object({
    businessActivities: z.array(z.string()).min(1, "Required"),
    industryCode: z.string().optional(),
    certifications: z.nativeEnum(Certifications).array(),
    otherCertifications: z.string().optional(),
  }),

  documents: z.object({
    companyStatutes: z.array(z.string()),
    termsOfUseAndAccess: z.array(z.string()),
    commercialRegistry: z.array(z.string()),
    financialStatements: z.array(z.string()),
    clientReferences: z.array(z.string()).optional(),
  }),

  additional: z.array(
    z.object({
      formfieldId: z.number(),
      content: z.any(),
    })
  ),
});

export type CompanyFormData = z.infer<typeof companyFormSchema>;
export type CompanyFormFieldPath = FieldPath<CompanyFormData>;

export interface CompanyFormComponentProps {
  form: UseFormReturn<CompanyFormData>;
}
