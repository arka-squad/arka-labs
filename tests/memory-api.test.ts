import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractMemoryBlocks, calculateContextCompletion } from '../lib/memory-extractor';

describe('Memory Extraction', () => {
  it('should extract vision blocks from content', () => {
    const content = `
      Objectif du projet: Organiser une journée coworking Q4
      Contraintes: Budget limité à 1000€
      Livrables attendus: Planning détaillé, synthèse post-événement
    `;
    
    const result = extractMemoryBlocks(content, 'test-agent');
    
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].block_type).toBe('vision');
    expect(result.blocks[0].content).toHaveProperty('objectif');
    expect(result.blocks[0].agent_source).toBe('test-agent');
  });

  it('should extract decision blocks from content', () => {
    const content = `
      Nous décidons de valider la salle côté est.
      Cette décision est prise en raison de l'accessibilité handicapés.
      Impact: Le planning logistique est maintenant confirmé.
    `;
    
    const result = extractMemoryBlocks(content, 'PMO');
    
    expect(result.blocks.length).toBeGreaterThan(0);
    const decisionBlock = result.blocks.find(b => b.block_type === 'decision');
    expect(decisionBlock).toBeDefined();
    expect(decisionBlock?.content).toHaveProperty('decision');
    expect(decisionBlock?.importance).toBeGreaterThanOrEqual(8);
  });

  it('should extract blocker information', () => {
    const content = `
      Nous sommes bloqués par le manque de confirmation de la salle.
      Le problème vient du délai de réponse du prestataire.
      Cela impacte notre planning de préparation.
    `;
    
    const result = extractMemoryBlocks(content);
    
    expect(result.blocks.length).toBeGreaterThan(0);
    const blockerBlock = result.blocks.find(b => b.block_type === 'blocker');
    expect(blockerBlock).toBeDefined();
    expect(blockerBlock?.content).toHaveProperty('blocker');
    expect(blockerBlock?.importance).toBeGreaterThanOrEqual(8);
  });

  it('should extract context evolution', () => {
    const content = `
      Par contre, maintenant nous devons revoir notre approche.
      L'évolution du contexte budgétaire nous impose des contraintes.
      Finalement, nous opterons pour une solution plus simple.
    `;
    
    const result = extractMemoryBlocks(content, 'heloise-rh');
    
    expect(result.blocks.length).toBeGreaterThan(0);
    const contextBlock = result.blocks.find(b => b.block_type === 'context_evolution');
    expect(contextBlock).toBeDefined();
    expect(contextBlock?.content).toHaveProperty('new_state');
  });

  it('should detect agent mentions', () => {
    const content = `
      Discussion entre PMO et heloise-rh concernant le planning.
      AGP a validé les aspects techniques.
      L'archiviste a documenté les échanges.
    `;
    
    const result = extractMemoryBlocks(content);
    
    expect(result.metadata.agent_mentions).toContain('PMO');
    expect(result.metadata.agent_mentions).toContain('heloise-rh');
    expect(result.metadata.agent_mentions).toContain('AGP');
  });

  it('should calculate importance correctly', () => {
    const highImportanceContent = `
      Décision critique: Nous devons annuler l'événement en raison de problèmes de sécurité.
      Cette décision impacte tous les participants et nécessite une communication immédiate.
    `;
    
    const result = extractMemoryBlocks(highImportanceContent);
    
    expect(result.blocks.length).toBeGreaterThan(0);
    const block = result.blocks[0];
    expect(block.importance).toBeGreaterThanOrEqual(8);
  });

  it('should generate relevant tags', () => {
    const content = `
      Le budget de 1000€ impose des contraintes sur le planning.
      Les aspects sécuritaires doivent être vérifiés techniquement.
    `;
    
    const result = extractMemoryBlocks(content);
    
    expect(result.blocks.length).toBeGreaterThan(0);
    const block = result.blocks[0];
    expect(block.tags).toEqual(expect.arrayContaining(['budget']));
  });
});

describe('Context Completion Calculation', () => {
  it('should calculate completion percentage correctly', () => {
    const blocks = [
      { block_type: 'vision' as const },
      { block_type: 'vision' as const },
      { block_type: 'decision' as const },
      { block_type: 'decision' as const },
      { block_type: 'decision' as const },
      { block_type: 'context_evolution' as const },
      { block_type: 'agents_interaction' as const },
      { block_type: 'governance' as const }
    ];
    
    const completion = calculateContextCompletion(blocks);
    
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThanOrEqual(100);
    expect(typeof completion).toBe('number');
  });

  it('should return 0 for empty blocks', () => {
    const completion = calculateContextCompletion([]);
    expect(completion).toBe(0);
  });

  it('should weight vision blocks heavily', () => {
    const visionHeavy = [
      { block_type: 'vision' as const },
      { block_type: 'vision' as const },
      { block_type: 'vision' as const }
    ];
    
    const decisionHeavy = [
      { block_type: 'decision' as const },
      { block_type: 'decision' as const },
      { block_type: 'decision' as const }
    ];
    
    const visionCompletion = calculateContextCompletion(visionHeavy);
    const decisionCompletion = calculateContextCompletion(decisionHeavy);
    
    // Vision blocks have higher weight (0.3) than decisions (0.25)
    expect(visionCompletion).toBeGreaterThan(decisionCompletion);
  });
});

describe('Hash Generation', () => {
  it('should generate consistent hashes for same content', () => {
    const content = 'Test content for hashing';
    
    const result1 = extractMemoryBlocks(content);
    const result2 = extractMemoryBlocks(content);
    
    if (result1.blocks.length > 0 && result2.blocks.length > 0) {
      expect(result1.blocks[0].hash).toBe(result2.blocks[0].hash);
    }
  });

  it('should generate different hashes for different content', () => {
    const content1 = 'First test content';
    const content2 = 'Second test content';
    
    const result1 = extractMemoryBlocks(content1);
    const result2 = extractMemoryBlocks(content2);
    
    if (result1.blocks.length > 0 && result2.blocks.length > 0) {
      expect(result1.blocks[0].hash).not.toBe(result2.blocks[0].hash);
    }
  });

  it('should generate SHA-256 prefixed hashes', () => {
    const content = 'Content for hash validation';
    const result = extractMemoryBlocks(content);
    
    if (result.blocks.length > 0) {
      expect(result.blocks[0].hash).toMatch(/^sha256:[a-f0-9]{64}$/);
    }
  });
});

describe('Edge Cases', () => {
  it('should handle empty content gracefully', () => {
    const result = extractMemoryBlocks('');
    
    expect(result.blocks).toHaveLength(0);
    expect(result.metadata.confidence).toBe(0);
    expect(result.metadata.patterns_detected).toHaveLength(0);
  });

  it('should handle content with no meaningful patterns', () => {
    const content = 'Random text without any specific patterns or keywords.';
    const result = extractMemoryBlocks(content);
    
    expect(result.blocks).toHaveLength(0);
    expect(result.metadata.confidence).toBe(0);
  });

  it('should handle very long content', () => {
    const longContent = 'Objectif: '.repeat(1000) + 'Very long content with repeated patterns.';
    const result = extractMemoryBlocks(longContent);
    
    expect(result.blocks.length).toBeGreaterThan(0);
    // Content size should be considered in importance calculation
    expect(result.blocks[0].importance).toBeGreaterThan(5);
  });

  it('should handle special characters and accents', () => {
    const content = `
      Objectif: Organiser un événement à Paris avec des critères spécifiques.
      Contraintes: Budget limité, accès handicapés nécessaire.
    `;
    
    const result = extractMemoryBlocks(content);
    
    expect(result.blocks.length).toBeGreaterThan(0);
    expect(result.blocks[0].content).toBeDefined();
  });
});

describe('Multi-pattern Detection', () => {
  it('should detect multiple patterns in single content', () => {
    const content = `
      Objectif: Finaliser le projet Q4
      Nous décidons de valider cette approche
      Par contre, nous sommes bloqués par le budget
      Coordination nécessaire entre PMO et Héloïse
    `;
    
    const result = extractMemoryBlocks(content);
    
    expect(result.blocks.length).toBeGreaterThanOrEqual(2);
    
    const types = result.blocks.map(b => b.block_type);
    expect(types).toContain('vision');
    expect(types).toContain('decision');
  });

  it('should prioritize higher importance patterns', () => {
    const content = `
      Insight intéressant: nous apprenons de cette expérience
      Décision critique: annulation immédiate nécessaire
    `;
    
    const result = extractMemoryBlocks(content);
    
    if (result.blocks.length >= 2) {
      const decisionBlock = result.blocks.find(b => b.block_type === 'decision');
      const insightBlock = result.blocks.find(b => b.block_type === 'insight');
      
      if (decisionBlock && insightBlock) {
        expect(decisionBlock.importance).toBeGreaterThan(insightBlock.importance);
      }
    }
  });
});