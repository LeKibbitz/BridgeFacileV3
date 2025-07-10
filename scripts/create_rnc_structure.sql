-- Drop existing tables if they exist
DROP TABLE IF EXISTS rnc_article_relationships;
DROP TABLE IF EXISTS rnc_article_references;
DROP TABLE IF EXISTS rnc_articles;

-- Create main articles table
CREATE TABLE rnc_articles (
    id BIGSERIAL PRIMARY KEY,
    title_number INTEGER,
    chapter_number INTEGER,
    article_number VARCHAR(10),
    title_name TEXT,          -- Full title name (e.g., "Titre I - Des règles générales")
    chapter_name TEXT,        -- Full chapter name
    section_number VARCHAR(10), -- For sections within articles
    section_title TEXT,       -- Title of the section
    content TEXT,
    pdf_path TEXT,
    parent_article_id BIGINT REFERENCES rnc_articles(id), -- For article relationships
    order_in_chapter INTEGER,
    order_in_title INTEGER,
    is_section BOOLEAN DEFAULT FALSE,
    is_chapter BOOLEAN DEFAULT FALSE,
    is_title BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_number)
);

-- Create article relationships table
CREATE TABLE rnc_article_relationships (
    id BIGSERIAL PRIMARY KEY,
    parent_article_id BIGINT REFERENCES rnc_articles(id),
    child_article_id BIGINT REFERENCES rnc_articles(id),
    relationship_type TEXT CHECK (relationship_type IN (
        'references',
        'follows',
        'is_part_of',
        'explains',
        'amends',
        'replaces'
    )),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_article_id, child_article_id, relationship_type)
);

-- Create article references table
CREATE TABLE rnc_article_references (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES rnc_articles(id),
    referenced_article_id BIGINT REFERENCES rnc_articles(id),
    reference_text TEXT, -- The actual reference text in the article
    reference_type TEXT CHECK (reference_type IN (
        'article',
        'section',
        'chapter',
        'title',
        'external'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, referenced_article_id, reference_text)
);

-- Create code laws table
CREATE TABLE code_laws (
    id BIGSERIAL PRIMARY KEY,
    law_number TEXT UNIQUE,
    law_title TEXT,
    law_text TEXT,
    law_date DATE,
    law_category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create article-law relationships table
CREATE TABLE article_law_relationships (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES rnc_articles(id),
    law_id BIGINT REFERENCES code_laws(id),
    relationship_type TEXT CHECK (relationship_type IN (
        'implements',
        'references',
        'amends',
        'announces',
        'complements'
    )),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, law_id, relationship_type)
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_code_laws_updated_at
    BEFORE UPDATE ON code_laws
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create article metadata table
CREATE TABLE rnc_article_metadata (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES rnc_articles(id),
    key TEXT,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, key)
);

-- Create indexes for performance
CREATE INDEX idx_article_number ON rnc_articles(article_number);
CREATE INDEX idx_title_chapter ON rnc_articles(title_number, chapter_number);
CREATE INDEX idx_parent_article ON rnc_articles(parent_article_id);
CREATE INDEX idx_relationships ON rnc_article_relationships(parent_article_id, child_article_id);
CREATE INDEX idx_references ON rnc_article_references(article_id, referenced_article_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rnc_articles_updated_at
    BEFORE UPDATE ON rnc_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
