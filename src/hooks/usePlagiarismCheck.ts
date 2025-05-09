import { useState, useCallback } from 'react';
import { analyzeTextSimilarity } from '../utils/semanticAnalysis';
import { PlagiarismResult } from '../types';

export function usePlagiarismCheck() {
  const [originalText, setOriginalText] = useState('');
  const [comparisonText, setComparisonText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyze = useCallback(async () => {
    if (!originalText.trim() || !comparisonText.trim()) {
      setError('Please provide both original and comparison texts');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Simulate a delay to represent processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const analysisResult = analyzeTextSimilarity(originalText, comparisonText);
      setResult(analysisResult);
    } catch (err) {
      setError('An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [originalText, comparisonText]);
  
  const reset = useCallback(() => {
    setOriginalText('');
    setComparisonText('');
    setResult(null);
    setError(null);
  }, []);
  
  return {
    originalText,
    comparisonText,
    result,
    isAnalyzing,
    error,
    setOriginalText,
    setComparisonText,
    analyze,
    reset
  };
}