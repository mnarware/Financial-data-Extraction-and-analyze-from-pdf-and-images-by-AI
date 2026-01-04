
export interface Transaction {
  date: string;
  description: string;
  outflow: number;
  inflow: number;
  balance: number;
}

export interface Summary {
  total_spend: number;
  total_received: number;
}

export interface ExtractionResult {
  transactions: Transaction[];
  summary: Summary;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
}

export interface AppState {
  isProcessing: boolean;
  result: ExtractionResult | null;
  error: string | null;
  tempFiles: FileData[];
}
