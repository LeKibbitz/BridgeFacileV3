import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase } from './supabaseClient';
import CodeLaws from './components/CodeLaws.js';
import RncArticles from './components/RncArticles.js';
import BiddingCategories from './components/BiddingCategories.js';

// Fonction de test de connexion Supabase
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('code_laws')
      .select('law_number, title')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connexion Supabase réussie !');
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return false;
  }
}

function App() {
  const [connectionStatus, setConnectionStatus] = useState('testing');

  useEffect(() => {
    async function checkConnection() {
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    }
    checkConnection();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Bridge Facile - Arbitrage</h1>
        
        <div style={{ 
          fontSize: '12px', 
          marginBottom: '15px',
          padding: '5px 10px',
          borderRadius: '4px',
          backgroundColor: connectionStatus === 'connected' ? '#d4edda' : 
                          connectionStatus === 'error' ? '#f8d7da' : '#fff3cd',
          color: connectionStatus === 'connected' ? '#155724' : 
                 connectionStatus === 'error' ? '#721c24' : '#856404'
        }}>
          {connectionStatus === 'testing' && '🔄 Test de connexion...'}
          {connectionStatus === 'connected' && '✅ Connecté à la base de données'}
          {connectionStatus === 'error' && '❌ Erreur de connexion - Mode données fictives'}
        </div>
      </header>
      
      <main style={{ padding: '20px', textAlign: 'left', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '30px',
          alignItems: 'start'
        }}>
          
          {/* Bloc 1: Code International */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid #dee2e6'
            }}>
              <h3 className="title-block">
                ⚖️ Code International 2017
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <CodeLaws />
            </div>
          </div>

          {/* Bloc 2: RNC */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid #dee2e6'
            }}>
              <h3 className="title-block">
                📋 Règlement National des Compétitions 2025-2026
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <RncArticles />
            </div>
          </div>

          {/* Bloc 3: Catégories d'Enchères */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px', 
              borderBottom: '1px solid #dee2e6'
            }}>
              <h3 className="title-block">
                🃏 Conventions & Systèmes Autorisés
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <BiddingCategories />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
