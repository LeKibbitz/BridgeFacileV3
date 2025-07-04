import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BiddingCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('bidding_categories')
          .select('*');

        if (error) {
          throw error;
        }
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(category => {
    const term = searchTerm.toLowerCase();
    return (
      (category.category_name && category.category_name.toLowerCase().includes(term)) ||
      (category.description && category.description.toLowerCase().includes(term)) ||
      (category.allowed_competitions && category.allowed_competitions.toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {loading && <p>Chargement des catégories...</p>}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
      
      {/* Espacement identique au RNC entre la ligne de séparation et la barre de recherche */}
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="Rechercher une catégorie..."
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
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                style={{
                  marginBottom: '10px',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <h4 style={{ margin: '0', fontSize: '16px', color: '#2c3e50' }}>
                    {category.category_name || `Catégorie ${index + 1}`}
                  </h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Icône loupe pour voir les détails */}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#6c757d',
                        padding: '4px'
                      }}
                      title="Voir les détails"
                    >
                      🔍
                    </button>
                    {/* Icône disquette pour téléchargement */}
                    <button
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: '#6c757d',
                        padding: '4px'
                      }}
                      title="Télécharger"
                    >
                      💾
                    </button>
                  </div>
                </div>
                <p style={{ 
                  margin: '0', 
                  fontSize: '14px', 
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  {category.description || 'Aucune description disponible'}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default BiddingCategories;

