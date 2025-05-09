import React from 'react';
import { FileUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

type TextInputSectionProps = {
  title: string;
  text: string;
  setText: (text: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
};

const TextInputSection: React.FC<TextInputSectionProps> = ({
  title,
  text,
  setText,
  onFileUpload,
  placeholder
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 transition-all duration-300`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center">
          <span className="text-sm mr-2 text-gray-500 dark:text-gray-400">
            {text.length} characters
          </span>
          <label 
            className={`p-2 rounded-md cursor-pointer ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
            title="Upload file"
          >
            <FileUp className="h-5 w-5 text-blue-500" />
            <input 
              type="file" 
              accept=".txt,.doc,.docx,.pdf,.rtf" 
              className="hidden" 
              onChange={onFileUpload} 
            />
          </label>
        </div>
      </div>
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-64 p-3 border rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        {text.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 lg:opacity-60">
            <div className="text-center px-4">
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {title === "Original Text" ? "Paste original content here" : "Paste content to compare"}
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Drag & drop files or use the upload button
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInputSection;