import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import LawDetail from './LawDetail';

function CodeLaws() {
  const [laws, setLaws] = useState([]);
  const [selectedLaw, setSelectedLaw] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les lois depuis Supabase
  useEffect(() => {
    async function fetchLaws() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Chargement des lois depuis Supabase...');
        
        const { data, error } = await supabase
          .from('code_laws')
          .select('*')
          .order('law_number', { ascending: true });
        
        if (error) throw error;
        
        console.log(`✅ ${data?.length || 0} lois chargées avec succès !`);
        setLaws(data || []);
        
      } catch (error) {
        console.error('❌ Erreur lors du chargement des lois:', error);
        setError('Impossible de charger les lois du Code International. Vérifiez votre connexion Supabase.');
        
        // Données de fallback en cas d'erreur
        setLaws([
          {
            id: 'fallback-1',
            law_number: '1',
            title: 'Le jeu de cartes (Mode hors ligne)',
            page: 6,
            section: 'Préliminaires',
            content: 'A. Classement des cartes et des couleurs. Le Bridge Duplicate est joué avec un jeu de 52 cartes, constituant quatre couleurs : Pique (♠), Cœur (♥), Carreau (♦), Trèfle (♣). Les cartes de chaque couleur sont classées dans l\'ordre décroissant : As, Roi, Dame, Valet, 10, 9, 8, 7, 6, 5, 4, 3, 2.',
            keywords: 'cartes,couleurs,classement'
          },
          {
            id: 'fallback-2',
            law_number: '2',
            title: 'Les étuis de tournoi (Mode hors ligne)',
            page: 6,
            section: 'Préliminaires',
            content: 'Un étui de tournoi contenant un jeu de cartes est mis à disposition pour chaque donne. Chaque étui est identifié par un numéro et contient les cartes distribuées selon un diagramme prédéterminé.',
            keywords: 'étuis,tournoi,donne'
          },
          {
            id: 'fallback-3',
            law_number: '3',
            title: 'Disposition des tables (Mode hors ligne)',
            page: 6,
            section: 'Préliminaires',
            content: 'Quatre joueurs jouent à chaque table, et les tables sont numérotées selon l\'ordre établi par l\'organisateur. Les joueurs sont désignés par les points cardinaux : Nord, Sud, Est, Ouest.',
            keywords: 'tables,joueurs,points cardinaux'
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLaws();
  }, []);

  // Filtrer les lois selon le terme de recherche
  const filteredLaws = laws.filter(law => 
    law.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    law.law_number.includes(searchTerm) ||
    (law.content && law.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (law.keywords && law.keywords.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Afficher le détail d'une loi
  if (selectedLaw) {
    return (
      <LawDetail 
        law={selectedLaw} 
        onBack={() => setSelectedLaw(null)}
        allLaws={laws}
        onNavigateToLaw={setSelectedLaw}
      />
    );
  }

  return (
    <div>
      <h2 className="section-title">Code International du Bridge 2017</h2>
      <p className="section-description">
        Les lois officielles du jeu de bridge selon le Code International 2017.
      </p>
      
      {/* Indicateur de statut */}
      <div style={{ 
        padding: '12px 16px', 
        marginBottom: '25px', 
        borderRadius: '8px',
        backgroundColor: error ? '#fee' : loading ? '#fff3cd' : '#d4edda',
        border: `1px solid ${error ? '#fcc' : loading ? '#ffeaa7' : '#c3e6cb'}`,
        color: error ? '#721c24' : loading ? '#856404' : '#155724',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        {loading && '🔄 Chargement des lois depuis Supabase...'}
        {error && `❌ ${error}`}
        {!loading && !error && `✅ ${laws.length} lois chargées depuis la base de données`}
      </div>
      
      {/* Barre de recherche */}
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Rechercher une loi (numéro, titre, contenu, mots-clés)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <p style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
            {filteredLaws.length} loi(s) trouvée(s) pour "{searchTerm}"
          </p>
        )}
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="loading-spinner">
          <p>Chargement des lois du Code International...</p>
        </div>
      )}

      {/* Liste des lois */}
      {!loading && (
        <div>
          {filteredLaws.map((law) => (
            <div 
              key={law.id}
              className="law-item"
              onClick={() => setSelectedLaw(law)}
            >
              <h3 className="law-title">
                Loi {law.law_number} - {law.title}
              </h3>
              <p className="law-meta">
                Page: {law.page} {law.section && `• Section: ${law.section}`}
              </p>
              {law.content && (
                <p className="law-content">
                  {law.content.substring(0, 200)}
                  {law.content.length > 200 ? '...' : ''}
                </p>
              )}
              {law.keywords && (
                <div style={{ marginTop: '12px' }}>
                  {law.keywords.split(',').slice(0, 5).map((keyword, index) => (
                    <span key={index} className="keyword-tag">
                      {keyword.trim()}
                    </span>
                  ))}
                  {law.keywords.split(',').length > 5 && (
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      +{law.keywords.split(',').length - 5} autres
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {!loading && filteredLaws.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Aucune loi ne correspond à votre recherche.</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Afficher toutes les lois
            </button>
          )}
        </div>
      )}

      {/* Statistiques */}
      {!loading && laws.length > 0 && (
        <div style={{ 
          marginTop: '40px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>Statistiques :</strong> {laws.length} lois disponibles dans le Code International 2017
        </div>
      )}
    </div>
  );
}

export default CodeLaws;
