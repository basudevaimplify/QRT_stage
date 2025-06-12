import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { Navbar, FileUpload, DataTable, Spinner, Alert, JsonViewer, IconDocumentText, IconUpload, IconEye, IconChartBar, ReportSection } from './components';
import { ProcessResponseData, ColumnDefinition, RouteConfig, TransformedProcessResult, TransformedRetrievalResult, ReportSectionContent } from './types';
import { uploadFileAndProcess, fetchData } from './services';

// --- Default Column Definitions (examples, extend as needed) ---
const commonJournalColumns: ColumnDefinition[] = [
  { Header: 'Journal ID', accessor: 'journal_id' },
  { Header: 'Date', accessor: 'transaction_date' },
  { Header: 'Account Code', accessor: 'account_code' },
  { Header: 'Account Name', accessor: 'account_name' },
  { Header: 'Debit', accessor: 'debit_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
  { Header: 'Credit', accessor: 'credit_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
  { Header: 'Entity', accessor: 'entity' },
  { Header: 'Description', accessor: 'description' },
];

const intercoColumns: ColumnDefinition[] = [
  { Header: 'Transaction ID', accessor: 'transaction_id' },
  { Header: 'From Entity', accessor: 'entity_from' },
  { Header: 'To Entity', accessor: 'entity_to' },
  { Header: 'Account Code', accessor: 'account_code' },
  { Header: 'Amount', accessor: 'amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
  { Header: 'Date', accessor: 'transaction_date' },
  { Header: 'Status', accessor: 'status' },
];

const consolidationColumns: ColumnDefinition[] = [
  { Header: 'Entity Code', accessor: 'entity_code' },
  { Header: 'Account Code', accessor: 'account_code' },
  { Header: 'Account Name', accessor: 'account_name' },
  { Header: 'Debit', accessor: 'debit_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
  { Header: 'Credit', accessor: 'credit_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
  { Header: 'Date', accessor: 'transaction_date' },
  { Header: 'Interco Flag', accessor: 'interco_flag' },
];

const gstColumns: ColumnDefinition[] = [
    { Header: 'Invoice No.', accessor: 'invoice_number' },
    { Header: 'GSTIN', accessor: 'gstin' },
    { Header: 'Vendor', accessor: 'vendor_name' },
    { Header: 'Date', accessor: 'invoice_date' },
    { Header: 'Taxable Amt', accessor: 'taxable_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val},
    { Header: 'CGST', accessor: 'cgst_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'SGST', accessor: 'sgst_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'IGST', accessor: 'igst_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'Total Amt', accessor: 'total_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'ITC Eligible', accessor: 'itc_eligible' },
];

const tdsColumns: ColumnDefinition[] = [
    { Header: 'Challan No.', accessor: 'challan_number' },
    { Header: 'PAN', accessor: 'pan' },
    { Header: 'Vendor', accessor: 'vendor_name' },
    { Header: 'Section', accessor: 'section_code' },
    { Header: 'TDS Amt', accessor: 'tds_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'Date', accessor: 'transaction_date' },
    { Header: 'Payment Amt', accessor: 'payment_amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'Status', accessor: 'status' },
];

const provisionColumns: ColumnDefinition[] = [
    { Header: 'Expense Category', accessor: 'expense_category' },
    { Header: 'Vendor', accessor: 'vendor_name' },
    { Header: 'Amount', accessor: 'amount', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
    { Header: 'Frequency', accessor: 'frequency' },
    { Header: 'Last Provision', accessor: 'last_provision_date' },
    { Header: 'Expected Date', accessor: 'expected_date' },
    { Header: 'Confidence', accessor: 'confidence_score', Cell: (val) => typeof val === 'number' ? val.toFixed(2) : val },
];


// --- Route Configuration ---
const routeConfigurations: RouteConfig[] = [
  // Process Routes
  { path: '/process/journal', title: 'Journal Entry Processing', type: 'process', endpoint: '/process_journal_entries', fileTypePrompt: 'Upload Journal CSV', defaultTableColumns: commonJournalColumns },
  { path: '/process/interco', title: 'Intercompany Reconciliation', type: 'process', endpoint: '/process_interco_entries', fileTypePrompt: 'Upload Intercompany CSV', defaultTableColumns: intercoColumns },
  { path: '/process/consolidation', title: 'Consolidation Processing', type: 'process', endpoint: '/process_consolidated_entries', fileTypePrompt: 'Upload Consolidation CSV', defaultTableColumns: consolidationColumns },
  { path: '/process/gst', title: 'GST Validation', type: 'process', endpoint: '/process_gst_entries', fileTypePrompt: 'Upload GST CSV', defaultTableColumns: gstColumns },
  { path: '/process/tds', title: 'TDS Validation', type: 'process', endpoint: '/process_tds_entries', fileTypePrompt: 'Upload TDS CSV', defaultTableColumns: tdsColumns },
  { path: '/process/provision', title: 'Provision Planning', type: 'process', endpoint: '/process_provision_entries', fileTypePrompt: 'Upload Provision CSV', defaultTableColumns: provisionColumns },
  // View Routes
  { path: '/view/provision-planning', title: 'Provision Planning Data', type: 'view', endpoint: '/api/provision-planning', defaultTableColumns: provisionColumns },
  { path: '/view/consolidation', title: 'Consolidation Data', type: 'view', endpoint: '/api/consolidation', defaultTableColumns: consolidationColumns },
  { 
    path: '/view/financial-report', 
    title: 'Financial Report', 
    type: 'view', 
    endpoint: '/api/financial-report',
    transformRetrievalResponse: (res) => {
        const sections: ReportSectionContent[] = [];
        if (res.status === 'success' && res.data) {
            const financialData = res.data.financial_data || res.data; // Backend financial_report data is nested
            const summary = res.data.summary;

            if (res.llm_feedback) { // LLM Analysis from backend
                 sections.push({ title: 'LLM Analysis', type: 'text', content: res.llm_feedback });
            }
            if(summary) {
                 sections.push({ title: 'Report Summary', type: 'json', content: summary });
            }
            if (res.validation_report) { // Main validation_report from ProcessResponse
                 sections.push({ title: 'Overall Validation', type: 'json', content: res.validation_report });
            }

            const dataCategories: {key:string, name:string, cols: ColumnDefinition[]}[] = [
                {key: 'provisions', name: 'Provisions', cols: provisionColumns},
                {key: 'consolidation', name: 'Consolidation Entries', cols: consolidationColumns},
                {key: 'journal_entries', name: 'Journal Entries', cols: commonJournalColumns},
                {key: 'interco_reconciliation', name: 'Intercompany Reconciliation', cols: intercoColumns},
                {key: 'gst_validation', name: 'GST Validation', cols: gstColumns},
                {key: 'tds_validation', name: 'TDS Validation', cols: tdsColumns},
            ];

            for (const category of dataCategories) {
                if (financialData[category.key] && Array.isArray(financialData[category.key])) {
                    sections.push({
                        title: category.name,
                        type: 'table',
                        tableData: financialData[category.key],
                        tableColumns: category.cols
                    });
                }
            }
        } else if (res.message) {
             sections.push({ title: 'Status', type: 'text', content: res.message });
        }
        return { sections };
    }
  },
  { 
    path: '/view/audit-log', 
    title: 'Audit Log Report', 
    type: 'view', 
    endpoint: '/api/audit-log',
    transformRetrievalResponse: (res) => {
        const sections: ReportSectionContent[] = [];
        if (res.status === 'success') {
            // Add LLM Feedback section
            if (res.llm_feedback) {
                sections.push({ 
                    title: 'Audit Analysis', 
                    type: 'text', 
                    content: res.llm_feedback 
                });
            }

            // Add Validation Report section
            if (res.validation_report) {
                sections.push({ 
                    title: 'Validation Summary', 
                    type: 'json', 
                    content: res.validation_report 
                });
            }

            // Add any additional data sections if available
            if (res.data) {
                const auditData = res.data.audit_data || res.data;
                const dataCategories: {key:string, name:string, cols: ColumnDefinition[], subKey?: string}[] = [
                    {key: 'journal_reconciliation', name: 'Journal Reconciliation', cols: commonJournalColumns},
                    {key: 'interco_reconciliation', name: 'Intercompany Reconciliation', cols: intercoColumns},
                    {key: 'tax_compliance', subKey:'gst', name: 'GST Compliance', cols: gstColumns},
                    {key: 'tax_compliance', subKey:'tds', name: 'TDS Compliance', cols: tdsColumns},
                    {key: 'provisions', name: 'Provisions Audit', cols: provisionColumns},
                    {key: 'consolidation', name: 'Consolidation Audit', cols: consolidationColumns},
                    {key: 'audit_logs', name: 'System Audit Logs', cols: [
                        {Header: 'Log ID', accessor: 'id'},
                        {Header: 'Journal ID', accessor: 'journal_id'},
                        {Header: 'Date', accessor: 'transaction_date'},
                        {Header: 'User', accessor: 'user_id'},
                        {Header: 'Action', accessor: 'action_type'},
                        {Header: 'Details', accessor: 'change_details'},
                        {Header: 'Status', accessor: 'audit_status'},
                    ]},
                ];

                for (const category of dataCategories) {
                    let dataSet = auditData[category.key];
                    if(category.subKey && dataSet) {
                        dataSet = dataSet[category.subKey];
                    }
                    if (dataSet && Array.isArray(dataSet)) {
                        sections.push({
                            title: category.name,
                            type: 'table',
                            tableData: dataSet,
                            tableColumns: category.cols
                        });
                    }
                }
            }
        } else if (res.message) {
            sections.push({ title: 'Status', type: 'text', content: res.message });
        }
        return { sections };
    }
  },
  { path: '/view/journal-entries', title: 'Journal Entries Data', type: 'view', endpoint: '/api/journal-entries', defaultTableColumns: commonJournalColumns },
  { 
    path: '/view/interco-reconciliation', 
    title: 'Intercompany Rec. Data', 
    type: 'view', 
    endpoint: '/api/interco-reconciliation', 
    defaultTableColumns: intercoColumns,
    transformRetrievalResponse: (res) => {
      const sections: ReportSectionContent[] = [];
      if (res.status === 'success') {
        // Add LLM Feedback section first
        if (res.llm_feedback) {
          sections.push({ 
            title: 'Reconciliation Analysis', 
            type: 'text', 
            content: res.llm_feedback 
          });
        }

        // Add Validation Report if available
        if (res.validation_report) {
          sections.push({ 
            title: 'Validation Summary', 
            type: 'json', 
            content: res.validation_report 
          });
        }

        // Add main data table
        if (res.data && Array.isArray(res.data)) {
          sections.push({
            title: 'Intercompany Transactions',
            type: 'table',
            tableData: res.data,
            tableColumns: intercoColumns
          });
        }
      } else if (res.message) {
        sections.push({ title: 'Status', type: 'text', content: res.message });
      }
      return { sections };
    }
  },
  { path: '/view/gst-validation', title: 'GST Validation Data', type: 'view', endpoint: '/api/gst-validation', defaultTableColumns: gstColumns },
  { path: '/view/tds-validation', title: 'TDS Validation Data', type: 'view', endpoint: '/api/tds-validation', defaultTableColumns: tdsColumns },
  { path: '/view/traces-data', title: 'TRACES Data', type: 'view', endpoint: '/api/traces-data', defaultTableColumns: [{Header: 'ID', accessor: 'id'}, {Header:'Data', accessor:'data_field'}] /* Placeholder */ },
];

// Default transformer for process responses
const defaultTransformProcessResponse = (response: ProcessResponseData, defaultColumns?: ColumnDefinition[]): TransformedProcessResult => {
  const result: TransformedProcessResult = {
    message: response.message || (response.status === 'success' ? 'Operation successful.' : 'Operation failed.'),
    status: response.status === 'success' ? 'success' : 'error',
    llmFeedback: response.llm_feedback,
    additionalReports: [],
  };

  if (response.data && Array.isArray(response.data)) {
    result.mainData = {
      records: response.data,
      columns: defaultColumns || Object.keys(response.data[0] || {}).map(key => ({ Header: key, accessor: key })),
    };
  }
  
  if (response.validation_report) {
    result.additionalReports?.push({ title: 'Validation Report', type: 'json', content: response.validation_report });
  }
  if (response.reconciliation_report) {
    result.additionalReports?.push({ title: 'Reconciliation Report', type: 'json', content: response.reconciliation_report });
  }
  if (response.audit_trail) {
    result.additionalReports?.push({ title: 'Audit Trail', type: 'json', content: response.audit_trail });
  }
  if (response.confidence_score !== undefined && response.confidence_score !== null) {
    result.additionalReports?.push({ title: 'Confidence Score', type: 'text', content: response.confidence_score.toFixed(2) });
  }
  if (response.error && response.status !== 'success') {
     result.message = response.error; // Prefer specific error message
  }

  return result;
};

// Default transformer for retrieval responses
const defaultTransformRetrievalResponse = (response: ProcessResponseData, defaultColumns?: ColumnDefinition[]): TransformedRetrievalResult => {
  const sections: ReportSectionContent[] = [];
  if (response.status === 'success') {
    if (response.data && Array.isArray(response.data)) {
      sections.push({
        title: 'Retrieved Data',
        type: 'table',
        tableData: response.data,
        tableColumns: defaultColumns || (response.data.length > 0 ? Object.keys(response.data[0]).map(key => ({ Header: key, accessor: key })) : [])
      });
    } else if (response.data) { // Non-array data, perhaps an object
        sections.push({ title: 'Retrieved Data', type: 'json', content: response.data });
    }
    if (response.llm_feedback) {
        sections.push({ title: 'LLM Feedback', type: 'text', content: response.llm_feedback });
    }
    // Any other reports?
  } else {
     sections.push({ title: 'Error', type: 'text', content: response.error || response.message || 'Failed to retrieve data.' });
  }
  return { sections };
};


// --- Views ---
const Dashboard: React.FC = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold text-primary-700 mb-6">Welcome to IntelliFin</h1>
    <p className="text-lg text-secondary-600 mb-8">
      Your intelligent assistant for financial data processing and analysis. 
      Use the navigation menu to upload data or view reports.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {routeConfigurations.slice(0,6).map(route => ( // Show first 6 as examples
        <NavLinkItem key={route.path} title={route.title} path={route.path} type={route.type} />
      ))}
    </div>
  </div>
);

interface NavLinkItemProps { title: string; path: string; type: 'process' | 'view'; }
const NavLinkItem: React.FC<NavLinkItemProps> = ({ title, path, type}) => (
  <a href={`#${path}`} className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-secondary-200 group">
    <div className="flex items-center space-x-3 mb-3">
      {type === 'process' ? <IconUpload className="w-8 h-8 text-primary-500 group-hover:text-primary-600 transition-colors" /> : <IconEye className="w-8 h-8 text-primary-500 group-hover:text-primary-600 transition-colors" />}
      <h2 className="text-xl font-semibold text-primary-700 group-hover:text-primary-800 transition-colors">{title}</h2>
    </div>
    <p className="text-sm text-secondary-500">
      {type === 'process' ? 'Upload and process data for ' : 'View existing data for '} {title.toLowerCase()}.
    </p>
  </a>
);

const GenericViewComponent: React.FC = () => {
  const { '*': dynamicPath } = useParams<{ '*': string }>();
  const location = useLocation();
  
  const routeConfig = useMemo(() => 
    routeConfigurations.find(rc => location.pathname === rc.path || location.pathname === rc.path + '/' || (dynamicPath && rc.path.endsWith(dynamicPath))),
    [location.pathname, dynamicPath]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformedProcessResult | TransformedRetrievalResult | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!routeConfig || routeConfig.type !== 'process' || !routeConfig.endpoint) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await uploadFileAndProcess(routeConfig.endpoint, file);
      console.log('Upload response:', response); // Debug log
      const transformFn = routeConfig.transformProcessResponse || ((res) => defaultTransformProcessResponse(res, routeConfig.defaultTableColumns));
      setResult(transformFn(response));
      if (response.status !== 'success') {
        setError(response.error || response.message || 'Processing failed.');
      }
    } catch (err) {
      console.error('Upload error:', err); // Debug log
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setIsLoading(false);
    }
  }, [routeConfig]);

  const fetchDataForView = useCallback(async () => {
    if (!routeConfig || routeConfig.type !== 'view' || !routeConfig.endpoint) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    const response = await fetchData(routeConfig.endpoint);
    const transformFn = routeConfig.transformRetrievalResponse || ((res) => defaultTransformRetrievalResponse(res, routeConfig.defaultTableColumns));
    setResult(transformFn(response));
     if (response.status !== 'success') setError(response.error || response.message || 'Fetching data failed.');
    setIsLoading(false);
  }, [routeConfig]);

  useEffect(() => {
    if (routeConfig && routeConfig.type === 'view') {
      fetchDataForView();
    }
     // Reset state when route changes
    setError(null);
    setResult(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeConfig, fetchDataForView]); // Add fetchDataForView to dependency array

  if (!routeConfig) {
    return <div className="p-8"><Alert type="error" message="Page configuration not found." /></div>;
  }
  
  const currentResult = result as (TransformedProcessResult & TransformedRetrievalResult); // Combine types for easier access

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-6">{routeConfig.title}</h1>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      
      {routeConfig.type === 'process' && routeConfig.fileTypePrompt && (
        <FileUpload 
          onFileUpload={handleFileUpload} 
          promptText={routeConfig.fileTypePrompt}
          disabled={isLoading}
        />
      )}

      {isLoading && <Spinner />}

      {currentResult && routeConfig.type === 'process' && (currentResult as TransformedProcessResult).message && (
        <Alert type={(currentResult as TransformedProcessResult).status} message={(currentResult as TransformedProcessResult).message} />
      )}
      
      {currentResult && (
        <div className="mt-6 space-y-6">
          {/* For Process View LLM Feedback */}
          {routeConfig.type === 'process' && (currentResult as TransformedProcessResult).llmFeedback && (
            <JsonViewer title="LLM Feedback" data={{ feedback: (currentResult as TransformedProcessResult).llmFeedback }} defaultOpen={true} />
          )}

          {/* For Process View Main Data */}
          {routeConfig.type === 'process' && (currentResult as TransformedProcessResult).mainData && (
            <DataTable 
              title="Processed Data"
              data={(currentResult as TransformedProcessResult).mainData!.records} 
              columns={(currentResult as TransformedProcessResult).mainData!.columns} 
            />
          )}
          
          {/* For Process View Additional Reports */}
          {routeConfig.type === 'process' && (currentResult as TransformedProcessResult).additionalReports?.map((report, idx) => (
             <ReportSection key={`proc-report-${idx}`} section={report} />
          ))}

          {/* For Retrieval View Sections */}
          {routeConfig.type === 'view' && (currentResult as TransformedRetrievalResult).sections?.map((section, idx) => (
            <ReportSection key={`ret-section-${idx}`} section={section} />
          ))}
        </div>
      )}
    </div>
  );
};


// --- App ---
const App: React.FC = () => {
  const navStructure = [
    { 
      groupName: "Data Processing", 
      items: routeConfigurations.filter(r => r.type === 'process').map(r => ({name: r.title, path: r.path, icon: <IconUpload className="w-4 h-4 mr-1"/>})) 
    },
    { 
      groupName: "View Data & Reports", 
      items: routeConfigurations.filter(r => r.type === 'view').map(r => ({name: r.title, path: r.path, icon: <IconEye className="w-4 h-4 mr-1"/>}))
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Navbar navStructure={navStructure} />
      <main className="flex-1 ml-64 bg-secondary-50"> {/* Adjust ml to navbar width */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {routeConfigurations.map(route => (
            <Route key={route.path} path={route.path} element={<GenericViewComponent />} />
          ))}
           <Route path="*" element={<GenericViewComponent />} /> {/* Fallback for dynamic parts */}
        </Routes>
      </main>
    </div>
  );
};

export default App;
