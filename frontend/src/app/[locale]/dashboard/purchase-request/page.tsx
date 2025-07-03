import { redirect } from "next/navigation";

export default function purchaseRequestPage() {
  redirect("/dashboard/purchase-request/ongoing");
}
