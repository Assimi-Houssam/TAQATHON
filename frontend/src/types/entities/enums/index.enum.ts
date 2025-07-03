export enum EntityTypes {
  OCP_AGENT = "OCP_AGENT",
  SUPPLIER = "SUPPLIER",
}

export enum SupplierStatusAction {
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",
}

export enum ChatType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
}

export enum BidStatus {
  PENDING = "pending",
  DISQUALIFIED = "disqualified",
  AWARDED = "awarded",
  EXPIRED = "expired",
}

export enum CompanyApprovalStatus {
  CREATED = "created",
  FILLED_INFO = "filled_info",
  WAITING_APPROVAL = "waiting_approval",
  REJECTED = "rejected",
  APPROVED = "approved",
}

export enum CompanyStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
}

export enum FormFieldType {
  TEXT = "TEXT",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  DATE = "DATE",
  FILE = "FILE",
  SELECT = "SELECT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  PHONE = "PHONE",
  TEXTAREA = "TEXTAREA",
  PASSWORD = "PASSWORD",
  ARRAY = "ARRAY",
}

export interface LayoutGroup {
  id: string;
  title: string;
  columns: number;
  spacing: number;
  formfieldIds: number[];
}

export interface Layout {
  groups: LayoutGroup[];
}

export enum NotificationType {
  NEW_PURCHASE_REQUEST = "NEW PURCHASE REQUEST",
  MESSAGE = "MESSAGE",
  BID_OPENED = "BID OPENED",
  DISQUALIFIED = "DISQUALIFIED",
  NEW_BID = "NEW BID",
  FEEDBACK = "FEEDBACK",
  WINNING_BID = "WINNING BID",
  EXPIRED_BID = "EXPIRED BID",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
}

export enum PRVisibilityType {
  INVITE_ONLY = "invite_only",
  PUBLIC = "public",
  HIDDEN = "hidden",
}

export enum IncotermsType {
  EXW = "exw",
  FCA = "fca",
  CPT = "cpt",
  CIP = "cip",
  DAT = "dat",
  DAP = "dap",
  DDP = "ddp",
  FAS = "fas",
  FOB = "fob",
  CFR = "cfr",
  CIF = "cif",
}

export enum BuyingEntityType {
  OCP_GROUP = "ocp_group",
  OCP_AFRIQUE = "ocp_afrique",
  OCP_FOUNDATION = "ocp_foundation",
  OCP_SA = "ocp_sa",
  OCP_INT = "ocp_int",
  UM6P = "um6p",
}

export enum PurchaseRequestStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  LOCKED = 'LOCKED',
  WAITING_FOR_SELECTION = 'WAITING_FOR_SELECTION',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  FINISHED = 'FINISHED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export enum LegalForms {
  SARL = "SARL",
  SA = "Société anonyme",
  SAS = "SAS",
  EURL = "EURL",
  INDIVIDUAL = "Individual",
  COOPERATIVE = "Cooperative",
  PARTNERSHIP = "Partnership",
  LLC = "LLC",
  CORPORATION = "Corporation",
  NONPROFIT = "Nonprofit",
}

export enum Certifications {
  ISO_9001 = "ISO 9001",
  ISO_14001 = "ISO 14001",
  ISO_27001 = "ISO 27001",
  ISO_45001 = "ISO 45001",
  ISO_50001 = "ISO 50001",
  ISO_22000 = "ISO 22000",
  ISO_31000 = "ISO 31000",
  ISO_13485 = "ISO 13485",
  ISO_22301 = "ISO 22301",
  ISO_17025 = "ISO 17025",
  ISO_26000 = "ISO 26000",
  ISO_20000 = "ISO 20000",
  ISO_20121 = "ISO 20121",
  ISO_28000 = "ISO 28000",
  ISO_37001 = "ISO 37001",
  ISO_39001 = "ISO 39001",
  ISO_56002 = "ISO 56002",
  ISO_45005 = "ISO 45005",
  ISO_639 = "ISO 639",
  ISO_3166 = "ISO 3166",
  ISO_8601 = "ISO 8601",
  ISO_9241 = "ISO 9241",
  ISO_14971 = "ISO 14971",
  ISO_15189 = "ISO 15189",
  ISO_26262 = "ISO 26262",
  ISO_21500 = "ISO 21500",
  ISO_22005 = "ISO 22005",
  ISO_22222 = "ISO 22222",
  ISO_9241_11 = "ISO 9241-11",
  ISO_17799 = "ISO 17799",
  ISO_20400 = "ISO 20400",
  ISO_20252 = "ISO 20252",
  ISO_10002 = "ISO 10002",
  ISO_28007 = "ISO 28007",
  ISO_21542 = "ISO 21542",
  ISO_24362 = "ISO 24362",
  ISO_18788 = "ISO 18788",
  ISO_50002 = "ISO 50002",
  ISO_19101 = "ISO 19101",
  ISO_11135 = "ISO 11135",
  ISO_18323 = "ISO 18323",
  ISO_10018 = "ISO 10018",
  ISO_19600 = "ISO 19600",
  ISO_21101 = "ISO 21101",
  ISO_22196 = "ISO 22196",
  IATF_16949 = "IATF 16949",
  B_CORP = "B Corp Certification",
  LEED = "LEED Certification",
  SOC_2 = "SOC 2",
  PCI_DSS = "PCI DSS",
  GMP = "GMP",
  HACCP = "HACCP",
  FAIR_TRADE = "Fair Trade Certification",
  CARBON_NEUTRAL = "Carbon Neutral Certification",
  SA8000 = "SA8000",
  CMMI = "CMMI",
  ITIL = "ITIL",
  CE = "CE Marking",
  UL = "UL Certification",
  ENERGY_STAR = "Energy Star Certification",
  OHSAS_18001 = "OHSAS 18001",
}
