import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const RncArticles = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('rnc_articles')
          .select('*');

        if (error) {
          throw error;
        }
        setArticles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article => {
    const term = searchTerm.toLowerCase();
    return (
      (article.title && article.title.toLowerCase().includes(term)) ||
      (article.article_number && article.article_number.toString().includes(term)) ||
      (article.content && article.content.toLowerCase().includes(term)) ||
      (article.keywords && article.keywords.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {loading && <p>Chargement des articles...</p>}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
      
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Rechercher un article par mot-clé, titre ou numéro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            padding: '8px 12px', 
            width: '100%', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div>
        {!loading && (
          <>
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#fff',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <h4 style={{ margin: '0', fontSize: '16px', color: '#2c3e50' }}>
                  Article {article.article_number || index + 1} - {article.title || 'Sans titre'}
                </h4>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RncArticles;

