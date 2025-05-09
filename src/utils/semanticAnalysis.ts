import { PlagiarismResult, TextMatch } from '../types';

// Function to analyze text similarity
export function analyzeTextSimilarity(originalText: string, comparisonText: string): PlagiarismResult {
  // Process the texts
  const originalSentences = splitIntoSentences(originalText);
  const comparisonSentences = splitIntoSentences(comparisonText);
  
  // Find matches between sentences
  const matches: TextMatch[] = findMatches(originalText, comparisonText, originalSentences, comparisonSentences);
  
  // Calculate overall similarity score
  const directMatchSimilarity = calculateDirectSimilarityScore(matches, originalText, comparisonText);
  
  // Calculate semantic similarity
  const semanticSimilarity = calculateSemanticSimilarity(originalText, comparisonText);
  
  // Improved combined score calculation
  let combinedScore = 0;
  
  // Check for identical texts first
  if (originalText.trim() === comparisonText.trim()) {
    combinedScore = 100;
  } else {
    // Calculate weighted score based on both direct matches and semantic similarity
    const directWeight = 0.7;
    const semanticWeight = 0.3;
    combinedScore = (directMatchSimilarity * directWeight) + (semanticSimilarity * semanticWeight);
    
    // Adjust score based on text length ratio
    const lengthRatio = Math.min(originalText.length, comparisonText.length) / 
                       Math.max(originalText.length, comparisonText.length);
    combinedScore *= lengthRatio;
  }
  
  return {
    originalText,
    comparisonText,
    similarityScore: Math.min(100, combinedScore), // Ensure score doesn't exceed 100
    semanticSimilarity,
    matches,
    timestamp: Date.now()
  };
}

// Split text into sentences
function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s+/g, "$1|")
    .split("|")
    .filter(sentence => sentence.trim().length > 0);
}

// Find matching sentences or phrases
function findMatches(
  originalText: string, 
  comparisonText: string,
  originalSentences: string[], 
  comparisonSentences: string[]
): TextMatch[] {
  const matches: TextMatch[] = [];
  
  // Check each original sentence against each comparison sentence
  for (const originalSentence of originalSentences) {
    for (const comparisonSentence of comparisonSentences) {
      const similarity = calculateSentenceSimilarity(originalSentence, comparisonSentence);
      
      // Lower threshold for better sensitivity
      if (similarity > 30) {
        matches.push({
          originalText: originalSentence,
          comparisonText: comparisonSentence,
          originalStartIndex: originalText.indexOf(originalSentence),
          comparisonStartIndex: comparisonText.indexOf(comparisonSentence),
          similarity
        });
      }
    }
  }
  
  // Check for verbatim phrase matches
  const phraseMatches = findPhraseMatches(originalText, comparisonText);
  matches.push(...phraseMatches);
  
  // Remove overlapping matches
  return filterOverlappingMatches(matches);
}

// Find exact phrase matches
function findPhraseMatches(originalText: string, comparisonText: string): TextMatch[] {
  const matches: TextMatch[] = [];
  const MIN_PHRASE_LENGTH = 3;
  
  // Normalize texts for comparison
  const normalizedOriginal = originalText.toLowerCase();
  const normalizedComparison = comparisonText.toLowerCase();
  
  // Get words
  const originalWords = normalizedOriginal.split(/\s+/);
  const comparisonWords = normalizedComparison.split(/\s+/);
  
  for (let i = 0; i <= originalWords.length - MIN_PHRASE_LENGTH; i++) {
    for (let length = MIN_PHRASE_LENGTH; length <= Math.min(8, originalWords.length - i); length++) {
      const phrase = originalWords.slice(i, i + length).join(' ');
      
      let startIndex = 0;
      while (true) {
        const foundIndex = normalizedComparison.indexOf(phrase, startIndex);
        if (foundIndex === -1) break;
        
        // Get the actual (non-normalized) phrases from the original texts
        const originalPhrase = originalText.slice(
          originalText.toLowerCase().indexOf(phrase),
          originalText.toLowerCase().indexOf(phrase) + phrase.length
        );
        const comparisonPhrase = comparisonText.slice(foundIndex, foundIndex + phrase.length);
        
        matches.push({
          originalText: originalPhrase,
          comparisonText: comparisonPhrase,
          originalStartIndex: originalText.toLowerCase().indexOf(phrase),
          comparisonStartIndex: foundIndex,
          similarity: 90 + Math.min(10, length)
        });
        
        startIndex = foundIndex + 1;
      }
    }
  }
  
  return matches;
}

// Calculate similarity between two sentences
function calculateSentenceSimilarity(sentence1: string, sentence2: string): number {
  // Normalize and tokenize
  const words1 = sentence1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const words2 = sentence2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  // If either sentence is empty after processing, return 0
  if (words1.length === 0 || words2.length === 0) return 0;
  
  // Create word sets
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  // Calculate Jaccard similarity
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = intersection.size / union.size;
  
  // Calculate word order similarity
  const orderSimilarity = calculateWordOrderSimilarity(words1, words2);
  
  // Combine similarities with weights
  return (jaccardSimilarity * 0.6 + orderSimilarity * 0.4) * 100;
}

// Calculate similarity based on word order
function calculateWordOrderSimilarity(words1: string[], words2: string[]): number {
  const maxLength = Math.max(words1.length, words2.length);
  if (maxLength === 0) return 0;
  
  let commonWords = 0;
  let orderDifference = 0;
  
  // Create position maps
  const pos1: Record<string, number> = {};
  const pos2: Record<string, number> = {};
  
  words1.forEach((word, i) => pos1[word] = i);
  words2.forEach((word, i) => pos2[word] = i);
  
  // Calculate position differences for common words
  for (const word of new Set([...words1, ...words2])) {
    if (pos1[word] !== undefined && pos2[word] !== undefined) {
      commonWords++;
      const posDiff = Math.abs(pos1[word] - pos2[word]);
      orderDifference += posDiff / maxLength;
    }
  }
  
  if (commonWords === 0) return 0;
  
  // Calculate normalized similarity
  return 1 - (orderDifference / commonWords);
}

// Calculate overall similarity score
function calculateDirectSimilarityScore(
  matches: TextMatch[], 
  originalText: string, 
  comparisonText: string
): number {
  if (matches.length === 0) return 0;
  if (originalText.trim() === comparisonText.trim()) return 100;
  
  // Calculate coverage
  let originalCoveredChars = 0;
  let comparisonCoveredChars = 0;
  
  matches.forEach(match => {
    originalCoveredChars += match.originalText.length;
    comparisonCoveredChars += match.comparisonText.length;
  });
  
  // Calculate coverage percentages
  const originalCoveragePercent = (originalCoveredChars / originalText.length) * 100;
  const comparisonCoveragePercent = (comparisonCoveredChars / comparisonText.length) * 100;
  
  // Calculate average match similarity
  const avgMatchSimilarity = matches.reduce((sum, match) => sum + match.similarity, 0) / matches.length;
  
  // Combined weighted score
  return (
    (originalCoveragePercent * 0.4) + 
    (comparisonCoveragePercent * 0.4) + 
    (avgMatchSimilarity * 0.2)
  );
}

// Calculate semantic similarity between texts
function calculateSemanticSimilarity(text1: string, text2: string): number {
  if (text1.trim() === text2.trim()) return 100;
  
  // Tokenize and normalize
  const words1 = text1.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  // Calculate TF-IDF vectors
  const allWords = Array.from(new Set([...words1, ...words2]));
  const tfidf1 = calculateTfIdf(words1, [words1, words2]);
  const tfidf2 = calculateTfIdf(words2, [words1, words2]);
  
  // Calculate cosine similarity
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allWords.forEach(word => {
    const val1 = tfidf1[word] || 0;
    const val2 = tfidf2[word] || 0;
    
    dotProduct += val1 * val2;
    magnitude1 += val1 * val1;
    magnitude2 += val2 * val2;
  });
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  const similarity = (dotProduct / (magnitude1 * magnitude2)) * 100;
  
  // Adjust similarity based on length ratio
  const lengthRatio = Math.min(words1.length, words2.length) / Math.max(words1.length, words2.length);
  return similarity * lengthRatio;
}

// Calculate TF-IDF for a document
function calculateTfIdf(
  document: string[], 
  allDocuments: string[][]
): Record<string, number> {
  const result: Record<string, number> = {};
  const termFreq = createFrequencyMap(document);
  
  Object.entries(termFreq).forEach(([word, freq]) => {
    const tf = freq / document.length;
    const documentFrequency = allDocuments.filter(doc => 
      doc.includes(word)
    ).length;
    const idf = Math.log((allDocuments.length + 1) / (documentFrequency + 1)) + 1;
    result[word] = tf * idf;
  });
  
  return result;
}

// Create word frequency map
function createFrequencyMap(words: string[]): Record<string, number> {
  return words.reduce((map: Record<string, number>, word) => {
    map[word] = (map[word] || 0) + 1;
    return map;
  }, {});
}

// Filter overlapping matches
function filterOverlappingMatches(matches: TextMatch[]): TextMatch[] {
  if (matches.length <= 1) return matches;
  
  const sortedMatches = [...matches].sort((a, b) => {
    // Sort by similarity score first
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    // Then by length of match
    return b.originalText.length - a.originalText.length;
  });
  
  return sortedMatches.filter((match, index) => {
    // Check if this match overlaps with any higher-scoring match
    return !sortedMatches.slice(0, index).some(betterMatch => {
      const originalOverlap = (
        match.originalStartIndex < betterMatch.originalStartIndex + betterMatch.originalText.length &&
        match.originalStartIndex + match.originalText.length > betterMatch.originalStartIndex
      );
      
      const comparisonOverlap = (
        match.comparisonStartIndex < betterMatch.comparisonStartIndex + betterMatch.comparisonText.length &&
        match.comparisonStartIndex + match.comparisonText.length > betterMatch.comparisonStartIndex
      );
      
      return originalOverlap && comparisonOverlap;
    });
  });
}