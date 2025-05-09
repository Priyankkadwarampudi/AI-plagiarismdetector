import React from 'react';
import { usePlagiarism } from '../context/PlagiarismContext';
import { Clock, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const HistorySection: React.FC = () => {
  const { history, clearHistory } = usePlagiarism();
  const { isDarkMode } = useTheme();
  
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-medium mb-2">No history yet</h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Your plagiarism check history will appear here
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Recent Checks</h2>
        <button
          onClick={clearHistory}
          className={`flex items-center px-3 py-2 rounded ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          } transition-colors`}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear History
        </button>
      </div>
      
      <div className="space-y-4">
        {history.map((result, index) => {
          // Extract first 50 chars from texts for preview
          const originalPreview = result.originalText.substring(0, 50) + (result.originalText.length > 50 ? '...' : '');
          const comparisonPreview = result.comparisonText.substring(0, 50) + (result.comparisonText.length > 50 ? '...' : '');
          
          // Format date
          const date = new Date(result.timestamp).toLocaleString();
          
          // Determine severity class
          const getSeverityClass = (score: number) => {
            if (score < 15) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            if (score < 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
          };
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-300`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h3 className="font-medium">{date}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityClass(result.similarityScore)} mt-2 sm:mt-0`}>
                  {result.similarityScore.toFixed(2)}% similarity
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Original Text
                  </h4>
                  <p className="text-sm">{originalPreview}</p>
                </div>
                
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Comparison Text
                  </h4>
                  <p className="text-sm">{comparisonPreview}</p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {result.matches.length} matches
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>
                  Semantic: {result.semanticSimilarity.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistorySection;