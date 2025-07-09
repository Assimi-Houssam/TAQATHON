import { apiClient } from "@/lib/axios";

/**
 * Get TAQA Agent Dashboard Data
 * Fetches all data needed for the TAQA agent dashboard page.
 */
export async function getAgentDashboardData() {
  try {
    // Helper function for safe fetch with error handling
    const safeFetch = async (url: string) => {
      try {
        const { data } = await apiClient.get(url);
        return { success: true, data };
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return { success: false, error: error };
      }
    };

    // Fetch all dashboard data in parallel
    const [
      companiesRes,
      agentsRes,
      suppliersRes,
      purchaseRequestsRes,
      bidsRes,
    ] = await Promise.allSettled([
      safeFetch("/companies"),
      safeFetch("/users/taqa/agents"),
      safeFetch("/users/taqa/suppliers"),
      safeFetch("/taqa/purchase-requests"),
      safeFetch("/taqa/bids"),
    ]);

    return {
      companies:
        companiesRes.status === "fulfilled" ? companiesRes.value : null,
      agents: agentsRes.status === "fulfilled" ? agentsRes.value : null,
      suppliers:
        suppliersRes.status === "fulfilled" ? suppliersRes.value : null,
      purchaseRequests:
        purchaseRequestsRes.status === "fulfilled"
          ? purchaseRequestsRes.value
          : null,
      bids: bidsRes.status === "fulfilled" ? bidsRes.value : null,
    };
  } catch (error) {
    console.error("Error in getAgentDashboardData:", error);
    throw error;
  }
} 