const fs = require('fs');
const path = require('path');

// Mock database pool for testing
const pool = {
    query: () => ({})
};

// Constants for parsing
const DOCUMENT_TYPES = {
    CODE_LAWS: 'code_laws',
    RNC: 'rnc_articles'
};

class DocumentParser {
    constructor(documentType) {
        this.documentType = documentType;
        this.currentContext = {
            title: {
                number: null,
                name: null
            },
            chapter: {
                number: null,
                name: null
            },
            section: {
                number: null,
                name: null
            },
            article: {
                number: null,
                name: null,
                content: null
            },
            alinea: {
                number: null,
                content: null
            },
            subAlinea: {
                number: null,
                content: null
            },
            subSubAlinea: {
                number: null,
                content: null
            }
        };
        this.progressPercentage = 0;
    }

    async updateProgress(status = 'parsing', errorMessage = null) {
        // Mocked updateProgress for testing
    }

    async parsePDF(filePath) {
        try {
            const pdfData = await pdfParse(fs.readFileSync(filePath));
            const sections = pdfData.text.split('\n\n');
            
            for (let i = 0; i < sections.length; i++) {
                await this.updateProgress();
                if (this.documentType === DOCUMENT_TYPES.CODE_LAWS) {
                    await this.parseCodeLawSection(sections[i]);
                } else if (this.documentType === DOCUMENT_TYPES.RNC) {
                    await this.parseRNCSection(sections[i]);
                }
            }
        } catch (error) {
            console.error('Error parsing PDF:', error);
            throw error;
        }
    }

    extractAlineas(content) {
        // Split content into alineas using patterns
        const alineaPatterns = [
            /^[0-9]+\./,  // Numbered alineas (1., 2., etc.)
            /^[a-z]$/,     // Lowercase letter alineas (a, b, c)
            /^[A-Z]$/,     // Uppercase letter alineas (A, B, C)
            /^[a-z]\)/,   // Lowercase letter with parenthesis (a), b), etc.)
            /^[A-Z]\)/,   // Uppercase letter with parenthesis (A), B), etc.)
            /^[a-z]\)$/g, // Lowercase letter with closing parenthesis (a), b), etc.)
            /^[A-Z]\)$/g, // Uppercase letter with closing parenthesis (A), B), etc.)
            /^\([IiVvXx]+\)/ // Roman numerals with parenthesis (i), ii), etc.)
        ];

        let alineas = [];
        let remainingContent = content;

        // Process each pattern for multiple matches
        for (const pattern of alineaPatterns) {
            let matches = remainingContent.match(pattern);
            while (matches) {
                // Get the full match including content
                const match = remainingContent.match(new RegExp(`(${pattern.source})[^\n]*`, 's'));
                if (match) {
                    const alinea = {
                        number: matches[0].trim(),
                        content: match[0].replace(matches[0], '').trim()
                    };
                    alineas.push(alinea);
                    
                    // Update remaining content
                    remainingContent = remainingContent.replace(match[0], '').trim();
                    
                    // Look for next match
                    matches = remainingContent.match(pattern);
                } else {
                    break;
                }
            }
        }

        // Process sub-alineas for each alinea
        for (const alinea of alineas) {
            if (alinea.content) {
                alinea.subAlineas = this.extractSubAlineas(alinea.content);
            }
        }

        return alineas;
    }

    extractSubAlineas(content) {
        // Split content into sub-alineas using patterns
        const subAlineaPatterns = [
            /^[a-z]$/,      // Lowercase letter sub-alineas (a, b, c)
            /^[A-Z]$/,      // Uppercase letter sub-alineas (A, B, C)
            /^[a-z]\)/,     // Lowercase letter with parenthesis (a), b), etc.)
            /^[A-Z]\)/,     // Uppercase letter with parenthesis (A), B), etc.)
            /^[a-z]\)$/g,    // Lowercase letter with closing parenthesis (a), b), etc.)
            /^[A-Z]\)$/g,    // Uppercase letter with closing parenthesis (A), B), etc.)
            /^\([IiVvXx]+\)/  // Roman numerals with parenthesis (i), ii), etc.)
        ];

        let subAlineas = [];
        let remainingContent = content;
        
        // Process each pattern for multiple matches
        for (const pattern of subAlineaPatterns) {
            let matches = remainingContent.match(pattern);
            while (matches) {
                // Get the full match including content
                const match = remainingContent.match(new RegExp(`(${pattern.source})[^\n]*`));
                if (match) {
                    const subAlinea = {
                        number: matches[0].trim(),
                        content: match[0].replace(matches[0], '').trim()
                    };
                    subAlineas.push(subAlinea);
                    
                    // Update remaining content
                    remainingContent = remainingContent.replace(match[0], '').trim();
                    
                    // Look for next match
                    matches = remainingContent.match(pattern);
                } else {
                    break;
                }
            }
        }
        
        // Process sub-sub-alineas for each sub-alinea
        for (const subAlinea of subAlineas) {
            if (subAlinea.content) {
                const subSubAlineas = this.extractSubSubAlineas(subAlinea.content);
                if (subSubAlineas.length > 0) {
                    subAlinea.subSubAlineas = subSubAlineas;
                }
            }
        }
        
        return subAlineas;
    }

    extractSubSubAlineas(content) {
        // Split content into sub-sub-alineas using patterns
        const subSubAlineaPatterns = [
            /^[a-z]$/,      // Lowercase letter sub-sub-alineas (a, b, c)
            /^[A-Z]$/,      // Uppercase letter sub-sub-alineas (A, B, C)
            /^[a-z]\)/,     // Lowercase letter with parenthesis (a), b), etc.)
            /^[A-Z]\)/,     // Uppercase letter with parenthesis (A), B), etc.)
            /^[a-z]\)$/g,    // Lowercase letter with closing parenthesis (a), b), etc.)
            /^[A-Z]\)$/g,    // Uppercase letter with closing parenthesis (A), B), etc.)
            /^\([IiVvXx]+\)/  // Roman numerals with parenthesis (i), ii), etc.)
        ];
        
        const extractedSubSubAlineas = [];
        let currentContent = content;
        
        // Process each pattern for multiple matches
        for (const pattern of subSubAlineaPatterns) {
            let currentMatches = currentContent.match(pattern);
            while (currentMatches) {
                // Get the full match including content
                const match = currentContent.match(new RegExp(`(${pattern.source})[^\n]*`, 's'));
                if (match) {
                    const subSubAlinea = {
                        number: currentMatches[0].trim(),
                        content: match[0].replace(currentMatches[0], '').trim()
                    };
                    extractedSubSubAlineas.push(subSubAlinea);
                    currentContent = currentContent.replace(match[0], '').trim();
                    currentMatches = currentContent.match(pattern);
                } else {
                    break;
                }
            }
        }
        
        return extractedSubSubAlineas;
    }

    async processCodeLawAlinea(article, alinea) {
        // Process each alinea and its sub-alineas
        const alineaRecord = {
            alinea_number: alinea.number,
            content: alinea.content,
            parent_article_id: article.id,
        };
        
        // Update alinea in existing record
        await pool.query(
            'UPDATE code_laws SET alinea_number = $1, content = $2 WHERE id = $3',
            [alineaRecord.alinea_number, alineaRecord.content, article.id]
        );
        
        // Process sub-alineas
        const subAlineas = this.extractSubAlineas(alinea.content);
        for (const subAlinea of subAlineas) {
            await this.processCodeLawSubAlinea(article.id, subAlinea);
        }
    }

    async processCodeLawSubAlinea(parentId, subAlinea) {
        // Process each sub-alinea and its sub-sub-alineas
        const subAlineaRecord = {
            sub_alinea: subAlinea.number,
            content: subAlinea.content,
            parent_article_id: parentId,
        };
        
        // Insert sub-alinea
        const { data: subAlineaData, error: subAlineaError } = await pool.query(
            'INSERT INTO code_laws (sub_alinea, content, parent_article_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [subAlineaRecord.sub_alinea, subAlineaRecord.content, subAlineaRecord.parent_article_id, 'system', 'system']
        );
        
        if (subAlineaError) throw subAlineaError;
        
        // Insert hierarchy relationship
        await pool.query(
            'INSERT INTO code_laws_hierarchy (child_law_id, parent_law_id, hierarchy_level) VALUES ($1, $2, $3)',
            [subAlineaData[0].id, parentId, 2]
        );
        
        // Process sub-sub-alineas
        const subSubAlineas = this.extractSubSubAlineas(subAlinea.content);
        for (const subSubAlinea of subSubAlineas) {
            await this.processCodeLawSubSubAlinea(subAlineaData[0].id, subSubAlinea);
        }
    }

    async processCodeLawSubSubAlinea(parentId, subSubAlinea) {
        // Process each sub-sub-alinea
        const subSubAlineaRecord = {
            sub_sub_alinea: subSubAlinea.number,
            content: subSubAlinea.content,
            parent_article_id: parentId,
        };

        // Insert sub-sub-alinea
        const { data: subSubAlineaData, error: subSubAlineaError } = await pool.query(
            'INSERT INTO code_laws (sub_sub_alinea, content, parent_article_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [subSubAlineaRecord.sub_sub_alinea, subSubAlineaRecord.content, subSubAlineaRecord.parent_article_id, 'system', 'system']
        );

        if (subSubAlineaError) throw subSubAlineaError;

        // Insert hierarchy relationship
        await pool.query(
            'INSERT INTO code_laws_hierarchy (child_law_id, parent_law_id, hierarchy_level) VALUES ($1, $2, $3)',
            [subSubAlineaData[0].id, parentId, 3]
        );
    }

    async parseRNCSection(section) {
        // Extract title (e.g., "TITRE II Organisation des compétitions fédérales")
        const titleMatch = section.match(/^TITRE\s+(\d+)\s+(.+)$/);
        if (titleMatch) {
            this.currentContext.title.number = titleMatch[1].trim();
            this.currentContext.title.name = titleMatch[2].trim();
            await this.insertTitle(this.currentContext.title.number, this.currentContext.title.name);
            return;
        }

        // Extract chapter (e.g., "Chapitre I : Dispositions générales")
        const chapterMatch = section.match(/^Chapitre\s+(\d+)\s*:\s*(.+)$/);
        if (chapterMatch) {
            this.currentContext.chapter.number = chapterMatch[1].trim();
            this.currentContext.chapter.name = chapterMatch[2].trim();
            await this.insertChapter(this.currentContext.chapter.number, this.currentContext.chapter.name);
            return;
        }

        // Extract section (e.g., "Section 1 : Dispositions générales")
        const sectionMatch = section.match(/^Section\s+(\d+)\s*:\s*(.+)$/);
        if (sectionMatch) {
            this.currentContext.section.number = sectionMatch[1].trim();
            this.currentContext.section.name = sectionMatch[2].trim();
            await this.insertSection(this.currentContext.section.number, this.currentContext.section.name);
            return;
        }

        // Extract article (e.g., "Article 6 – Stade, phase, séance")
        const articleMatch = section.match(/Article\s+(\d+)\s*–\s*(.+)$/);
        if (articleMatch) {
            this.currentContext.article.number = articleMatch[1].trim();
            this.currentContext.article.name = articleMatch[2].trim();
            const articleContent = section.replace(/Article\s+\d+\s*–\s*.+\s*/, '');
            
            // Insert article with title and chapter context (no section for hyperlinks)
            const articleRecord = {
                title_number: this.currentContext.title.number,
                title_name: this.currentContext.title.name,
                chapter_number: this.currentContext.chapter.number,
                chapter_name: this.currentContext.chapter.name,
                article_number: this.currentContext.article.number,
                article_name: this.currentContext.article.name,
                content: articleContent,
                created_by: 'system',
                updated_by: 'system'
            };
            
            // Insert article
            const { data: articleData, error: articleError } = await pool.query(
                'INSERT INTO rnc_articles (title_number, title_name, chapter_number, chapter_name, article_number, article_name, content, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
                [articleRecord.title_number, articleRecord.title_name, articleRecord.chapter_number, articleRecord.chapter_name, articleRecord.article_number, articleRecord.article_name, articleRecord.content, articleRecord.created_by, articleRecord.updated_by]
            );
            
            if (articleError) throw articleError;
            
            // Extract alineas
            const alineas = this.extractAlineas(articleContent);
            
            // Process each alinea
            for (const alinea of alineas) {
                this.currentContext.alinea.number = alinea.number;
                this.currentContext.alinea.content = alinea.content;
                await this.insertAlinea(articleData[0], alinea);
            }
        }
    }

    async insertSection(sectionNumber, sectionName) {
        const sectionRecord = {
            title_number: this.currentContext.title.number,
            title_name: this.currentContext.title.name,
            chapter_number: this.currentContext.chapter.number,
            chapter_name: this.currentContext.chapter.name,
            section_number: sectionNumber,
            section_name: sectionName,
            created_by: 'system',
            updated_by: 'system'
        };

        const { data: sectionData, error: sectionError } = await pool.query(
            'INSERT INTO rnc_sections (title_number, title_name, chapter_number, chapter_name, section_number, section_name, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [sectionRecord.title_number, sectionRecord.title_name, sectionRecord.chapter_number, sectionRecord.chapter_name, sectionRecord.section_number, sectionRecord.section_name, sectionRecord.created_by, sectionRecord.updated_by]
        );

        if (sectionError) throw sectionError;
        return sectionData[0];
    }

    async parseCodeLawSection(section) {
        // Extract article (e.g., "Article 1 – Les compétitions")
        const articleMatch = section.match(/Article\s+(\d+)\s*–\s*(.+)$/);
        if (articleMatch) {
            this.currentContext.article.number = articleMatch[1].trim();
            this.currentContext.article.name = articleMatch[2].trim();
            const articleContent = section.replace(/Article\s+\d+\s*–\s*.+\s*/, '');

            // Insert article
            const { data: articleData, error: articleError } = await pool.query(
                'INSERT INTO code_laws (article_number, article_name, content, created_by, updated_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [this.currentContext.article.number, this.currentContext.article.name, articleContent, 'system', 'system']
            );

            if (articleError) throw articleError;

            // Extract alineas
            const alineas = this.extractAlineas(articleContent);
            
            // Process each alinea
            for (const alinea of alineas) {
                await this.processCodeLawAlinea(articleData[0], alinea);
            }
        }
    }
}

// Export functions to start parsing
async function parseRNC(filePath) {
    const parser = new DocumentParser(DOCUMENT_TYPES.RNC);
    await parser.parsePDF(filePath);
}

async function parseCodeLaws(filePath) {
    const parser = new DocumentParser(DOCUMENT_TYPES.CODE_LAWS);
    await parser.parsePDF(filePath);
}

module.exports = {
    parseRNC,
    parseCodeLaws,
    DOCUMENT_TYPES
};
