const parseDocuments = require('./parse_documents');
const { DocumentParser } = parseDocuments;
const DOCUMENT_TYPES = {
    CODE_LAWS: 'code_laws',
    RNC: 'rnc_articles'
};
const fs = require('fs');
const path = require('path');

// Create a test class that extends DocumentParser
class TestParser extends DocumentParser {
    constructor() {
        super(DOCUMENT_TYPES.RNC);
    }
    
    async updateProgress() {} // Override the updateProgress method
}

async function testParser() {
    try {
        // Create a test parser instance
        const parser = new TestParser();
        
        // Read test data
        const text = fs.readFileSync(__dirname + '/test_pages_100_109.txt', 'utf-8');
        
        // Split into sections
        const sections = text.split('\n\n');
        
        // Track if we've found the first complete article
        let foundFirstCompleteArticle = false;
        
        // Process each section
        for (const section of sections) {
            if (section.trim()) {
                // Extract article number
                const articleNumber = section.match(/Article\s+(\d+\.\d+)/)?.[1];
                if (!articleNumber) continue;
                
                // Skip partial articles at the start of page 100
                if (!foundFirstCompleteArticle) {
                    // Check if this is the first complete article
                    const articleContent = section.replace(/Article\s+\d+\.\d+\s*/, '');
                    const alineas = parser.extractAlineas(articleContent);
                    
                    // If we have at least one complete alinea, consider this a complete article
                    if (alineas.length > 0) {
                        foundFirstCompleteArticle = true;
                    } else {
                        continue; // Skip this partial article
                    }
                }
                
                console.log('\nProcessing Article:', articleNumber);
                
                // Extract article content
                const articleContent = section.replace(/Article\s+\d+\.\d+\s*/, '');
                
                // Extract alineas
                const alineas = parser.extractAlineas(articleContent);
                console.log('\nExtracted alineas:', alineas);
                
                // Process each alinea
                for (const alinea of alineas) {
                    console.log('\nAlinea:', alinea.number);
                    console.log('Content:', alinea.content);
                    
                    if (alinea.subAlineas) {
                        console.log('\nSub-alineas:');
                        for (const subAlinea of alinea.subAlineas) {
                            console.log('  -', subAlinea.number);
                            console.log('    Content:', subAlinea.content);
                            
                            if (subAlinea.subSubAlineas) {
                                console.log('    Sub-sub-alineas:');
                                for (const subSubAlinea of subAlinea.subSubAlineas) {
                                    console.log('      -', subSubAlinea.number);
                                    console.log('        Content:', subSubAlinea.content);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Process test data file
        const testData = fs.readFileSync(path.join(__dirname, 'test_pages_100_109.txt'), 'utf-8');
        
        // Split into pages
        const pages = testData.split('\n\n');
        
        // Process each page
        for (const page of pages) {
            // Skip partial article at start of page 100
            if (page.includes('100.1')) continue;
            
            // Extract article numbers from this page
            const articleNumbers = page.match(/\d+\.\d+/g) || [];
            console.log(`Found articles: ${articleNumbers.length}`);
            
            // Process each article found on this page
            for (const articleNumber of articleNumbers) {
                // Split into article and alinea numbers
                const [articleNum, alineaNum] = articleNumber.split('.');
                
                // Extract content for this article
                const articleRegex = new RegExp(`(${articleNum}\\.${alineaNum})[^\\n]*(?:\\n[^\\d+\\.\\d+])*$`, 's');
                const articleMatch = page.match(articleRegex);
                if (articleMatch) {
                    const content = articleMatch[0].replace(articleNumber, '').trim();
                    
                    // Extract alineas
                    const alineas = parser.extractAlineas(content);
                    console.log('\nExtracted alineas:', JSON.stringify(alineas, null, 2));
                    
                    // Process each alinea
                    for (const alinea of alineas) {
                        console.log('\nAlinea:', alinea.number);
                        console.log('Content:', alinea.content);
                        
                        if (alinea.subAlineas) {
                            console.log('\nSub-alineas:');
                            for (const subAlinea of alinea.subAlineas) {
                                console.log('  -', subAlinea.number);
                                console.log('    Content:', subAlinea.content);
                                
                                if (subAlinea.subSubAlineas) {
                                    console.log('    Sub-sub-alineas:');
                                    for (const subSubAlinea of subAlinea.subSubAlineas) {
                                        console.log('      -', subSubAlinea.number);
                                        console.log('        Content:', subSubAlinea.content);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in test:', error);
    }
}

// Run the test
testParser();
