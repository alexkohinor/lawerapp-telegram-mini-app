export interface ExtractedData {
  documentType: string;
  title: string;
  parties: {
    seller: {
      name: string;
      address: string;
      phone: string;
    };
    buyer: {
      name: string;
      address: string;
      phone: string;
    };
  };
  issue: string;
  amount: number;
  demand: string;
  date: string;
  confidence: number;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  successRate: number;
}

export interface DocumentUploadProps {
  onDocumentUploaded: (file: File, type: 'camera' | 'file') => void;
  onAnalysisComplete: (extractedData: ExtractedData) => void;
}

export interface ExtractedDataProps {
  data: ExtractedData;
  onEdit: (field: string, value: string) => void;
  onConfirm: () => void;
}

export interface SolutionProposalProps {
  extractedData: ExtractedData;
  onSolutionSelected: (solution: Solution) => void;
  onGenerateDocument: (solution: Solution) => void;
}

export interface DocumentExportProps {
  documentContent: string;
  documentTitle: string;
  onExport: (format: 'docx' | 'pdf') => void;
}
