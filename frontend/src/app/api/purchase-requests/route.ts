import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "0";

  try {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    const response = await fetch(
              `https://supplier.taqagroup.ma/api/opportunities/public-all?page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching purchase requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchase requests" },
      { status: 500 }
    );
  }
}

export type PurchaseRequestInfo = {
  buyerOrganization: string;
  category: string;
  description: string;
  modificationDate: number;
  oppDeadline: number;
  opportunityId: number;
  rfiDeadline: number;
  tenderReference: string;
  tenderTitle: string;
  url: string;
  taqaSite: string;
  rfiFlag: string;
  multipleCategories: boolean;
  noOrMulipleRFIs: boolean;
  supprimer: number;
  categoryName: string;
  parentCategoryName: string;
};
