export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type?: "user" | "company" | "pRequest" | "bid" | "report";
}

export interface SearchOptions {
  query: string;
  page?: number;
  limit?: number;
  types?: string[];
}
