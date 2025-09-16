-- B30 PHASE 1 : Foundation Database Schema
-- Migration: Profils d'Expertise Modulaires
-- Date: 16 septembre 2025

-- ================================
-- 1. PROFILS D'EXPERTISE (Core)
-- ================================

CREATE TABLE agent_profils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    version VARCHAR(20) DEFAULT '1.0.0',

    -- Métadonnées métier
    domaine VARCHAR(50) NOT NULL, -- RH, Finance, Marketing, Tech...
    secteurs_cibles TEXT[] DEFAULT '{}', -- Manufacturing, Retail...
    niveau_complexite VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced
    tags TEXT[] DEFAULT '{}',

    -- Expertise principale
    description_courte TEXT NOT NULL,
    description_complete TEXT,
    competences_cles JSONB NOT NULL DEFAULT '[]',
    methodologie TEXT,
    outils_maitrises JSONB DEFAULT '[]',

    -- Exemples et cas d'usage
    exemples_taches JSONB NOT NULL DEFAULT '[]',
    cas_usage JSONB DEFAULT '[]',
    limites_explicites JSONB DEFAULT '[]',

    -- Configuration technique (Identity Core)
    identity_prompt TEXT NOT NULL,
    mission_prompt TEXT,
    personality_prompt TEXT,
    parametres_base JSONB DEFAULT '{}', -- temperature, max_tokens, etc.

    -- Marketplace (suppression prix/licence selon feedback)
    statut VARCHAR(20) DEFAULT 'draft', -- draft, review, published, deprecated
    visibilite VARCHAR(20) DEFAULT 'private', -- private, internal, public

    -- Métriques d'utilisation
    nb_utilisations INTEGER DEFAULT 0,
    note_moyenne DECIMAL(3,2),
    nb_evaluations INTEGER DEFAULT 0,

    -- Gestion versions
    profil_parent_id UUID REFERENCES agent_profils(id),
    est_version_principale BOOLEAN DEFAULT true,

    -- Audit
    cree_par UUID NOT NULL, -- REFERENCES users(id) when auth implemented
    cree_le TIMESTAMPTZ DEFAULT NOW(),
    modifie_par UUID,
    modifie_le TIMESTAMPTZ DEFAULT NOW(),
    supprime_le TIMESTAMPTZ,

    -- Contraintes
    CONSTRAINT chk_agent_profils_nom_length CHECK (char_length(nom) >= 5 AND char_length(nom) <= 255),
    CONSTRAINT chk_agent_profils_description_length CHECK (char_length(description_courte) >= 20),
    CONSTRAINT chk_agent_profils_domaine CHECK (domaine IN ('RH', 'Finance', 'Marketing', 'Tech', 'Legal', 'Operations', 'Strategy')),
    CONSTRAINT chk_agent_profils_niveau CHECK (niveau_complexite IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT chk_agent_profils_statut CHECK (statut IN ('draft', 'review', 'published', 'deprecated')),
    CONSTRAINT chk_agent_profils_visibilite CHECK (visibilite IN ('private', 'internal', 'public')),
    CONSTRAINT chk_agent_profils_note CHECK (note_moyenne IS NULL OR (note_moyenne >= 0 AND note_moyenne <= 5))
);

-- ================================
-- 2. SECTIONS MODULAIRES
-- ================================

CREATE TABLE profil_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,

    -- Identification section
    nom VARCHAR(200) NOT NULL,
    type_section VARCHAR(50) NOT NULL, -- expertise, scope, governance, workflow, outputs
    category VARCHAR(50), -- Pour sous-catégorisation (ex: responsibilities, restrictions)
    ordre INTEGER DEFAULT 0,

    -- Configuration déclenchement
    trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
    trigger_weight DECIMAL(3,2) DEFAULT 0.5, -- Poids pour algorithme sélection

    -- Contenu de la section
    prompt_template TEXT NOT NULL,
    exemple_utilisation TEXT,

    -- Dépendances et exclusions
    dependencies UUID[] DEFAULT '{}', -- IDs autres sections requises
    exclusions UUID[] DEFAULT '{}', -- IDs sections incompatibles

    -- Métadonnées
    description TEXT,
    est_obligatoire BOOLEAN DEFAULT false, -- Toujours inclure
    est_active BOOLEAN DEFAULT true,

    -- Audit
    cree_par UUID NOT NULL,
    cree_le TIMESTAMPTZ DEFAULT NOW(),
    modifie_par UUID,
    modifie_le TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    CONSTRAINT chk_profil_sections_type CHECK (type_section IN ('expertise', 'scope', 'governance', 'workflow', 'outputs')),
    CONSTRAINT chk_profil_sections_weight CHECK (trigger_weight >= 0 AND trigger_weight <= 1),
    CONSTRAINT chk_profil_sections_prompt_length CHECK (char_length(prompt_template) >= 20)
);

-- ================================
-- 3. HISTORIQUE & VERSIONING
-- ================================

CREATE TABLE profil_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,
    version_number VARCHAR(20) NOT NULL,

    -- Snapshot complet du profil
    profil_snapshot JSONB NOT NULL,
    sections_snapshot JSONB NOT NULL,

    -- Métadonnées de version
    description_changements TEXT,
    type_changement VARCHAR(50), -- major, minor, patch
    breaking_changes BOOLEAN DEFAULT false,

    -- Audit
    cree_par UUID NOT NULL,
    cree_le TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    UNIQUE(profil_id, version_number)
);

-- ================================
-- 4. ÉVALUATIONS & FEEDBACK
-- ================================

CREATE TABLE profil_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,

    -- Évaluation
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,

    -- Contexte d'utilisation
    contexte_utilisation TEXT,
    domaine_usage VARCHAR(50),

    -- Métadonnées
    evalue_par UUID NOT NULL,
    evalue_le TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    UNIQUE(profil_id, evalue_par) -- Un utilisateur = une évaluation par profil
);

-- ================================
-- 5. TAGS & TAXONOMIE
-- ================================

CREATE TABLE profil_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    couleur VARCHAR(7), -- Couleur hex pour UI
    usage_count INTEGER DEFAULT 0,
    cree_le TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profil_tag_associations (
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES profil_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (profil_id, tag_id)
);

-- ================================
-- 6. MÉTRIQUES & ANALYTICS
-- ================================

CREATE TABLE profil_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,

    -- Métriques période
    date_periode DATE NOT NULL,
    vues_total INTEGER DEFAULT 0,
    utilisations_total INTEGER DEFAULT 0,
    evaluations_total INTEGER DEFAULT 0,
    note_moyenne_periode DECIMAL(3,2),

    -- Détail usage
    domaines_usage JSONB DEFAULT '{}', -- { "Finance": 12, "RH": 8 }
    secteurs_usage JSONB DEFAULT '{}',
    keywords_triggeres JSONB DEFAULT '{}', -- Quels mots-clés ont déclenché ce profil

    -- Métadonnées
    cree_le TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    UNIQUE(profil_id, date_periode)
);

-- ================================
-- 7. INDEXES POUR PERFORMANCE
-- ================================

-- Indexes marketplace
CREATE INDEX idx_agent_profils_domaine ON agent_profils(domaine, statut)
    WHERE supprime_le IS NULL;
CREATE INDEX idx_agent_profils_secteur ON agent_profils USING GIN(secteurs_cibles)
    WHERE statut = 'published';
CREATE INDEX idx_agent_profils_tags ON agent_profils USING GIN(tags);
CREATE INDEX idx_agent_profils_slug ON agent_profils(slug)
    WHERE supprime_le IS NULL;

-- Index recherche textuelle
CREATE INDEX idx_agent_profils_search ON agent_profils
    USING GIN(to_tsvector('french', nom || ' ' || description_courte))
    WHERE supprime_le IS NULL;

-- Index tri par popularité
CREATE INDEX idx_agent_profils_popularite ON agent_profils(nb_utilisations DESC, note_moyenne DESC NULLS LAST)
    WHERE statut = 'published' AND supprime_le IS NULL;

-- Indexes sections
CREATE INDEX idx_profil_sections_profil ON profil_sections(profil_id)
    WHERE est_active = true;
CREATE INDEX idx_profil_sections_type ON profil_sections(type_section, est_active);
CREATE INDEX idx_profil_sections_keywords ON profil_sections USING GIN(trigger_keywords)
    WHERE est_active = true;

-- Indexes analytics
CREATE INDEX idx_profil_analytics_date ON profil_analytics(profil_id, date_periode DESC);
CREATE INDEX idx_profil_evaluations_note ON profil_evaluations(profil_id, note);

-- ================================
-- 8. TRIGGERS AUTOMATIQUES
-- ================================

-- Trigger pour mise à jour automatique note moyenne
CREATE OR REPLACE FUNCTION update_profil_note_moyenne()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agent_profils
    SET
        note_moyenne = (
            SELECT AVG(note::DECIMAL)
            FROM profil_evaluations
            WHERE profil_id = COALESCE(NEW.profil_id, OLD.profil_id)
        ),
        nb_evaluations = (
            SELECT COUNT(*)
            FROM profil_evaluations
            WHERE profil_id = COALESCE(NEW.profil_id, OLD.profil_id)
        ),
        modifie_le = NOW()
    WHERE id = COALESCE(NEW.profil_id, OLD.profil_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profil_note_moyenne
    AFTER INSERT OR UPDATE OR DELETE ON profil_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_profil_note_moyenne();

-- Trigger pour génération automatique slug
CREATE OR REPLACE FUNCTION generate_profil_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Générer slug de base depuis le nom
    base_slug := lower(regexp_replace(NEW.nom, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    -- Limite longueur slug
    base_slug := left(base_slug, 80);

    final_slug := base_slug;

    -- Vérifier unicité et incrémenter si nécessaire
    WHILE EXISTS (SELECT 1 FROM agent_profils WHERE slug = final_slug AND id != NEW.id) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    NEW.slug := final_slug;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_profil_slug
    BEFORE INSERT OR UPDATE OF nom ON agent_profils
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION generate_profil_slug();

-- ================================
-- 9. DONNÉES DE TEST (Optional)
-- ================================

-- Insertion tags par défaut
INSERT INTO profil_tags (nom, slug, description, couleur) VALUES
('Expert', 'expert', 'Profil niveau expert', '#FF6B35'),
('Débutant', 'debutant', 'Profil accessible aux débutants', '#10B981'),
('RH', 'rh', 'Ressources Humaines', '#8B5CF6'),
('Finance', 'finance', 'Finance et Comptabilité', '#F59E0B'),
('Marketing', 'marketing', 'Marketing et Communication', '#EF4444'),
('Tech', 'tech', 'Technique et Développement', '#3B82F6'),
('Audit', 'audit', 'Audit et Contrôle Qualité', '#6B7280'),
('Strategy', 'strategy', 'Stratégie et Conseil', '#EC4899');

-- Commentaire de fin de migration
-- Cette migration crée la foundation complète pour B30
-- Prochaine étape : Implémentation APIs CRUD