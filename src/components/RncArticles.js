import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function RncArticles() {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les articles depuis Supabase
  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Chargement des articles RNC depuis Supabase...');
        
        const { data, error } = await supabase
          .from('rnc_articles')
          .select('*')
          .order('article_number', { ascending: true });
        
        if (error) throw error;
        
        console.log(`✅ ${data?.length || 0} articles RNC chargés avec succès !`);
        setArticles(data || []);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des articles RNC:', error);
        setError('Impossible de charger les articles du RNC. Vérifiez votre connexion Supabase.');
        
        // Données de fallback en cas d'erreur
        setArticles([
          {
            id: 'fallback-1',
            article_number: '1',
            title: 'Domaine d\'application (Mode hors ligne)',
            page: 9,
            chapter: 'Dispositions générales',
            section: 'Application',
            content: 'Le présent règlement s\'applique à toutes les compétitions officielles organisées sous l\'égide de la Fédération Française de Bridge (FFB). La FFB est l\'organisme responsable de l\'organisation et du contrôle de ces compétitions.',
            keywords: 'FFB,compétitions,officielles,règlement'
          },
          {
            id: 'fallback-2',
            article_number: '2',
            title: 'Application et respect du règlement (Mode hors ligne)',
            page: 9,
            chapter: 'Dispositions générales',
            section: 'Application',
            content: 'Toutes les compétitions officielles doivent respecter les dispositions du présent règlement. Toute dérogation doit faire l\'objet d\'une demande préalable auprès de la FFB et être expressément autorisée.',
            keywords: 'respect,dérogations,autorisation'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticles();
  }, []);

  // Obtenir la liste des chapitres uniques
  const chapters = [...new Set(articles.map(article => article.chapter))].filter(Boolean);

  // Filtrer les articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.article_number.includes(searchTerm) ||
                         (article.content && article.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesChapter = !selectedChapter || article.chapter === selectedChapter;
    
    return matchesSearch && matchesChapter;
  });

  if (selectedArticle) {
    return (
      <div>
        <button 
          onClick={() => setSelectedArticle(null)}
          className="back-button"
        >
          ← Retour à la liste
        </button>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e1e8ed'
        }}>
          <h1 style={{ 
            color: '#856404', 
            marginBottom: '20px',
            fontSize: '2rem',
            fontWeight: '300',
            lineHeight: '1.3'
          }}>
            Article {selectedArticle.article_number} - {selectedArticle.title}
          </h1>
          
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginBottom: '25px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            flexWrap: 'wrap'
          }}>
            <p style={{ margin: 0, color: '#856404' }}>
              <strong>Page:</strong> {selectedArticle.page}
            </p>
            {selectedArticle.chapter && (
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>Chapitre:</strong> {selectedArticle.chapter}
              </p>
            )}
            {selectedArticle.section && (
              <p style={{ margin: 0, color: '#856404' }}>
                <strong>Section:</strong> {selectedArticle.section}
              </p>
            )}
          </div>
          
          <div style={{ 
            marginBottom: '30px', 
            whiteSpace: 'pre-wrap', 
            lineHeight: '1.8',
            fontSize: '16px',
            color: '#333'
          }}>
            {selectedArticle.content}
          </div>
          
          {selectedArticle.keywords && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              backgroundColor: '#fff3cd', 
              borderRadius: '8px',
              border: '1px solid #ffeaa7'
            }}>
              <h4 style={{ marginBottom: '15px', color: '#856404' }}>Mots-clés:</h4>
              <div>
                {selectedArticle.keywords.split(',').map((keyword, index) => (
                  <span key={index} className="rnc-keyword-tag" style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
                    color: '#856404',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-title">Règlement National des Compétitions 2024</h2>
      <p className="section-description">
        Les règles spécifiques aux compétitions françaises établies par la FFB.
      </p>
      
      {/* Indicateur de statut */}
      <div style={{ 
        padding: '12px 16px', 
        marginBottom: '25px', 
        borderRadius: '8px',
        backgroundColor: error ? '#fee' : loading ? '#fff3cd' : '#fff3cd',
        border: `1px solid ${error ? '#fcc' : loading ? '#ffeaa7' : '#ffeaa7'}`,
        color: error ? '#721c24' : '#856404',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {loading && '🔄 Chargement des articles RNC depuis Supabase...'}
        {error && `❌ ${error}`}
        {!loading && !error && `✅ ${articles.length} articles RNC chargés depuis la base de données`}
      </div>
      
      {/* Filtres */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          style={{ flex: '1', minWidth: '300px' }}
        />
        
        {chapters.length > 0 && (
          <select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e1e8ed',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              minWidth: '200px'
            }}
          >
            <option value="">Tous les chapitres</option>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>{chapter}</option>
            ))}
          </select>
        )}
      </div>

      {/* Résultats de recherche */}
      {(searchTerm || selectedChapter) && (
        <p style={{ marginBottom: '20px', color: '#856404', fontSize: '14px' }}>
          {filteredArticles.length} article(s) trouvé(s)
          {searchTerm && ` pour "${searchTerm}"`}
          {selectedChapter && ` dans "${selectedChapter}"`}
        </p>
      )}

      {/* État de chargement */}
      {loading && (
        <div className="loading-spinner">
          <p>Chargement des articles du RNC...</p>
        </div>
      )}

      {/* Liste des articles */}
      {!loading && (
        <div>
          {filteredArticles.map((article) => (
            <div 
              key={article.id}
              className="law-item rnc-article"
              onClick={() => setSelectedArticle(article)}
            >
              <h3 className="law-title">
                Article {article.article_number} - {article.title}
              </h3>
              <p className="law-meta">
                Page: {article.page} 
                {article.chapter && ` • Chapitre: ${article.chapter}`}
                {article.section && ` • Section: ${article.section}`}
              </p>
              {article.content && (
                <p className="law-content">
                  {article.content.substring(0, 200)}
                  {article.content.length > 200 ? '...' : ''}
                </p>
              )}
              {article.keywords && (
                <div style={{ marginTop: '12px' }}>
                  {article.keywords.split(',').slice(0, 4).map((keyword, index) => (
                    <span key={index} className="rnc-keyword-tag" style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
                      color: '#856404',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      marginRight: '6px',
                      marginTop: '4px',
                      fontWeight: '500'
                    }}>
                      {keyword.trim()}
                    </span>
                  ))}
                  {article.keywords.split(',').length > 4 && (
                    <span style={{ fontSize: '12px', color: '#856404' }}>
                      +{article.keywords.split(',').length - 4} autres
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {!loading && filteredArticles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Aucun article ne correspond à vos critères.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedChapter('');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#856404',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Statistiques */}
      {!loading && articles.length > 0 && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#856404',
          textAlign: 'center'
        }}>
          <strong>Statistiques :</strong> {articles.length} articles disponibles dans le RNC 2024
        </div>
      )}
    </div>
  );
}

export default RncArticles;
