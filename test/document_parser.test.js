const { parseRNC, parseCodeLaws, DOCUMENT_TYPES } = require('../scripts/parse_documents');
const fs = require('fs');
const path = require('path');

// Mock the pdf-parse function to handle text files directly
const pdfParse = jest.fn((content) => ({
    text: content.toString()
}));

// Make the mock function available globally
const globalObject = global || window;
globalObject.pdfParse = pdfParse;

describe('DocumentParser', () => {
    describe('RNC Document Parsing', () => {
        const testContent = `
TITRE I Organisation des compétitions fédérales

Chapitre I : Dispositions générales

Section 1 : Dispositions générales

Article 1 – Stade, phase, séance
1. Les compétitions fédérales sont organisées en stades successifs.
2. Chaque stade est composé de phases.
3. Chaque phase est composée de séances.

Article 2 – Organisation
a) Les compétitions sont organisées par la Fédération.
A. La Fédération peut déléguer l'organisation à des comités régionaux.

Section 2 : Inscriptions

Article 3 – Inscriptions
1. Les joueurs doivent s'inscrire avant la date limite.
2. Les inscriptions sont validées par le directeur de la compétition.

Chapitre II : Dispositions spécifiques

Article 4 – Arbitrage
1. Les arbitres sont désignés par la Fédération.
2. Les décisions des arbitres sont définitives.

TITRE II Organisation des compétitions nationales

Chapitre I : Dispositions générales

Article 5 – Organisation
1. Les compétitions nationales sont organisées par les ligues.
2. Les ligues peuvent déléguer l'organisation à des clubs.
        `;

        beforeEach(() => {
            // Mock the database pool
            global.pool = {
                query: jest.fn().mockImplementation((query, params) => {
                    // Mock different responses based on the query
                    if (query.includes('INSERT INTO')) {
                        const mockData = { id: 1 };
                        // Add relevant params to mock data for different tables
                        if (query.includes('rnc_titles')) {
                            mockData.title_number = params[0];
                            mockData.title_name = params[1];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_chapters')) {
                            mockData.chapter_number = params[0];
                            mockData.chapter_name = params[1];
                            mockData.title_number = params[2];
                            mockData.title_name = params[3];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_sections')) {
                            mockData.section_number = params[0];
                            mockData.section_name = params[1];
                            mockData.title_number = params[2];
                            mockData.title_name = params[3];
                            mockData.chapter_number = params[4];
                            mockData.chapter_name = params[5];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_articles')) {
                            mockData.article_number = params[4];
                            mockData.article_name = params[5];
                            mockData.title_number = params[0];
                            mockData.title_name = params[1];
                            mockData.chapter_number = params[2];
                            mockData.chapter_name = params[3];
                            mockData.content = params[6];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('code_laws')) {
                            mockData.article_number = params[0];
                            mockData.article_name = params[1];
                            mockData.content = params[2];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        }
                        // Return exactly what the test expects
                        return Promise.resolve({
                            data: [{
                                id: 1,
                                title_number: params[2],
                                title_name: params[3],
                                chapter_number: params[4],
                                chapter_name: params[5],
                                section_number: params[0],
                                section_name: params[1],
                                created_by: 'system',
                                updated_by: 'system'
                            }],
                            error: null
                        });
                    }
                    return Promise.resolve({ data: [], error: null });
                })
            };
        });

        it('should parse RNC document structure correctly', async () => {
            // Create a temporary test file
            const tempFilePath = path.join(__dirname, 'test_rnc.txt');
            fs.writeFileSync(tempFilePath, testContent);

            try {
                await parseRNC(tempFilePath);

                // Verify that database queries were called with correct structure
                const queryCalls = global.pool.query.mock.calls;
                
                // Check for title insertion
                expect(queryCalls[0][0]).toContain('INSERT INTO rnc_titles');
                expect(queryCalls[0][1][0]).toBe('1');
                expect(queryCalls[0][1][1]).toBe('Organisation des compétitions fédérales');

                // Check for chapter insertion
                expect(queryCalls[1][0]).toContain('INSERT INTO rnc_chapters');
                expect(queryCalls[1][1][0]).toBe('1');
                expect(queryCalls[1][1][1]).toBe('Dispositions générales');

                // Check for section insertion
                expect(queryCalls[2][0]).toContain('INSERT INTO rnc_sections');
                expect(queryCalls[2][1][0]).toBe('1');
                expect(queryCalls[2][1][1]).toBe('Dispositions générales');

                // Check for article insertion
                expect(queryCalls[3][0]).toContain('INSERT INTO rnc_articles');
                expect(queryCalls[3][1][4]).toBe('1');
                expect(queryCalls[3][1][5]).toBe('Stade, phase, séance');

                // Check for alinea insertion
                expect(queryCalls[4][0]).toContain('INSERT INTO rnc_articles');
                expect(queryCalls[4][1][6]).toBe('1.');

                // Check for sub-alinea insertion
                expect(queryCalls[5][0]).toContain('INSERT INTO rnc_articles');
                expect(queryCalls[5][1][7]).toBe('a');

                // Check for sub-sub-alinea insertion
                expect(queryCalls[6][0]).toContain('INSERT INTO rnc_articles');
                expect(queryCalls[6][1][8]).toBe('A');

                // Check for hierarchy relationships
                expect(queryCalls[7][0]).toContain('INSERT INTO rnc_article_hierarchy');
                expect(queryCalls[7][1][2]).toBe(1); // hierarchy level
            } finally {
                // Clean up
                fs.unlinkSync(tempFilePath);
            }
        });

        it('should handle nested alineas correctly', async () => {
            const tempFilePath = path.join(__dirname, 'test_rnc.txt');
            fs.writeFileSync(tempFilePath, testContent);

            try {
                await parseRNC(tempFilePath);

                const queryCalls = global.pool.query.mock.calls;
                
                // Check for nested alineas in Article 2
                const article2Calls = queryCalls.filter(call => 
                    call[1] && call[1][5] === 'Organisation'
                );

                expect(article2Calls.length).toBe(3); // 1 article + 2 alineas
                expect(article2Calls[1][1][6]).toBe('a)');
                expect(article2Calls[2][1][7]).toBe('A.');
            } finally {
                fs.unlinkSync(tempFilePath);
            }
        });
    });

    describe('Code Laws Document Parsing', () => {
        const testContent = `
Article 1 – Les compétitions
1. Les compétitions sont organisées par la Fédération.
a) Les inscriptions doivent être faites avant la date limite.
A) Les joueurs doivent être licenciés.

Article 2 – Arbitrage
1. Les arbitres sont désignés par la Fédération.
2. Les décisions des arbitres sont définitives.
        `;

        beforeEach(() => {
            // Mock the database pool
            global.pool = {
                query: jest.fn().mockImplementation((query, params) => {
                    // Mock different responses based on the query
                    if (query.includes('INSERT INTO')) {
                        const mockData = { id: 1 };
                        // Add relevant params to mock data for different tables
                        if (query.includes('rnc_titles')) {
                            mockData.title_number = params[0];
                            mockData.title_name = params[1];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_chapters')) {
                            mockData.chapter_number = params[0];
                            mockData.chapter_name = params[1];
                            mockData.title_number = params[2];
                            mockData.title_name = params[3];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_sections')) {
                            mockData.section_number = params[0];
                            mockData.section_name = params[1];
                            mockData.title_number = params[2];
                            mockData.title_name = params[3];
                            mockData.chapter_number = params[4];
                            mockData.chapter_name = params[5];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('rnc_articles')) {
                            mockData.article_number = params[4];
                            mockData.article_name = params[5];
                            mockData.title_number = params[0];
                            mockData.title_name = params[1];
                            mockData.chapter_number = params[2];
                            mockData.chapter_name = params[3];
                            mockData.content = params[6];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        } else if (query.includes('code_laws')) {
                            mockData.article_number = params[0];
                            mockData.article_name = params[1];
                            mockData.content = params[2];
                            mockData.created_by = 'system';
                            mockData.updated_by = 'system';
                        }
                        // Return exactly what the test expects
                        return Promise.resolve({
                            data: [{
                                id: 1,
                                title_number: params[2],
                                title_name: params[3],
                                chapter_number: params[4],
                                chapter_name: params[5],
                                section_number: params[0],
                                section_name: params[1],
                                created_by: 'system',
                                updated_by: 'system'
                            }],
                            error: null
                        });
                    }
                    return Promise.resolve({ data: [], error: null });
                })
            };
        });

        it('should parse code laws correctly', async () => {
            const tempFilePath = path.join(__dirname, 'test_code_laws.txt');
            fs.writeFileSync(tempFilePath, testContent);

            try {
                await parseCodeLaws(tempFilePath);

                const queryCalls = global.pool.query.mock.calls;

                // Check for article insertion
                expect(queryCalls[0][0]).toContain('INSERT INTO code_laws');
                expect(queryCalls[0][1][0]).toBe('1');
                expect(queryCalls[0][1][1]).toBe('Les compétitions');

                // Check for alinea insertion
                expect(queryCalls[1][0]).toContain('INSERT INTO code_laws');
                expect(queryCalls[1][1][2]).toBe('1.');

                // Check for sub-alinea insertion
                expect(queryCalls[2][0]).toContain('INSERT INTO code_laws');
                expect(queryCalls[2][1][3]).toBe('a)');

                // Check for sub-sub-alinea insertion
                expect(queryCalls[3][0]).toContain('INSERT INTO code_laws');
                expect(queryCalls[3][1][4]).toBe('A)');

                // Check for hierarchy relationships
                expect(queryCalls[4][0]).toContain('INSERT INTO code_laws_hierarchy');
                expect(queryCalls[4][1][2]).toBe(1); // hierarchy level
            } finally {
                fs.unlinkSync(tempFilePath);
            }
        });
    });
});
