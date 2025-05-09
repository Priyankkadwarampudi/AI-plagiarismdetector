import React, { createContext, useContext, useState, ReactNode } from 'react';
import { analyzeTextSimilarity } from '../utils/semanticAnalysis';
import { PlagiarismResult, TextMatch, SourceDocument, PlagiarismCheckProgress } from '../types';

// Simulated database of sources (in a real app, this would come from a backend)
const sampleSources: SourceDocument[] = [
  {
    id: '1',
    title: 'Wikipedia - Artificial Intelligence',
    content: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals and humans.',
    type: 'web',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    dateAdded: Date.now()
  },
  {
    id: '2',
    title: 'Introduction to Machine Learning',
    content: 'Machine learning is a subset of artificial intelligence that focuses on the development of computer programs that can access data and use it to learn for themselves.',
    type: 'academic',
    author: 'Dr. Smith',
    dateAdded: Date.now()
  }
];

type PlagiarismContextType = {
  originalText: string;
  results: PlagiarismResult | null;
  isAnalyzing: boolean;
  progress: PlagiarismCheckProgress;
  history: PlagiarismResult[];
  setOriginalText: (text: string) => void;
  analyzePlagiarism: () => void;
  clearResults: () => void;
  clearHistory: () => void;
};

const PlagiarismContext = createContext<PlagiarismContextType | undefined>(undefined);

export const usePlagiarism = (): PlagiarismContextType => {
  const context = useContext(PlagiarismContext);
  if (!context) {
    throw new Error('usePlagiarism must be used within a PlagiarismProvider');
  }
  return context;
};

type PlagiarismProviderProps = {
  children: ReactNode;
};

export const PlagiarismProvider: React.FC<PlagiarismProviderProps> = ({ children }) => {
  const [originalText, setOriginalText] = useState('');
  const [results, setResults] = useState<PlagiarismResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<PlagiarismResult[]>([]);
  const [progress, setProgress] = useState<PlagiarismCheckProgress>({
    totalSources: 0,
    checkedSources: 0,
    status: 'idle'
  });

  const analyzePlagiarism = async () => {
    if (!originalText.trim()) return;

    setIsAnalyzing(true);
    setProgress({
      totalSources: sampleSources.length,
      checkedSources: 0,
      status: 'checking'
    });
    
    try {
      let highestSimilarity: PlagiarismResult | null = null;
      
      // Check against each source in the database
      for (let i = 0; i < sampleSources.length; i++) {
        const source = sampleSources[i];
        setProgress(prev => ({
          ...prev,
          checkedSources: i + 1,
          currentSource: source.title
        }));

        const result = analyzeTextSimilarity(originalText, source.content);
        
        // Add source information to matches
        result.matches = result.matches.map(match => ({
          ...match,
          source: source.title
        }));
        
        // Keep track of the highest similarity match
        if (!highestSimilarity || result.similarityScore > highestSimilarity.similarityScore) {
          highestSimilarity = {
            ...result,
            source: source.title
          };
        }
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (highestSimilarity) {
        setResults(highestSimilarity);
        setHistory(prev => [highestSimilarity, ...prev].slice(0, 10));
      }
      
      setProgress(prev => ({
        ...prev,
        status: 'complete'
      }));
    } catch (error) {
      console.error('Error analyzing plagiarism:', error);
      setProgress(prev => ({
        ...prev,
        status: 'error'
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setProgress({
      totalSources: 0,
      checkedSources: 0,
      status: 'idle'
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <PlagiarismContext.Provider
      value={{
        originalText,
        results,
        isAnalyzing,
        progress,
        history,
        setOriginalText,
        analyzePlagiarism,
        clearResults,
        clearHistory
      }}
    >
      {children}
    </PlagiarismContext.Provider>
  );
};