
import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { ColumnDefinition, ReportSectionContent } from './types';

// --- Icons ---
const IconChevronDown: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

const IconChevronUp: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M14.78 11.78a.75.75 0 0 1-1.06 0L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
  </svg>
);

const IconUpload: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const IconDocumentText: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const IconEye: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const IconChartBar: React.FC<{className?: string}> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${className}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);


// --- Navbar ---
interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}
interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Navbar: React.FC<{ navStructure: NavGroup[] }> = ({ navStructure }) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  return (
    <nav className="bg-primary-800 text-white w-64 min-h-screen p-4 space-y-2 fixed top-0 left-0 shadow-lg">
      <div className="text-2xl font-bold mb-6 text-center text-primary-100">IntelliFin</div>
      {navStructure.map(group => (
        <div key={group.groupName}>
          <button
            onClick={() => toggleGroup(group.groupName)}
            className="w-full flex justify-between items-center py-2 px-3 text-left hover:bg-primary-700 rounded-md transition-colors"
          >
            <span className="font-semibold">{group.groupName}</span>
            {openGroups[group.groupName] ? <IconChevronUp /> : <IconChevronDown />}
          </button>
          {openGroups[group.groupName] && (
            <ul className="pl-3 mt-1 space-y-1">
              {group.items.map(item => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 py-2 px-3 rounded-md transition-colors text-sm ${
                        isActive ? 'bg-primary-600 font-medium' : 'hover:bg-primary-700 hover:text-primary-100'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
};

// --- FileUpload ---
interface FileUploadProps {
  onFileUpload: (file: File) => void;
  promptText: string;
  disabled?: boolean;
}
export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, promptText, disabled }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const openFileExplorer = () => {
    inputRef.current?.click();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-secondary-200">
      <label 
        htmlFor="dropzone-file"
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${dragActive ? "border-primary-500 bg-primary-50" : "border-secondary-300 hover:border-primary-400 hover:bg-secondary-50"}`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <IconUpload className="w-10 h-10 mb-3 text-secondary-400"/>
          <p className="mb-2 text-sm text-secondary-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-secondary-500">{promptText} (CSV format)</p>
          {selectedFile && <p className="mt-2 text-sm text-primary-600">Selected: {selectedFile.name}</p>}
        </div>
        <input ref={inputRef} id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".csv" disabled={disabled} />
      </label>
      
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || disabled}
        className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-md transition-colors
                   disabled:bg-secondary-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        <IconUpload className="w-5 h-5"/>
        <span>Upload and Process</span>
      </button>
    </div>
  );
};

// --- DataTable ---
interface DataTableProps {
  data: any[];
  columns: ColumnDefinition[];
  title?: string;
}
export const DataTable: React.FC<DataTableProps> = ({ data, columns, title }) => {
  if (!data || data.length === 0) {
    return title ? <div className="p-4 text-secondary-600">{title}: No data available.</div> : <div className="p-4 text-secondary-600">No data available.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-secondary-200">
      {title && <h3 className="text-lg font-semibold p-4 bg-secondary-50 border-b border-secondary-200 text-primary-700">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-100">
            <tr>
              {columns.map((col, index) => (
                <th key={index} scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  {col.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-secondary-50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-secondary-700">
                    {col.Cell ? col.Cell(row[col.accessor], row) : (row[col.accessor] === null || row[col.accessor] === undefined ? 'N/A' : String(row[col.accessor]))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Spinner ---
export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-600"></div>
    <span className="ml-3 text-secondary-700">Loading...</span>
  </div>
);

// --- Alert ---
interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
}
export const Alert: React.FC<AlertProps> = ({ message, type, onClose }) => {
  const baseClasses = "p-4 mb-4 border rounded-md shadow-sm flex items-center";
  const typeClasses = {
    success: "bg-green-50 border-green-300 text-green-700",
    error: "bg-red-50 border-red-300 text-red-700",
    info: "bg-blue-50 border-blue-300 text-blue-700",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-700",
  };

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span className="flex-grow">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-lg font-semibold hover:opacity-75">&times;</button>
      )}
    </div>
  );
};

// --- JsonViewer ---
interface JsonViewerProps {
  data: object | any[];
  title?: string;
  defaultOpen?: boolean;
}
export const JsonViewer: React.FC<JsonViewerProps> = ({ data, title, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!data || (typeof data === 'object' && Object.keys(data).length === 0) || (Array.isArray(data) && data.length === 0)) {
     return title ? <div className="p-4 text-secondary-600">{title}: No data to display.</div> : null;
  }

  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <div className="my-4 bg-white shadow rounded-lg border border-secondary-200">
      {title && (
         <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="w-full flex justify-between items-center p-4 bg-secondary-50 hover:bg-secondary-100 border-b border-secondary-200 text-left"
          >
          <h3 className="text-md font-semibold text-primary-700">{title}</h3>
          {isOpen ? <IconChevronUp /> : <IconChevronDown />}
        </button>
      )}
      {isOpen && (
        <pre className="p-4 text-sm bg-secondary-50 text-secondary-800 overflow-x-auto max-h-96">
          {formattedJson}
        </pre>
      )}
    </div>
  );
};


// --- ReportSection ---
export const ReportSection: React.FC<{ section: ReportSectionContent }> = ({ section }) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open for report sections

  return (
    <div className="my-6 bg-white shadow-lg rounded-xl border border-secondary-200 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-4 bg-primary-500 hover:bg-primary-600 text-white text-left transition-colors"
      >
        <h3 className="text-xl font-semibold">{section.title}</h3>
        {isOpen ? <IconChevronUp className="text-white"/> : <IconChevronDown className="text-white"/>}
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-primary-400">
          {section.type === 'table' && section.tableData && section.tableColumns && (
            <DataTable data={section.tableData} columns={section.tableColumns} />
          )}
          {section.type === 'json' && section.content && (
            <JsonViewer data={section.content} defaultOpen={true} />
          )}
          {section.type === 'text' && section.content && (
            <p className="text-secondary-700 whitespace-pre-wrap">{section.content}</p>
          )}
           {section.type === 'html' && section.content && (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
          )}
          {section.type === 'list' && section.listItems && section.listItems.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-secondary-700">
              {section.listItems.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          )}
          {((section.type === 'table' && (!section.tableData || section.tableData.length === 0)) ||
            (section.type === 'json' && !section.content) ||
            (section.type === 'text' && !section.content) ||
            (section.type === 'html' && !section.content) ||
            (section.type === 'list' && (!section.listItems || section.listItems.length === 0))
          ) && (
            <p className="text-secondary-500">No content available for this section.</p>
          )}
        </div>
      )}
    </div>
  );
};


export { IconDocumentText, IconUpload, IconEye, IconChartBar };

    