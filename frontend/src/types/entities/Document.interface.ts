export interface Document {
  id: string;
  type: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  description: string;
  isLinked: boolean;
  uploaded_by_id: number;
  url: string; // temporary (for fixing build issue)
  createdAt: string;
  updatedAt: string;
}
