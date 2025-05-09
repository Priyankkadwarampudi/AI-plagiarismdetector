import React, { useEffect, useState } from 'react';
import { usePlagiarism } from '../context/PlagiarismContext';
import { AlertTriangle, Download, FileText, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ResultsVisualization: React.FC = () => {
  const { results, originalText, comparisonText } = usePlagiarism();
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Add animation effect
    setIsVisible(true);
  }, []);

  if (!results) return null;

  const { similarityScore, matches } = results;
  
  // Determine color based on similarity score
  const getSeverityColor = (score: number) => {
    if (score < 15) return 'text-green-500';
    if (score < 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Determine background color based on similarity score
  const getSeverityBgColor = (score: number) => {
    if (score < 15) return isDarkMode ? 'bg-green-900/20' : 'bg-green-100';
    if (score < 40) return isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-100';
    return isDarkMode ? 'bg-red-900/20' : 'bg-red-100';
  };

  // Generate a report as text
  const generateReport = () => {
    const report = `
Plagiarism Detection Report
==========================
Date: ${new Date().toLocaleString()}

Summary:
- Overall Similarity: ${similarityScore.toFixed(2)}%
- Semantic Similarity: ${results.semanticSimilarity.toFixed(2)}%
- Direct Match Count: ${matches.length}

Original Text Length: ${originalText.length} characters
Comparison Text Length: ${comparisonText.length} characters

Detected Matches:
${matches.map((match, i) => 
  `Match ${i+1}:
  Original (${match.originalStartIndex}-${match.originalStartIndex + match.originalText.length}): "${match.originalText}"
  Comparison (${match.comparisonStartIndex}-${match.comparisonStartIndex + match.comparisonText.length}): "${match.comparisonText}"
  Similarity: ${match.similarity.toFixed(2)}%
`).join('\n')}

Analysis Method: AI-powered semantic similarity detection
Tool: PlagiarismAI
`.trim();

    return report;
  };

  // Handle report download
  const handleDownloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plagiarism-report-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className={`mt-8 transition-all duration-500 ease-in-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className={`mb-6 p-6 rounded-lg ${getSeverityBgColor(similarityScore)} transition-colors duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <AlertTriangle className={`h-6 w-6 ${getSeverityColor(similarityScore)} mr-2`} />
            <h2 className="text-2xl font-bold">Similarity Score: <span className={getSeverityColor(similarityScore)}>{similarityScore.toFixed(2)}%</span></h2>
          </div>
          
          <button 
            onClick={handleDownloadReport}
            className={`flex items-center px-4 py-2 rounded-md ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-800'
            } shadow-sm transition-colors`}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Semantic Similarity</h3>
              <Info className="h-4 w-4 text-gray-400" title="Measures meaning similarity beyond exact matches" />
            </div>
            <p className="text-2xl font-bold">{results.semanticSimilarity.toFixed(2)}%</p>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Direct Matches</h3>
              <Info className="h-4 w-4 text-gray-400" title="Number of identified similar passages" />
            </div>
            <p className="text-2xl font-bold">{matches.length}</p>
          </div>
          
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Analysis Method</h3>
              <Info className="h-4 w-4 text-gray-400" title="Technology used for detection" />
            </div>
            <p className="text-lg font-medium">AI Semantic Analysis</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Original Text
          </h3>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md max-h-96 overflow-y-auto`}>
            <HighlightedText 
              text={originalText} 
              matches={matches.map(match => ({
                startIndex: match.originalStartIndex,
                endIndex: match.originalStartIndex + match.originalText.length,
                similarity: match.similarity
              }))}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Comparison Text
          </h3>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md max-h-96 overflow-y-auto`}>
            <HighlightedText 
              text={comparisonText} 
              matches={matches.map(match => ({
                startIndex: match.comparisonStartIndex,
                endIndex: match.comparisonStartIndex + match.comparisonText.length,
                similarity: match.similarity
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to highlight matched text
type HighlightedTextProps = {
  text: string;
  matches: { startIndex: number; endIndex: number; similarity: number }[];
};

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, matches }) => {
  // Return the plain text if there are no matches or if text is empty
  if (!text || !matches || matches.length === 0) {
    return <p>{text || ''}</p>;
  }
  
  // Sort matches by start index
  const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  
  const parts: JSX.Element[] = [];
  let currentIndex = 0;
  
  sortedMatches.forEach((match, i) => {
    // Add text before the match
    if (match.startIndex > currentIndex) {
      parts.push(
        <span key={`text-${i}`}>
          {text.slice(currentIndex, match.startIndex)}
        </span>
      );
    }
    
    // Add the matched text with highlighting
    const getHighlightColor = (similarity: number) => {
      if (similarity < 50) return 'bg-yellow-200 dark:bg-yellow-900/50';
      return 'bg-red-200 dark:bg-red-900/50';
    };
    
    parts.push(
      <span 
        key={`match-${i}`}
        className={`${getHighlightColor(match.similarity)} px-1 rounded`}
        title={`Similarity: ${match.similarity.toFixed(2)}%`}
      >
        {text.slice(match.startIndex, match.endIndex)}
      </span>
    );
    
    currentIndex = match.endIndex;
  });
  
  // Add any remaining text
  if (currentIndex < text.length) {
    parts.push(
      <span key="text-end">
        {text.slice(currentIndex)}
      </span>
    );
  }
  
  return <p>{parts}</p>;
};

export default ResultsVisualization;