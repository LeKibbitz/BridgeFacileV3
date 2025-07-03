import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function BiddingCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Charger les catégories depuis Supabase
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Chargement des catégories d\'enchères depuis Supabase...');
        
        const { data, error } = await supabase
          .from('bidding_categories')
          .select('*')
          .order('category_number', { ascending: true });
        
        if (error) throw error;
        
        console.log(`✅ ${data?.length || 0} catégories d'enchères chargées avec succès !`);
        setCategories(data || []);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        setError('Impossible de charger les catégories d\'enchères. Vérifiez votre connexion Supabase.');
        
        // Données de fallback en cas d'erreur
        setCategories([
          {
            id: 'fallback-1',
            category_number: 1,
            category_name: 'Catégorie 1 (Mode hors ligne)',
            description: 'Systèmes très artificiels avec ouvertures et développements hautement conventionnels',
            allowed_competitions: 'Championnats de France Division Nationale uniquement',
            restrictions: 'Réservé aux joueurs de très haut niveau. Fiche de système obligatoire détaillée.',
            examples: 'Systèmes à base d\'ouvertures forcing, multi-couleurs complexes'
          },
          {
            id: 'fallback-2',
            category_number: 2,
            category_name: 'Catégorie 2 (Mode hors ligne)',
            description: 'Systèmes à base d\'ouvertures artificielles avec développements conventionnels',
            allowed_competitions: 'Championnats de France Excellence et Honneur, compétitions nationales',
            restrictions: 'Fiche de système obligatoire. Explications détaillées requises.',
            examples: 'Trèfle fort, systèmes polonais, ouvertures multi'
          },
          {
            id: 'fallback-3',
            category_number: 3,
            category_name: 'Catégorie 3 (Mode hors ligne)',
            description: 'Systèmes à base d\'ouvertures naturelles avec conventions élaborées',
            allowed_competitions: 'Toutes compétitions sauf débutants et promotion',
            restrictions: 'Fiche de système recommandée. Conventions courantes autorisées.',
            examples: 'SEF avec conventions, systèmes américains standard'
          },
          {
            id: 'fallback-4',
            category_number: 4,
            category_name: 'Catégorie 4 (Mode hors ligne)',
            description: 'Systèmes naturels simples avec conventions de base',
            allowed_competitions: 'Toutes compétitions y compris débutants',
            restrictions: 'Aucune restriction particulière. Système accessible à tous.',
            examples: 'SEF de base, systèmes d\'enseignement standard'
          },
          {
            id: 'fallback-5',
            category_number: 5,
            category_name: 'Catégorie 5 (Mode hors ligne)',
            description: 'Systèmes d\'initiation et d\'enseignement',
            allowed_competitions: 'Compétitions débutants et scolaires uniquement',
            restrictions: 'Systèmes simplifiés pour l\'apprentissage.',
            examples: 'Majeure cinquième simple, enchères naturelles uniquement'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  const getCategoryColor = (categoryNumber) => {
    const colors = {
      1: { bg: '#ffebee', border: '#f44336', text: '#c62828' },
      2: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
      3: { bg: '#fff8e1', border: '#ffc107', text: '#f57f17' },
      4: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
      5: { bg: '#e3f2fd', border: '#2196f3', text: '#1565c0' }
    };
    return colors[categoryNumber] || { bg: '#f5f5f5', border: '#999', text: '#333' };
  };

  const handleDownload = (category) => {
    if (category.document_url) {
      window.open(category.document_url, '_blank');
    } else {
      alert(`Téléchargement du document pour ${category.category_name}\n\nCette fonctionnalité sera bientôt disponible.`);
    }
  };

  return (
    <div>
      <h2 className="section-title">Catégories d'Enchères Autorisées</h2>
      <p className="section-description">
        Les systèmes d'enchères sont classés en catégories selon leur degré d'artificialité et leur complexité.
      </p>

      {/* Indicateur de statut */}
      <div style={{ 
        padding: '12px 16px', 
        marginBottom: '25px', 
        borderRadius: '8px',
        backgroundColor: error ? '#fee' : loading ? '#fff3cd' : '#e8f5e8',
        border: `1px solid ${error ? '#fcc' : loading ? '#ffeaa7' : '#c8e6c9'}`,
        color: error ? '#721c24' : loading ? '#856404' : '#2e7d32',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {loading && '🔄 Chargement des catégories d\'enchères depuis Supabase...'}
        {error && `❌ ${error}`}
        {!loading && !error && `✅ ${categories.length} catégories d'enchères chargées depuis la base de données`}
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="loading-spinner">
          <p>Chargement des catégories d'enchères...</p>
        </div>
      )}

      {/* Liste des catégories */}
      {!loading && (
        <div>
          {categories.map((category) => {
            const colors = getCategoryColor(category.category_number);
            return (
              <div 
                key={category.id}
                className={`category-card category-${category.category_number}`}
                style={{ 
                  marginBottom: '25px', 
                  padding: '25px', 
                  border: `2px solid ${colors.border}`, 
                  borderRadius: '12px',
                  backgroundColor: colors.bg,
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="category-header">
                  <h3 className="category-title" style={{ color: colors.text }}>
                    {category.category_name}
                  </h3>
                  <span className="category-badge" style={{ backgroundColor: colors.border }}>
                    Catégorie {category.category_number}
                  </span>
                </div>
                
                <p className="category-description" style={{ color: colors.text }}>
                  <strong>Description :</strong> {category.description}
                </p>
                
                <p className="category-details" style={{ color: colors.text }}>
                  <strong>Compétitions autorisées :</strong> {category.allowed_competitions}
                </p>
                
                {category.restrictions && (
                  <p className="category-details" style={{ color: colors.text }}>
                    <strong>Restrictions :</strong> {category.restrictions}
                  </p>
                )}
                
                {category.examples && (
                  <p className="category-details" style={{ color: colors.text }}>
                    <strong>Exemples :</strong> {category.examples}
                  </p>
                )}
                
                <div className="category-buttons">
                  <button
                    onClick={() => handleDownload(category)}
                    className="category-button"
                    style={{
                      backgroundColor: colors.border,
                      color: 'white'
                    }}
                  >
                    📄 Télécharger le document
                  </button>
                  
                  <button
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className="category-button category-button-outline"
                    style={{
                      color: colors.border,
                      borderColor: colors.border
                    }}
                  >
                    {selectedCategory === category.id ? '▲ Masquer les détails' : '▼ Voir les détails'}
                  </button>
                </div>
                
                {selectedCategory === category.id && (
                  <div style={{
                    marginTop: '25px',
                    padding: '20px',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '8px',
                    border: `1px solid ${colors.border}`
                  }}>
                    <h4 style={{ color: colors.text, marginBottom: '15px' }}>Informations détaillées</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      <p style={{ margin: 0, color: colors.text }}>
                        <strong>Niveau de complexité :</strong> {
                          category.category_number === 1 ? 'Très élevé - Experts uniquement' :
                          category.category_number === 2 ? 'Élevé - Joueurs expérimentés' :
                          category.category_number === 3 ? 'Moyen - Joueurs confirmés' :
                          category.category_number === 4 ? 'Faible - Tous niveaux' :
                          'Très faible - Débutants'
                        }
                      </p>
                      <p style={{ margin: 0, color: colors.text }}>
                        <strong>Fiche de système :</strong> {
                          category.category_number <= 2 ? 'Obligatoire et détaillée' :
                          category.category_number === 3 ? 'Recommandée' : 'Optionnelle'
                        }
                      </p>
                      <p style={{ margin: 0, color: colors.text }}>
                        <strong>Public cible :</strong> {
                          category.category_number === 1 ? 'Joueurs internationaux et experts' :
                          category.category_number === 2 ? 'Joueurs de compétition expérimentés' :
                          category.category_number === 3 ? 'Joueurs de club confirmés' :
                          category.category_number === 4 ? 'Tous les joueurs' :
                          'Débutants et joueurs en apprentissage'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Statistiques */}
      {!loading && categories.length > 0 && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>Statistiques :</strong> {categories.length} catégories d'enchères définies par la FFB
        </div>
      )}
    </div>
  );
}

export default BiddingCategories;
