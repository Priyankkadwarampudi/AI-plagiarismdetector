// Text preprocessing utilities for plagiarism detection

/**
 * Cleans and normalizes text for analysis
 */
export function preprocessText(text: string): string {
  return text
    .replace(/\s+/g, ' ')       // Normalize whitespace
    .replace(/[^\w\s.,?!]/g, '') // Remove special characters except basic punctuation
    .trim();
}

/**
 * Splits text into sentences
 */
export function splitIntoSentences(text: string): string[] {
  return text
    .replace(/([.?!])\s+/g, "$1|")
    .split("|")
    .filter(sentence => sentence.trim().length > 0);
}

/**
 * Splits text into paragraphs
 */
export function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .filter(paragraph => paragraph.trim().length > 0);
}

/**
 * Tokenizes text into words
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 0);
}

/**
 * Removes common stop words from text
 */
export function removeStopWords(words: string[]): string[] {
  const stopWords = [
    'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 
    'from', 'in', 'of', 'is', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 
    'must', 'can', 'could', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 
    'she', 'it', 'we', 'they', 'their', 'his', 'her', 'its', 'our', 'your', 'my'
  ];
  
  return words.filter(word => !stopWords.includes(word));
}

/**
 * Creates n-grams from text for comparison
 * N-grams are sequences of N adjacent words, useful for plagiarism detection
 */
export function createNGrams(text: string, n: number = 3): string[] {
  const words = tokenize(text);
  const ngrams: string[] = [];
  
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(' '));
  }
  
  return ngrams;
}

/**
 * Creates a fingerprint of text for faster comparison
 * Useful for initial screening before detailed analysis
 */
export function createTextFingerprint(text: string): number[] {
  const words = tokenize(removeStopWords(tokenize(text)));
  const fingerprint: number[] = [];
  
  // Simple hashing function
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    fingerprint.push(hash);
  }
  
  return fingerprint;
}