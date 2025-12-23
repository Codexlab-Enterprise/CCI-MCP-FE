// types/installment.ts
export interface InstallmentItem {
  dueDate: string;
  amountDue: number;
  label: string;
}

export interface BulkInstallmentResponse {
  items: InstallmentItem[];
}

export interface BulkInstallmentPayload {
  // Define your payload structure based on what your API expects
  installments: Array<{
    amount: number;
    dueDate: string;
    
  }>;
  // or whatever structure your backend expects
}