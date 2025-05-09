import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { PlagiarismProvider } from './context/PlagiarismContext';
import Layout from './components/Layout';
import PlagiarismChecker from './components/PlagiarismChecker';

function App() {
  return (
    <ThemeProvider>
      <PlagiarismProvider>
        <Layout>
          <PlagiarismChecker />
        </Layout>
      </PlagiarismProvider>
    </ThemeProvider>
  );
}

export default App;