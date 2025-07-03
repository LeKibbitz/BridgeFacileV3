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
  const [activeTab, setActiveTab] = useState('accueil');
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
        <h1>BridgeFacile - Documentation d'Arbitrage</h1>
        
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
        
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', justifyContent: 'center', padding: 0, flexWrap: 'wrap' }}>
            {['accueil', 'code', 'rnc', 'categories'].map((tab) => (
              <li key={tab} style={{ margin: '5px 15px' }}>
                <button 
                  onClick={() => setActiveTab(tab)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: activeTab === tab ? '#61dafb' : 'white',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: activeTab === tab ? 'bold' : 'normal',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tab === 'accueil' && '🏠 Accueil'}
                  {tab === 'code' && '⚖️ Code International'}
                  {tab === 'rnc' && '📋 RNC'}
                  {tab === 'categories' && '🃏 Catégories d\'Enchères'}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      
      <main style={{ padding: '20px', textAlign: 'left', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'accueil' && (
          <div>
            <h2>Bienvenue dans la section d'arbitrage de BridgeFacile</h2>
            <p style={{ marginBottom: '30px', color: '#666', fontSize: '18px' }}>
              Cette section contient toute la documentation officielle nécessaire pour l'arbitrage des compétitions de bridge.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
              {[
                { tab: 'code', bg: '#f8f9fa', color: '#2c3e50', title: '⚖️ Code International du Bridge 2017', desc: 'Les règles officielles du jeu de bridge selon le Code International.' },
                { tab: 'rnc', bg: '#fff3cd', color: '#856404', title: '📋 Règlement National des Compétitions 2024', desc: 'Les règles spécifiques aux compétitions françaises établies par la FFB.' },
                { tab: 'categories', bg: '#e8f5e8', color: '#2e7d32', title: '🃏 Catégories d\'Enchères', desc: 'Classification des systèmes d\'enchères autorisés selon les niveaux.' }
              ].map((card) => (
                <div key={card.tab} style={{ 
                  padding: '25px', 
                  backgroundColor: card.bg, 
                  borderRadius: '12px', 
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                     onClick={() => setActiveTab(card.tab)}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-4px)';
                       e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                     }}>
                  <h3 style={{ color: card.color, marginBottom: '15px' }}>{card.title}</h3>
                  <p style={{ color: '#666', lineHeight: '1.6' }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'code' && <CodeLaws />}
        {activeTab === 'rnc' && <RncArticles />}
        {activeTab === 'categories' && <BiddingCategories />}
      </main>
    </div>
  );
}

export default App;
