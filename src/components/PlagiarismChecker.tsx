import React, { useState } from 'react';
import { usePlagiarism } from '../context/PlagiarismContext';
import TextInputSection from './TextInputSection';
import ResultsVisualization from './ResultsVisualization';
import HistorySection from './HistorySection';
import { Table as Tab, FileUp, RotateCcw, Search, Database } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const PlagiarismChecker: React.FC = () => {
  const { 
    originalText, 
    results,
    isAnalyzing,
    progress,
    setOriginalText, 
    analyzePlagiarism,
    clearResults
  } = usePlagiarism();
  
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'checker' | 'history'>('checker');

  const handleAnalyze = () => {
    clearResults();
    analyzePlagiarism();
  };

  const handleClear = () => {
    setOriginalText('');
    clearResults();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setOriginalText(text);
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Plagiarism Detector</h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Advanced semantic analysis to detect content similarity across multiple sources
        </p>
      </div>

      <div className="flex border-b mb-6">
        <button
          className={`py-3 px-5 font-medium flex items-center transition-colors ${
            activeTab === 'checker'
              ? `border-b-2 border-blue-500 text-blue-600 ${isDarkMode ? 'dark:text-blue-400' : ''}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => setActiveTab('checker')}
        >
          <Search className="h-4 w-4 mr-2" />
          Plagiarism Checker
        </button>
        <button
          className={`py-3 px-5 font-medium flex items-center transition-colors ${
            activeTab === 'history'
              ? `border-b-2 border-blue-500 text-blue-600 ${isDarkMode ? 'dark:text-blue-400' : ''}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
          }`}
          onClick={() => setActiveTab('history')}
        >
          <Tab className="h-4 w-4 mr-2" />
          History
        </button>
      </div>

      {activeTab === 'checker' ? (
        <>
          <div className="grid grid-cols-1 gap-6">
            <TextInputSection
              title="Check Document"
              text={originalText}
              setText={setOriginalText}
              onFileUpload={handleFileUpload}
              placeholder="Paste or type the text to check for plagiarism..."
            />
            
            {progress.status === 'checking' && (
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="font-medium">Checking against sources...</h3>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.checkedSources / progress.totalSources) * 100}%` }}
                  ></div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Checked {progress.checkedSources} of {progress.totalSources} sources
                  {progress.currentSource && ` - Currently analyzing: ${progress.currentSource}`}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 my-6">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !originalText.trim()}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isAnalyzing || !originalText.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Check for Plagiarism
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              className={`flex items-center px-6 py-3 rounded-lg font-medium ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Clear
            </button>

            <label 
              className={`flex items-center px-6 py-3 rounded-lg font-medium cursor-pointer ${
                isDarkMode
                  ? 'bg-purple-700 text-white hover:bg-purple-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } transition-colors`}
            >
              <FileUp className="h-5 w-5 mr-2" />
              Upload Document
              <input 
                type="file" 
                accept=".txt,.doc,.docx,.pdf,.rtf" 
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {results && <ResultsVisualization />}
        </>
      ) : (
        <HistorySection />
      )}
    </div>
  );
};

export default PlagiarismChecker;