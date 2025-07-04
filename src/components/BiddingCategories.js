
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const BiddingCategories = () => {
  console.log('🚀 BiddingCategories component loaded!');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    
    const fetchDocuments = async () => {
      try {
        console.log('🔄 Récupération des documents conventions...');
        console.log('📡 Supabase client:', supabase);
        
        const { data, error } = await supabase
          .from('conventions_documents')
          .select('*')
          .order('document_type', { ascending: true });

        console.log('📊 Réponse Supabase - data:', data);
        console.log('📊 Réponse Supabase - error:', error);

        if (error) {
          console.error('❌ Erreur Supabase:', error);
          throw error;
        }
        
        console.log('✅ Documents récupérés:', data);
        setDocuments(data || []);
      } catch (err) {
        console.error('❌ Erreur lors de la récupération:', err);
        setError(err.message);
      } finally {
        console.log('🏁 Chargement terminé');
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const term = searchTerm.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(term)) ||
      (doc.description && doc.description.toLowerCase().includes(term)) ||
      (doc.document_type && doc.document_type.toLowerCase().includes(term))
    );
  });

  const handleViewDocument = (document) => {
    console.log('👁️ Ouverture document:', document);
    setSelectedDocument(document);
  };

    const closeModal = () => {
    console.log('❌ Fermeture modal');
    setSelectedDocument(null);
  };

  console.log('🎨 Render - loading:', loading, 'error:', error, 'documents:', documents);

  return (
    <div>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '10px', fontSize: '12px' }}>
        DEBUG: Loading={loading ? 'true' : 'false'}, Error={error || 'none'}, Documents={documents.length}
      </div>
      
      {loading && <p>Chargement des documents...</p>}
      {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
      
      {/* Barre de recherche alignée */}
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
            {filteredDocuments.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Aucun document trouvé. Total documents: {documents.length}
              </p>
            ) : (
              filteredDocuments.map((document) => (
                <div
                  key={document.id}
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
                      {document.document_type === 'CI' ? '📋' : 
                       document.document_type === 'SHA' ? '🔧' : '📁'} {document.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Bouton loupe pour voir le document */}
                      <button
                        onClick={() => handleViewDocument(document)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#6c757d',
                          padding: '4px'
                        }}
                        title="Voir le document"
                      >
                        🔍
                      </button>
                      {/* Bouton téléchargement */}
                      <a
                        href={`/${document.document_type}.pdf`}
                        download={`${document.document_type}.pdf`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '16px',
                          color: '#6c757d',
                          padding: '4px',
                          textDecoration: 'none'
                        }}
                        title="Télécharger"
                      >
                        💾
                      </a>
                    </div>
                  </div>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    {document.description}
                  </p>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Modal pour afficher le document */}
      {selectedDocument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #ddd',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, color: '#2c3e50' }}>
                {selectedDocument.name}
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>
                {selectedDocument.description}
              </p>
              
              {/* Affichage du PDF */}
              <iframe
                src={`/${selectedDocument.document_type}.pdf`}
                style={{
                  width: '100%',
                  height: '600px',
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
                title={selectedDocument.name}
              />
              
              <div style={{ marginTop: '15px' }}>
                <a
                  href={`/${selectedDocument.document_type}.pdf`}
                  download={`${selectedDocument.document_type}.pdf`}
                  style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  💾 Télécharger le PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingCategories;

