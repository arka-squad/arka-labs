-- B30 Phase 3 - APIs Composition & Agents
-- Tables pour compositions multi-profils et agents composés

-- ================================
-- COMPOSITIONS MULTI-PROFILS
-- ================================

-- Table principale des compositions
CREATE TABLE profil_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,

    -- Configuration composition
    domaines_combines TEXT[] NOT NULL DEFAULT '{}',
    secteurs_cibles TEXT[] NOT NULL DEFAULT '{}',
    strategie_fusion VARCHAR(20) NOT NULL CHECK (strategie_fusion IN ('weighted_blend', 'sequential', 'conditional')),
    parametres_fusion JSONB NOT NULL DEFAULT '{}',

    -- Use cases et métriques
    use_cases TEXT[] NOT NULL DEFAULT '{}',
    coherence_score DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (coherence_score >= 0 AND coherence_score <= 1),
    complexity_score DECIMAL(3,2) NOT NULL DEFAULT 0.0 CHECK (complexity_score >= 0 AND complexity_score <= 1),

    -- Statistiques usage
    nb_agents_crees INTEGER NOT NULL DEFAULT 0,
    note_moyenne DECIMAL(3,2) DEFAULT NULL CHECK (note_moyenne IS NULL OR (note_moyenne >= 0 AND note_moyenne <= 5)),
    nb_evaluations INTEGER NOT NULL DEFAULT 0,

    -- Métadonnées
    statut VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (statut IN ('draft', 'published', 'deprecated')),
    visibilite VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibilite IN ('private', 'internal', 'public')),
    version VARCHAR(10) NOT NULL DEFAULT '1.0',

    -- Audit
    cree_par UUID NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_par UUID,
    modifie_le TIMESTAMP,
    supprime_par UUID,
    supprime_le TIMESTAMP,

    CONSTRAINT valid_scores CHECK (coherence_score <= 1 AND complexity_score <= 1)
);

-- Profils inclus dans une composition avec leur configuration
CREATE TABLE composition_profils (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    composition_id UUID NOT NULL REFERENCES profil_compositions(id) ON DELETE CASCADE,
    profil_id UUID NOT NULL REFERENCES agent_profils(id) ON DELETE CASCADE,

    -- Configuration dans la composition
    ponderation DECIMAL(4,3) NOT NULL CHECK (ponderation > 0 AND ponderation <= 1),
    role TEXT,

    -- Sélection sections (optionnel)
    sections_incluses TEXT[] NOT NULL DEFAULT '{}',
    sections_exclues TEXT[] NOT NULL DEFAULT '{}',

    -- Conditions d'activation (pour stratégie conditional)
    conditions_activation JSONB NOT NULL DEFAULT '{}',

    -- Adaptations locales du profil
    adaptations_locales JSONB NOT NULL DEFAULT '[]',

    -- Métadonnées
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(composition_id, profil_id)
);

-- Évaluations des compositions
CREATE TABLE composition_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    composition_id UUID NOT NULL REFERENCES profil_compositions(id) ON DELETE CASCADE,
    evaluateur_id UUID NOT NULL,

    -- Évaluation
    note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,

    -- Critères détaillés
    coherence_note INTEGER CHECK (coherence_note >= 1 AND coherence_note <= 5),
    facilite_usage_note INTEGER CHECK (facilite_usage_note >= 1 AND facilite_usage <= 5),
    performance_note INTEGER CHECK (performance_note >= 1 AND performance_note <= 5),

    -- Métadonnées
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_le TIMESTAMP,

    UNIQUE(composition_id, evaluateur_id)
);

-- ================================
-- AGENTS COMPOSÉS
-- ================================

-- Table principale des agents composés
CREATE TABLE agents_composes (
    id VARCHAR(50) PRIMARY KEY, -- Format: agent_{timestamp}_{random}
    nom VARCHAR(200) NOT NULL,
    description TEXT,

    -- Intégration projet
    projet_id UUID NOT NULL, -- Référence vers table projets

    -- Source de l'agent
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('profil', 'composition', 'adaptation')),
    source_id UUID NOT NULL, -- ID du profil, composition ou adaptation

    -- Configuration finale générée
    configuration_finale JSONB NOT NULL,
    contexte_adaptation JSONB NOT NULL DEFAULT '{}',
    parametres_finaux JSONB NOT NULL DEFAULT '{}',

    -- État opérationnel
    statut VARCHAR(20) NOT NULL DEFAULT 'configuring' CHECK (statut IN ('configuring', 'active', 'paused', 'archived')),
    derniere_activation TIMESTAMP,

    -- Statistiques temps réel
    nb_interactions_total INTEGER NOT NULL DEFAULT 0,
    nb_interactions_24h INTEGER NOT NULL DEFAULT 0,
    nb_interactions_7j INTEGER NOT NULL DEFAULT 0,
    tokens_utilises_total BIGINT NOT NULL DEFAULT 0,
    taux_succes DECIMAL(4,3) DEFAULT 0.0 CHECK (taux_succes >= 0 AND taux_succes <= 1),

    -- Satisfaction et performance
    score_satisfaction DECIMAL(3,2) DEFAULT NULL CHECK (score_satisfaction IS NULL OR (score_satisfaction >= 0 AND score_satisfaction <= 5)),
    temps_reponse_moyen_ms INTEGER DEFAULT NULL,

    -- Évolution et maintenance
    version_profil_source VARCHAR(10),
    maj_disponible BOOLEAN NOT NULL DEFAULT FALSE,
    derniere_maj TIMESTAMP,
    maj_automatiques_activees BOOLEAN NOT NULL DEFAULT TRUE,
    mode_debug BOOLEAN NOT NULL DEFAULT FALSE,

    -- Audit
    cree_par UUID NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_par UUID,
    modifie_le TIMESTAMP,
    supprime_par UUID,
    supprime_le TIMESTAMP
);

-- Interactions avec les agents (pour historique et analytics)
CREATE TABLE agent_interactions (
    id VARCHAR(50) PRIMARY KEY, -- Format: int_{timestamp}_{random}
    agent_id VARCHAR(50) NOT NULL REFERENCES agents_composes(id) ON DELETE CASCADE,

    -- Contenu interaction
    message TEXT NOT NULL,
    reponse TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,

    -- Métriques performance
    duree_ms INTEGER NOT NULL,
    tokens_utilises INTEGER NOT NULL DEFAULT 0,
    cout_estime_cents INTEGER DEFAULT 0,

    -- Contexte conversationnel
    thread_id VARCHAR(50), -- Pour grouper les conversations
    contexte JSONB NOT NULL DEFAULT '{}',

    -- Provider et configuration utilisée
    provider_utilise VARCHAR(20),
    temperature_utilisee DECIMAL(3,2),
    sections_activees TEXT[] DEFAULT '{}',

    -- Feedback utilisateur
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    commentaire_feedback TEXT,
    feedback_par UUID,
    feedback_le TIMESTAMP,

    -- Métadonnées
    utilisateur_id UUID,
    canal VARCHAR(20) DEFAULT 'api' CHECK (canal IN ('web', 'api', 'teams', 'slack')),
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index pour recherche par thread
    INDEX idx_interactions_thread (thread_id, cree_le),
    INDEX idx_interactions_agent_recent (agent_id, cree_le DESC),
    INDEX idx_interactions_feedback (rating, feedback_le) WHERE rating IS NOT NULL
);

-- Recommandations d'amélioration pour les agents
CREATE TABLE agent_recommandations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) NOT NULL REFERENCES agents_composes(id) ON DELETE CASCADE,

    -- Classification recommandation
    type_recommandation VARCHAR(20) NOT NULL CHECK (type_recommandation IN ('optimisation', 'configuration', 'maintenance', 'usage')),
    priorite VARCHAR(10) NOT NULL CHECK (priorite IN ('low', 'medium', 'high')),

    -- Contenu recommandation
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    impact_estime VARCHAR(100),
    effort_requis VARCHAR(20) CHECK (effort_requis IN ('minimal', 'moderate', 'significant')),

    -- Action suggérée (optionnel)
    action_suggeree JSONB,
    auto_applicable BOOLEAN NOT NULL DEFAULT FALSE,

    -- État de la recommandation
    statut VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'applied', 'dismissed', 'expired')),
    appliquee_le TIMESTAMP,
    appliquee_par UUID,

    -- Scoring et validité
    score_pertinence DECIMAL(3,2) NOT NULL DEFAULT 0.5 CHECK (score_pertinence >= 0 AND score_pertinence <= 1),
    valide_jusqu TIMESTAMP, -- Expiration de la recommandation

    -- Métadonnées
    generee_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generee_par VARCHAR(50) DEFAULT 'system', -- 'system' ou user_id

    INDEX idx_recommandations_agent_actives (agent_id, statut, priorite) WHERE statut = 'active'
);

-- ================================
-- TEMPLATES ET ADAPTATIONS SAUVEGARDÉES
-- ================================

-- Adaptations contextuelles sauvegardées (pour réutilisation)
CREATE TABLE adaptations_sauvegardees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL,
    description TEXT,

    -- Configuration d'adaptation
    secteur_activite VARCHAR(100),
    taille_entreprise VARCHAR(20) CHECK (taille_entreprise IN ('startup', 'pme', 'eti', 'ge')),
    processus_specifiques JSONB NOT NULL DEFAULT '{}',
    contraintes_reglementaires TEXT[] DEFAULT '{}',
    vocabulaire_metier JSONB NOT NULL DEFAULT '{}',
    tone_communication VARCHAR(20) CHECK (tone_communication IN ('professionnel', 'decontracte', 'expert', 'pedagogique')),
    niveau_detail VARCHAR(20) CHECK (niveau_detail IN ('synthetique', 'standard', 'detaille')),

    -- Paramètres techniques
    parametres_override JSONB NOT NULL DEFAULT '{}',

    -- Usage et métriques
    nb_utilisations INTEGER NOT NULL DEFAULT 0,
    nb_agents_crees INTEGER NOT NULL DEFAULT 0,
    score_efficacite DECIMAL(3,2) DEFAULT NULL,

    -- Visibilité
    visibilite VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibilite IN ('private', 'team', 'organization', 'public')),

    -- Audit
    cree_par UUID NOT NULL,
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_par UUID,
    modifie_le TIMESTAMP,
    supprime_par UUID,
    supprime_le TIMESTAMP
);

-- Templates système prédéfinis (par Arka Labs)
CREATE TABLE templates_systeme (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,

    -- Catégorisation
    categorie VARCHAR(50) NOT NULL, -- ex: "audit_securite", "formation_equipe"
    domaine VARCHAR(50) NOT NULL,
    secteurs_applicables TEXT[] DEFAULT '{}',
    niveau_maturite VARCHAR(20) NOT NULL CHECK (niveau_maturite IN ('beginner', 'intermediate', 'advanced')),

    -- Configuration template
    profils_recommandes UUID[] NOT NULL, -- IDs des profils à utiliser
    composition_type VARCHAR(20) CHECK (composition_type IN ('single', 'weighted', 'sequential', 'conditional')),
    parametres_defaut JSONB NOT NULL DEFAULT '{}',

    -- Contexte d'adaptation standard
    adaptation_template JSONB NOT NULL DEFAULT '{}',

    -- Exemples et guidance
    exemples_usage TEXT[] DEFAULT '{}',
    guide_implementation TEXT,

    -- Métriques et validation Arka
    validee_par_arka BOOLEAN NOT NULL DEFAULT FALSE,
    score_qualite DECIMAL(3,2) DEFAULT NULL,
    nb_deployements INTEGER NOT NULL DEFAULT 0,
    taux_reussite DECIMAL(3,2) DEFAULT NULL,

    -- Maintenance
    version VARCHAR(10) NOT NULL DEFAULT '1.0',
    statut VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (statut IN ('active', 'deprecated', 'archived')),
    derniere_validation TIMESTAMP,

    -- Audit Arka
    cree_par VARCHAR(50) NOT NULL DEFAULT 'arka_system',
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modifie_par VARCHAR(50),
    modifie_le TIMESTAMP
);

-- ================================
-- ANALYTICS ET MÉTRIQUES AVANCÉES
-- ================================

-- Métriques de performance des agents par période
CREATE TABLE agent_metriques_periode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) NOT NULL REFERENCES agents_composes(id) ON DELETE CASCADE,

    -- Période de calcul
    periode_type VARCHAR(10) NOT NULL CHECK (periode_type IN ('hour', 'day', 'week', 'month')),
    periode_debut TIMESTAMP NOT NULL,
    periode_fin TIMESTAMP NOT NULL,

    -- Métriques d'activité
    nb_interactions INTEGER NOT NULL DEFAULT 0,
    nb_utilisateurs_uniques INTEGER NOT NULL DEFAULT 0,
    duree_totale_ms BIGINT NOT NULL DEFAULT 0,
    duree_moyenne_ms INTEGER NOT NULL DEFAULT 0,

    -- Métriques qualité
    taux_succes DECIMAL(4,3) NOT NULL DEFAULT 0.0,
    satisfaction_moyenne DECIMAL(3,2),
    nb_feedbacks INTEGER NOT NULL DEFAULT 0,
    nb_escalations INTEGER NOT NULL DEFAULT 0,

    -- Métriques techniques
    tokens_utilises BIGINT NOT NULL DEFAULT 0,
    cout_total_cents INTEGER NOT NULL DEFAULT 0,
    cache_hit_rate DECIMAL(4,3) DEFAULT 0.0,

    -- Répartition par canal
    repartition_canaux JSONB NOT NULL DEFAULT '{}',

    -- Calculé le
    calcule_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(agent_id, periode_type, periode_debut)
);

-- Événements système pour audit et troubleshooting
CREATE TABLE agent_evenements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id VARCHAR(50) REFERENCES agents_composes(id) ON DELETE CASCADE,

    -- Classification événement
    type_evenement VARCHAR(30) NOT NULL, -- ex: 'config_change', 'performance_alert', 'error'
    niveau VARCHAR(10) NOT NULL CHECK (niveau IN ('info', 'warning', 'error', 'critical')),

    -- Contenu événement
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    donnees_evenement JSONB DEFAULT '{}',

    -- Contexte
    source VARCHAR(50) NOT NULL DEFAULT 'system', -- 'system', 'user', 'api'
    utilisateur_id UUID,
    interaction_id VARCHAR(50), -- Lien vers interaction si applicable

    -- Traitement
    traite BOOLEAN NOT NULL DEFAULT FALSE,
    traite_par UUID,
    traite_le TIMESTAMP,

    -- Métadonnées
    cree_le TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_evenements_agent_niveau (agent_id, niveau, cree_le DESC),
    INDEX idx_evenements_type_recent (type_evenement, cree_le DESC) WHERE cree_le > CURRENT_TIMESTAMP - INTERVAL '7 days',
    INDEX idx_evenements_non_traites (niveau, traite, cree_le) WHERE traite = FALSE
);

-- ================================
-- INDEXES DE PERFORMANCE
-- ================================

-- Profil_compositions
CREATE INDEX idx_compositions_statut_domaine ON profil_compositions(statut, domaines_combines) WHERE supprime_le IS NULL;
CREATE INDEX idx_compositions_popularite ON profil_compositions(nb_agents_crees DESC, note_moyenne DESC) WHERE statut = 'published';
CREATE INDEX idx_compositions_recherche ON profil_compositions USING GIN(to_tsvector('french', nom || ' ' || description)) WHERE statut = 'published';

-- Composition_profils
CREATE INDEX idx_composition_profils_ponderation ON composition_profils(composition_id, ponderation DESC);

-- Agents_composes
CREATE INDEX idx_agents_projet_statut ON agents_composes(projet_id, statut) WHERE supprime_le IS NULL;
CREATE INDEX idx_agents_source ON agents_composes(source_type, source_id);
CREATE INDEX idx_agents_activite ON agents_composes(derniere_activation DESC) WHERE statut = 'active';
CREATE INDEX idx_agents_performance ON agents_composes(taux_succes DESC, score_satisfaction DESC) WHERE statut = 'active';

-- Agent_interactions
CREATE INDEX idx_interactions_agent_periode ON agent_interactions(agent_id, cree_le DESC);
CREATE INDEX idx_interactions_performance ON agent_interactions(success, duree_ms) WHERE cree_le > CURRENT_TIMESTAMP - INTERVAL '30 days';

-- Templates_systeme
CREATE INDEX idx_templates_categorie_domaine ON templates_systeme(categorie, domaine) WHERE statut = 'active';
CREATE INDEX idx_templates_qualite ON templates_systeme(score_qualite DESC, nb_deployements DESC) WHERE validee_par_arka = TRUE;

-- ================================
-- TRIGGERS AUTOMATIQUES
-- ================================

-- Trigger pour mettre à jour les statistiques de composition
CREATE OR REPLACE FUNCTION update_composition_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour du nombre d'agents créés
    UPDATE profil_compositions
    SET nb_agents_crees = (
        SELECT COUNT(*)
        FROM agents_composes
        WHERE source_type = 'composition'
        AND source_id = NEW.source_id
        AND supprime_le IS NULL
    )
    WHERE id = NEW.source_id AND NEW.source_type = 'composition';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_composition_stats
    AFTER INSERT ON agents_composes
    FOR EACH ROW
    WHEN (NEW.source_type = 'composition')
    EXECUTE FUNCTION update_composition_stats();

-- Trigger pour calculer la note moyenne des compositions
CREATE OR REPLACE FUNCTION update_composition_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profil_compositions
    SET
        note_moyenne = (
            SELECT AVG(note)
            FROM composition_evaluations
            WHERE composition_id = COALESCE(NEW.composition_id, OLD.composition_id)
        ),
        nb_evaluations = (
            SELECT COUNT(*)
            FROM composition_evaluations
            WHERE composition_id = COALESCE(NEW.composition_id, OLD.composition_id)
        )
    WHERE id = COALESCE(NEW.composition_id, OLD.composition_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_composition_rating
    AFTER INSERT OR UPDATE OR DELETE ON composition_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_composition_rating();

-- Trigger pour réinitialiser les compteurs 24h/7j des agents
CREATE OR REPLACE FUNCTION reset_agent_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Réinitialiser le compteur 24h si plus de 24h
    IF NEW.derniere_activation < CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN
        NEW.nb_interactions_24h = 0;
    END IF;

    -- Réinitialiser le compteur 7j si plus de 7 jours
    IF NEW.derniere_activation < CURRENT_TIMESTAMP - INTERVAL '7 days' THEN
        NEW.nb_interactions_7j = 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reset_agent_counters
    BEFORE UPDATE ON agents_composes
    FOR EACH ROW
    EXECUTE FUNCTION reset_agent_counters();

-- ================================
-- DONNÉES INITIALES
-- ================================

-- Template système exemple pour audit sécurité
INSERT INTO templates_systeme (
    nom, slug, description, categorie, domaine, secteurs_applicables,
    niveau_maturite, profils_recommandes, composition_type,
    adaptation_template, exemples_usage, guide_implementation,
    validee_par_arka, version
) VALUES (
    'Audit Sécurité API Complete',
    'audit-securite-api-complete',
    'Template complet pour auditer la sécurité d''une API avec analyse technique et recommandations business',
    'audit_securite',
    'Tech',
    ARRAY['FinTech', 'HealthTech', 'E-commerce'],
    'advanced',
    ARRAY[], -- À remplir avec les vrais IDs de profils
    'weighted',
    '{"secteur_activite": "FinTech", "taille_entreprise": "eti", "contraintes_reglementaires": ["PCI-DSS", "GDPR"], "tone_communication": "expert", "niveau_detail": "detaille"}',
    ARRAY[
        'Audit API de paiement pour fintech',
        'Évaluation sécurité API e-commerce',
        'Revue architecture microservices bancaire'
    ],
    'Ce template combine expertise sécurité technique et analyse de risque business. Idéal pour des audits complets nécessitant recommendations techniques et stratégiques.',
    TRUE,
    '1.0'
);

-- Événement système initial
INSERT INTO agent_evenements (
    type_evenement, niveau, titre, description, source
) VALUES (
    'system_init',
    'info',
    'Système B30 Phase 3 initialisé',
    'Migration des tables pour compositions multi-profils et agents composés terminée avec succès',
    'system'
);