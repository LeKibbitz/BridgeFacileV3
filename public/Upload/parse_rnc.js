const fs = require('fs');
const pdf = require('pdf-parse');
const { createClient } = require('../../supabaseClient');

// Read the PDF file
const pdfPath = './RNC 2025-2026.pdf';

async function parsePDF() {
  try {
    const data = await pdf(fs.readFileSync(pdfPath));
    const text = data.text;
    
    // Initialize variables for hierarchy
    let currentTitle = null;
    let currentChapter = null;
    let currentArticle = null;
    let currentSection = null;
    let orderInTitle = 0;
    let orderInChapter = 0;
    
    // Split text into sections
    const sections = text.split(/\n\n/);
    
    // Process each section
    for (const section of sections) {
      // Handle Titles
      if (section.match(/^Titre\s+\d+/)) {
        currentTitle = section;
        orderInTitle++;
        orderInChapter = 0;
        
        const titleNumber = section.match(/\d+/)?.[0];
        const article = {
          title_number: titleNumber,
          title_name: section,
          is_title: true,
          order_in_title: orderInTitle,
          content: '',
          pdf_path: pdfPath
        };
        
        const { data: titleData, error: titleError } = await supabase
          .from('rnc_articles')
          .insert([article])
          .select();

        if (titleError) throw titleError;
        currentArticle = titleData[0];
        
      } else if (section.match(/^Chapitre\s+\d+/)) {
        // Handle Chapter
        currentChapter = section;
        orderInChapter++;
        
        const chapterNumber = section.match(/\d+/)?.[0];
        const article = {
          title_number: currentTitle?.match(/\d+/)?.[0],
          chapter_number: chapterNumber,
          chapter_name: section,
          is_chapter: true,
          order_in_chapter: orderInChapter,
          order_in_title: orderInTitle,
          content: '',
          pdf_path: pdfPath,
          parent_article_id: currentArticle?.id
        };
        
        const { data: chapterData, error: chapterError } = await supabase
          .from('rnc_articles')
          .insert([article])
          .select();

        if (chapterError) throw chapterError;
        currentArticle = chapterData[0];
        
      } else if (section.match(/^Article\s+\d+\.\d+/)) {
        // Handle Article
        const articleNumber = section.match(/Article\s+(\d+\.\d+)/)?.[1];
        const [titleNum, chapterNum] = articleNumber.split('.').map(Number);
        
        const [title, content] = section.split(/\n/);
        const article = {
          title_number: titleNum,
          chapter_number: chapterNum,
          article_number: articleNumber,
          title_name: title,
          content: content.trim(),
          pdf_path: pdfPath,
          order_in_chapter: orderInChapter,
          order_in_title: orderInTitle,
          parent_article_id: currentArticle?.id
        };
        
        const { data: articleData, error: articleError } = await supabase
          .from('rnc_articles')
          .insert([article])
          .select();

        if (articleError) throw articleError;
        currentArticle = articleData[0];
        
        // Extract references and create relationships
        const references = content.match(/Article\s+\d+\.\d+/g) || [];
        for (const ref of references) {
          const refNumber = ref.replace('Article ', '');
          const relationship = {
            parent_article_id: articleData[0].id,
            child_article_id: (await supabase
              .from('rnc_articles')
              .select('id')
              .eq('article_number', refNumber)
              .single())?.data?.id,
            relationship_type: 'references',
            description: `Reference to ${ref}`
          };
          
          await supabase.from('rnc_article_relationships').insert([relationship]);
        }
        
        // Extract law references
        const lawReferences = content.match(/Loi\s+\d+/g) || [];
        for (const lawRef of lawReferences) {
          const lawNumber = lawRef.replace('Loi ', '');
          const lawRelationship = {
            article_id: articleData[0].id,
            law_id: (await supabase
              .from('code_laws')
              .select('id')
              .eq('law_number', lawNumber)
              .single())?.data?.id,
            relationship_type: 'references',
            description: `Reference to ${lawRef}`
          };
          
          await supabase.from('article_law_relationships').insert([lawRelationship]);
        }
      }
    }
    
    console.log('RNC articles parsed and inserted successfully!');
  } catch (error) {
    console.error('Error parsing RNC:', error);
  }
}

parsePDF();
