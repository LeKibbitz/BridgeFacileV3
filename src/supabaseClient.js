import { createClient } from '@supabase/supabase-js'

// ✅ URL API Supabase, pas l'URL PostgreSQL
const supabaseUrl = 'https://aqokcjsmajnpfkladubp.supabase.co'

// ✅ Clé anonyme (publique) pour le client Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxb2tjanNtYWpucGZrbGFkdWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTg4OTUsImV4cCI6MjA2Njk3NDg5NX0.f2Z4aRkTlUExrpir4fqIpn0TkzpS5B0WPuAHAb26YFM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Fonction de test de connexion
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('code_laws')
      .select('law_number, title')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connexion Supabase réussie !');
    console.log(data)
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    return false;
  }
}
