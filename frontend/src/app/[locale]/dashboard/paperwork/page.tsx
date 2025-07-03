"use client";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  DollarSign,
  Edit,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type DocumentsType = {
  [key: number]: { id: number; title: string; pdfUrl: string }[];
};

type CategoryCard = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  count?: number;
};

type RegistrationInfo = {
  registrationNumber: string;
  registrationDate: string;
  legalForm: string;
  status: string;
  address: string;
  capital: string;
  sector: string;
};

type FinancialRecord = {
  year: number;
  revenue: string;
  profit: string;
  growth: number;
  quarter: number;
};

type CompanyMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
};

type Certification = {
  id: number;
  name: string;
  issuer: string;
  validFrom: string;
  validUntil: string;
  status: string;
  documentUrl: string;
};

type ViewProps = {
  companyId: number;
};

// Mock data
const mockCompanies = [
  {
    id: 1,
    name: "Maroc Telecom",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT14fLqh3C-UxiejotJc7m8CZtHTPJd17xbkQ&s",
  },
  {
    id: 2,
    name: "OCP Group",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRNGJKTj_EKf7RImOnpoTvTkWKeVhY8cOlCQ&s",
  },
  {
    id: 3,
    name: "Bank Al-Maghrib",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Bank_Al-Maghrib_logo.png/1200px-Bank_Al-Maghrib_logo.png",
  },
  {
    id: 4,
    name: "Royal Air Maroc",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Logo_Royal_Air_Maroc.svg/2560px-Logo_Royal_Air_Maroc.svg.png",
  },
  {
    id: 5,
    name: "Attijariwafa Bank",
    logo: "https://upload.wikimedia.org/wikipedia/en/4/49/ATTIJARIWAFA_BANK_LOGO.png",
  },
  {
    id: 6,
    name: "BMCE Bank",
    logo: "https://www.forumhorizonsmaroc.com/wp-content/uploads/2019/12/Capture_BOAG_logo-1.png",
  },
  {
    id: 7,
    name: "Cosumar",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOYN5YaqDztdBcTmkNhXXq68GjMk0gBlbsSg&s",
  },
  {
    id: 8,
    name: "Label'Vie",
    logo: "https://labelvie.ma/wp-content/uploads/2020/01/logo-actus.jpg",
  },
];

const mockDocuments: DocumentsType = {
  1: [
    {
      id: 1,
      title: "Registre de Commerce",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7351_Ar.pdf",
    },
    {
      id: 2,
      title: "Attestation Fiscale",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7350_Ar.pdf",
    },
    {
      id: 3,
      title: "Attestation CNSS",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7349_Ar.pdf",
    },
    {
      id: 4,
      title: "Déclaration ICE",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7348_Ar.pdf",
    },
  ],
  2: [
    {
      id: 5,
      title: "Statuts de l'entreprise",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7347_Ar.pdf",
    },
    {
      id: 6,
      title: "Bilan Financier",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7346_Ar.pdf",
    },
    {
      id: 7,
      title: "Attestation RIB",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7345_Ar.pdf",
    },
  ],
  3: [
    {
      id: 8,
      title: "Modèle J",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7344_Ar.pdf",
    },
    {
      id: 9,
      title: "Attestation d'Assurance",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7343_Ar.pdf",
    },
    {
      id: 10,
      title: "Déclaration IR",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7342_Ar.pdf",
    },
  ],
  4: [
    {
      id: 11,
      title: "Certificat ISO",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7341_Ar.pdf",
    },
    {
      id: 12,
      title: "Attestation de Référence",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7340_Ar.pdf",
    },
    {
      id: 13,
      title: "Déclaration TVA",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7339_Ar.pdf",
    },
  ],
  5: [
    {
      id: 14,
      title: "Attestation de Qualification",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7338_Ar.pdf",
    },
    {
      id: 15,
      title: "Certificat de Conformité",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7337_Ar.pdf",
    },
    {
      id: 16,
      title: "Bordereau CNSS",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7336_Ar.pdf",
    },
  ],
  6: [
    {
      id: 17,
      title: "Autorisation d'Exercice",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7335_Ar.pdf",
    },
    {
      id: 18,
      title: "Déclaration IS",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7334_Ar.pdf",
    },
    {
      id: 19,
      title: "Attestation de Régularité Fiscale",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7333_Ar.pdf",
    },
  ],
  7: [
    {
      id: 20,
      title: "Certificat Négatif",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7332_Ar.pdf",
    },
    {
      id: 21,
      title: "PV d'Assemblée Générale",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7331_Ar.pdf",
    },
    {
      id: 22,
      title: "Déclaration d'Existence",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7330_Ar.pdf",
    },
  ],
  8: [
    {
      id: 23,
      title: "Attestation de Chiffre d'Affaires",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7329_Ar.pdf",
    },
    {
      id: 24,
      title: "Caution Bancaire",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7328_Ar.pdf",
    },
    {
      id: 25,
      title: "Déclaration des Salariés",
      pdfUrl: "http://www.sgg.gov.ma/BO/AR/3111/2024/BO_7327_Ar.pdf",
    },
  ],
};

const companyCategories: CategoryCard[] = [
  {
    id: "documents",
    title: "Documents",
    icon: <FileText className="w-6 h-6" />,
    description: "View and manage company documents",
    count: 12,
  },
  {
    id: "registration",
    title: "Registration",
    icon: <Building2 className="w-6 h-6" />,
    description: "Company registration details",
  },
  {
    id: "financials",
    title: "Financials",
    icon: <DollarSign className="w-6 h-6" />,
    description: "Financial reports and statements",
    count: 4,
  },
  {
    id: "members",
    title: "Members",
    icon: <Users className="w-6 h-6" />,
    description: "Company members and roles",
    count: 8,
  },
  {
    id: "certifications",
    title: "Certifications",
    icon: <FileText className="w-6 h-6" />,
    description: "View company certifications",
    count: 3,
  },
];

const mockRegistrationInfo: { [key: number]: RegistrationInfo } = {
  1: {
    registrationNumber: "RC123456",
    registrationDate: "2020-01-15",
    legalForm: "SA",
    status: "Active",
    address: "123 Avenue Hassan II, Casablanca",
    capital: "10,000,000 MAD",
    sector: "Telecommunications",
  },
};

const mockFinancials: { [key: number]: FinancialRecord[] } = {
  1: [
    {
      year: 2024,
      quarter: 1,
      revenue: "2.5B MAD",
      profit: "500M MAD",
      growth: 12.5,
    },
    {
      year: 2023,
      quarter: 4,
      revenue: "2.3B MAD",
      profit: "450M MAD",
      growth: 8.2,
    },
    {
      year: 2023,
      quarter: 3,
      revenue: "2.1B MAD",
      profit: "420M MAD",
      growth: 5.7,
    },
    {
      year: 2023,
      quarter: 2,
      revenue: "2.0B MAD",
      profit: "400M MAD",
      growth: 4.2,
    },
  ],
};

const mockMembers: { [key: number]: CompanyMember[] } = {
  1: [
    {
      id: 1,
      name: "Hassan Alami",
      role: "CEO",
      email: "hassan.alami@company.com",
      phone: "+212 6XX-XXXXXX",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hassan",
      department: "Executive",
    },
    {
      id: 2,
      name: "Fatima Zahra",
      role: "CFO",
      email: "fatima.zahra@company.com",
      phone: "+212 6XX-XXXXXX",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
      department: "Finance",
    },
  ],
};

const mockCertifications: { [key: number]: Certification[] } = {
  1: [
    {
      id: 1,
      name: "ISO 9001:2015",
      issuer: "Bureau Veritas",
      validFrom: "2023-01-01",
      validUntil: "2026-01-01",
      status: "active",
      documentUrl: "http://example.com/cert1.pdf",
    },
    {
      id: 2,
      name: "ISO 14001:2015",
      issuer: "TÜV SÜD",
      validFrom: "2022-06-15",
      validUntil: "2025-06-15",
      status: "active",
      documentUrl: "http://example.com/cert2.pdf",
    },
    {
      id: 3,
      name: "ISO 27001",
      issuer: "DNV GL",
      validFrom: "2023-03-01",
      validUntil: "2024-03-01",
      status: "pending",
      documentUrl: "http://example.com/cert3.pdf",
    },
  ],
};

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="text-sm text-gray-500 mb-1">
      {label.replace(/([A-Z])/g, " $1").trim()}
    </div>
    <div className="font-medium">{value}</div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <h3 className="text-lg font-bold mb-4 text-gray-900">{title}</h3>
);

const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10"
    />
  </div>
);

const RegistrationView = ({ companyId }: ViewProps) => {
  const info = mockRegistrationInfo[companyId];
  return (
    <div className="space-y-6">
      <SectionHeader title="Registration Information" />
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(info).map(([key, value]) => (
          <InfoCard key={key} label={key} value={value} />
        ))}
      </div>
    </div>
  );
};

const MemberCard = ({ member }: { member: CompanyMember }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-start space-x-4">
    <Image
      src={member.avatar}
      alt={member.name}
      width={48}
      height={48}
      className="rounded-full"
    />
    <div>
      <h4 className="font-medium">{member.name}</h4>
      <p className="text-sm text-gray-600">{member.role}</p>
      <p className="text-sm text-gray-500">{member.department}</p>
      <div className="mt-2 text-sm text-gray-500">
        <div>{member.email}</div>
        <div>{member.phone}</div>
      </div>
    </div>
  </div>
);

const MembersView = ({ companyId }: ViewProps) => {
  const members = mockMembers[companyId];
  return (
    <div className="space-y-6">
      <SectionHeader title="Company Members" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

const CompanyList = ({
  searchQuery,
  setSearchQuery,
  selectedCompany,
  setSelectedCompany,
  filteredCompanies,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCompany: number | null;
  setSelectedCompany: (id: number) => void;
  filteredCompanies: typeof mockCompanies;
}) => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Companies</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-2">
          {filteredCompanies.map((company) => (
            <Button
              key={company.id}
              variant={selectedCompany === company.id ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
              onClick={() => setSelectedCompany(company.id)}
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={32}
                height={32}
                className="object-contain"
              />
              {company.name}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);

const DocumentViewer = ({
  doc,
  isLoading,
}: {
  doc: (typeof mockDocuments)[number][number];
  isLoading: boolean;
}) => (
  <div className="p-4 border-t border-gray-200">
    {isLoading ? (
      <div className="flex items-center justify-center h-[400px] bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    ) : (
      <iframe
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
          doc.pdfUrl
        )}&embedded=true`}
        className="w-full h-[400px]"
        title={doc.title}
      />
    )}
  </div>
);

const fadeAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

const CategoryGrid = ({
  categories,
  onSelect,
}: {
  categories: CategoryCard[];
  onSelect: (id: string) => void;
}) => (
  <motion.div className="grid grid-cols-2 gap-4 mb-6" {...fadeAnimation}>
    {categories.map((category, index) => (
      <motion.div
        key={category.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className="cursor-pointer hover:border-primary"
          onClick={() => onSelect(category.id)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {category.icon}
              </div>
              {category.count !== undefined && (
                <Badge variant="secondary">{category.count}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CardTitle className="mb-2">{category.title}</CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </motion.div>
);

const AdminActions = () => (
  <div className="flex gap-2">
    <Button>
      <Plus className="w-4 h-4 mr-2" /> Add New
    </Button>
    <Button variant="secondary">
      <Edit className="w-4 h-4 mr-2" /> Edit
    </Button>
    <Button variant="destructive">
      <Trash className="w-4 h-4 mr-2" /> Delete
    </Button>
  </div>
);

const BreadcrumbComponent = ({
  company,
  category,
  onCompanyClick,
  onCategoryClick,
}: {
  company: (typeof mockCompanies)[number] | undefined;
  category: string | null;
  onCompanyClick: () => void;
  onCategoryClick: () => void;
}) => (
  <Breadcrumb>
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onCompanyClick();
          }}
          className="hover:text-green-600"
        >
          <div className="flex items-center gap-2">
            {company && (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={24}
                height={24}
                className="object-contain"
              />
            )}
            <span>{company?.name}</span>
          </div>
        </BreadcrumbLink>
      </BreadcrumbItem>
      {category && (
        <>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick();
              }}
              className="hover:text-green-600"
            >
              {companyCategories.find((c) => c.id === category)?.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      )}
    </BreadcrumbList>
  </Breadcrumb>
);

const FinancialsView = ({ companyId }: { companyId: number }) => {
  const financials = mockFinancials[companyId];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Quarter</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Growth</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {financials.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.year}</TableCell>
                <TableCell>Q{record.quarter}</TableCell>
                <TableCell>{record.revenue}</TableCell>
                <TableCell>{record.profit}</TableCell>
                <TableCell>
                  <span
                    className={
                      record.growth > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {record.growth}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const DocumentsView = ({ companyId }: { companyId: number }) => {
  const [documentSearch, setDocumentSearch] = useState("");
  const [loadingDocs, setLoadingDocs] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [expandedDocs, setExpandedDocs] = useState<{ [key: number]: boolean }>(
    {}
  );

  const toggleDocument = (docId: number) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
    if (!expandedDocs[docId]) {
      setLoadingDocs((prev) => ({ ...prev, [docId]: true }));
      setTimeout(() => {
        setLoadingDocs((prev) => ({ ...prev, [docId]: false }));
      }, 2000);
    }
  };

  const getFilteredDocuments = (companyId: number) => {
    return mockDocuments[companyId].filter((doc) =>
      doc.title.toLowerCase().includes(documentSearch.toLowerCase())
    );
  };

  return (
    <div>
      <SectionHeader title="Documents" />
      <SearchInput
        value={documentSearch}
        onChange={setDocumentSearch}
        placeholder="Search documents..."
      />
      <ul className="space-y-3">
        {getFilteredDocuments(companyId).map((doc) => (
          <li
            key={doc.id}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`p-4 cursor-pointer transition-colors
                              ${
                                expandedDocs[doc.id]
                                  ? "bg-green-50 text-green-900"
                                  : "hover:bg-gray-50"
                              }`}
              onClick={() => toggleDocument(doc.id)}
            >
              <h4 className="font-medium">{doc.title}</h4>
            </div>
            {expandedDocs[doc.id] && (
              <DocumentViewer doc={doc} isLoading={loadingDocs[doc.id]} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const CertificationsView = ({ companyId }: ViewProps) => {
  const certifications = mockCertifications[companyId] || [];

  const getStatusColor = (status: Certification["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Company Certifications" />
      <div className="grid gap-4">
        {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{cert.name}</CardTitle>
                <Badge className={getStatusColor(cert.status)}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Issuer" value={cert.issuer} />
                <InfoCard label="Valid From" value={cert.validFrom} />
                <InfoCard label="Valid Until" value={cert.validUntil} />
                <div className="flex items-center">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Certificate
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function PaperworkPage() {
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = mockCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompanySelect = (id: number) => {
    setSelectedCompany(id);
    setSelectedCategory(null);
  };

  return (
    <div className="flex h-screen p-5 gap-5 bg-white">
      <CompanyList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCompany={selectedCompany}
        setSelectedCompany={handleCompanySelect}
        filteredCompanies={filteredCompanies}
      />

      <div className="flex-1 bg-white rounded-xl shadow-lg p-5 border border-gray-200 overflow-y-auto">
        <AnimatePresence mode="wait">
          {selectedCompany ? (
            <motion.div
              key={`company-${selectedCompany}-${selectedCategory}`}
              {...fadeAnimation}
            >
              <BreadcrumbComponent
                company={mockCompanies.find((c) => c.id === selectedCompany)}
                category={selectedCategory}
                onCompanyClick={() => setSelectedCategory(null)}
                onCategoryClick={() => setSelectedCategory(null)}
              />
              <div className="flex justify-end mb-6">
                <AdminActions />
              </div>

              <AnimatePresence mode="wait">
                {selectedCategory ? (
                  <motion.div key={selectedCategory} {...fadeAnimation}>
                    {selectedCategory === "documents" && (
                      <DocumentsView companyId={selectedCompany} />
                    )}
                    {selectedCategory === "registration" && (
                      <RegistrationView companyId={selectedCompany} />
                    )}
                    {selectedCategory === "financials" && (
                      <FinancialsView companyId={selectedCompany} />
                    )}
                    {selectedCategory === "members" && (
                      <MembersView companyId={selectedCompany} />
                    )}
                    {selectedCategory === "certifications" && (
                      <CertificationsView companyId={selectedCompany} />
                    )}
                  </motion.div>
                ) : (
                  <CategoryGrid
                    categories={companyCategories}
                    onSelect={setSelectedCategory}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              {...fadeAnimation}
              className="flex items-center justify-center h-full text-gray-500"
            >
              Select a company to view details
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
