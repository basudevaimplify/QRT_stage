import { ProcessResponseData } from './types';

const API_BASE_URL = 'http://localhost:8000'; // Backend server running on localhost

export async function uploadFileAndProcess(endpoint: string, file: File): Promise<ProcessResponseData> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    console.log(`Uploading file to ${API_BASE_URL}${endpoint}`); // Debug log
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status); // Debug log
    const responseData = await response.json();
    console.log('Response data:', responseData); // Debug log

    if (!response.ok) {
      throw new Error(responseData.detail || responseData.error || `Failed to process file: ${response.statusText}`);
    }

    return responseData as ProcessResponseData;
  } catch (error) {
    console.error(`Error in uploadFileAndProcess for endpoint ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      status: 'error',
      message: `API Call Failed: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

export async function fetchData(endpoint: string): Promise<ProcessResponseData> {
  try {
    console.log(`Fetching data from ${API_BASE_URL}${endpoint}`); // Debug log
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    console.log('Response status:', response.status); // Debug log
    
    const responseData = await response.json();
    console.log('Response data:', responseData); // Debug log

    if (!response.ok) {
      throw new Error(responseData.detail || responseData.error || `Failed to fetch data: ${response.statusText}`);
    }

    return responseData as ProcessResponseData;
  } catch (error) {
    console.error(`Error in fetchData for endpoint ${endpoint}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {
      status: 'error',
      message: `API Call Failed: ${errorMessage}`,
      error: errorMessage,
    };
  }
}