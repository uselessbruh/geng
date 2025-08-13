import React, { useState } from 'react';
import axios from 'axios';
import './LiteratureReview.css';

const LiteratureReview = () => {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate array of numbers from 1 to 20
  const resultOptions = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      // Replace spaces with underscores in the search query
      const formattedQuery = query.trim().replace(/\s+/g, '_');
      
      console.log('Sending request to backend with:', {
        query: formattedQuery,
        max_results: maxResults
      });
      
      const response = await axios.post('http://localhost:6002/search', {
        query: formattedQuery,
        max_results: maxResults
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Response from backend:', response.data);
      
      if (response.data.pubmed && response.data.pubmed.length > 0) {
        setResults({
          pubmed: response.data.pubmed.map(paper => ({
            source: paper.source || 'PubMed',
            title: paper.title || 'Untitled Paper',
            authors: paper.authors || [],
            publication_date: paper.publication_date || 'Unknown date',
            url: paper.url || `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`,
            full_text_snippet: paper.full_text_snippet || 'No preview available',
            summary: paper.summary || 'No summary available'
          }))
        });
      } else {
        setError('No results found. Try a different search term.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to search: ${err.message || 'Connection error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="literature-review">
      <div className="literature-header">
        <h1>Medical Literature Review</h1>
        <p>Search through PubMed's extensive database of medical research papers. Results include AI-generated summaries and full text snippets.</p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter medical research terms..."
              className="search-input"
              required
            />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            <div className="results-count">
              <label htmlFor="maxResults">Number of papers:</label>
              <select 
                id="maxResults"
                value={maxResults} 
                onChange={(e) => setMaxResults(Number(e.target.value))}
                className="results-select"
              >
                {resultOptions.map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'paper' : 'papers'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        <div className="search-tips">
          <h3>Search Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">🎯</span>
              <p>Use specific medical terms for more relevant results</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📝</span>
              <p>Include condition names, treatments, or research topics</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⭐</span>
              <p>Results are sorted by relevance to your query</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">🤖</span>
              <p>Each paper includes an AI-generated summary</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏳</span>
              <p>Search time increases with the number of requested papers</p>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📊</span>
              <p>Customize your search by selecting 1-20 papers to display</p>
            </div>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Searching medical literature...</p>
          </div>
        )}

        {results && (
          <div className="results-section">
            <div className="results-header">
              <h2>Found {results.pubmed ? results.pubmed.length : 0} Research Papers</h2>
              <p className="results-subtitle">Results from PubMed Database</p>
            </div>
            
            {results.pubmed && results.pubmed.length > 0 ? (
              <div className="papers-grid">
                {results.pubmed.map((paper, index) => (
                  <div className="paper-card" key={`pubmed-${index}`}>
                    <div className="paper-header">
                      <span className="paper-number">#{index + 1}</span>
                      <span className="paper-source">{paper.source}</span>
                      <span className="paper-date">{formatDate(paper.publication_date)}</span>
                    </div>
                    
                    <h3 className="paper-title">
                        <a href={paper.url} target="_blank" rel="noopener noreferrer">
                          {paper.title}
                        </a>
                    </h3>

                    <div className="paper-authors">
                      {paper.authors && paper.authors.length > 4 ? (
                        <>
                          {paper.authors.slice(0, 4).join(', ')}
                          <span className="more-authors"> +{paper.authors.length - 4} more</span>
                        </>
                      ) : (
                        paper.authors ? paper.authors.join(', ') : 'No authors listed'
                      )}
                    </div>

                    <div className="paper-content">
                      <div className="content-section">
                        <h4>AI Summary</h4>
                        <p>{paper.summary || 'No summary available'}</p>
                    </div>

                      <div className="content-section">
                        <h4>Full Text Preview</h4>
                        <p className="snippet">{paper.full_text_snippet || 'No preview available'}</p>
              </div>
                    </div>

                    <div className="paper-footer">
                      <a 
                        href={paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="read-more-btn"
                      >
                        Read Full Paper
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No papers found matching your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiteratureReview;