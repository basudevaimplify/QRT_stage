
export interface ProcessResponseData {
  status: string;
  message: string;
  data?: any; // Can be list of records or complex object
  error?: string;
  llm_feedback?: string;
  confidence_score?: number;
  validation_report?: Record<string, any>;
  reconciliation_report?: Record<string, any>;
  audit_trail?: Record<string, any>[];
}

export interface ColumnDefinition {
  Header: string;
  accessor: string; // key in data object
  Cell?: (value: any, row: any) => React.ReactNode; // Custom cell renderer
}

export interface ReportSectionContent {
  title: string;
  type: 'table' | 'json' | 'text' | 'html' | 'list';
  content?: any; // For json, text, html
  listItems?: string[]; // For list type
  tableData?: any[];
  tableColumns?: ColumnDefinition[];
}

export interface TransformedProcessResult {
  message: string;
  status: 'success' | 'error' | 'info';
  llmFeedback?: string;
  mainData?: {
    records: any[];
    columns: ColumnDefinition[];
  };
  additionalReports?: ReportSectionContent[];
}

export interface TransformedRetrievalResult {
 sections: ReportSectionContent[];
}

export interface RouteConfig {
  path: string;
  title: string;
  type: 'process' | 'view';
  endpoint: string;
  fileTypePrompt?: string; // For process type
  // Transformer for POST processing results
  transformProcessResponse?: (response: ProcessResponseData) => TransformedProcessResult;
  // Transformer for GET retrieval results
  transformRetrievalResponse?: (response: ProcessResponseData) => TransformedRetrievalResult;
  // Default columns for tables, can be overridden by transformer
  defaultTableColumns?: ColumnDefinition[];
}

// Example: Define specific types for known data structures if needed
export interface JournalEntry {
  id?: number;
  journal_id: string;
  transaction_date: string;
  account_code: string;
  account_name?: string;
  debit_amount?: number;
  credit_amount?: number;
  entity?: string;
  description?: string;
}
    