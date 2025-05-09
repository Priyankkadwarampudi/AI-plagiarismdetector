export type TextMatch = {
  originalText: string;
  comparisonText: string;
  originalStartIndex: number;
  comparisonStartIndex: number;
  similarity: number;
  source?: string;
};

export type PlagiarismResult = {
  originalText: string;
  comparisonText: string;
  similarityScore: number;
  semanticSimilarity: number;
  matches: TextMatch[];
  timestamp: number;
  source?: string;
};

export type SourceDocument = {
  id: string;
  title: string;
  content: string;
  type: 'academic' | 'web' | 'submission';
  url?: string;
  author?: string;
  dateAdded: number;
};

export type PlagiarismCheckProgress = {
  totalSources: number;
  checkedSources: number;
  currentSource?: string;
  status: 'idle' | 'checking' | 'complete' | 'error';
};