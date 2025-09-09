/**
 * B22 Memory Extraction Logic
 * Intelligent pattern detection for structured memory blocks
 */

import crypto from 'crypto';

export interface MemoryBlock {
  id?: string;
  block_type: 'vision' | 'context_evolution' | 'agents_interaction' | 'decision' | 'blocker' | 'insight' | 'governance';
  content: Record<string, any>;
  agent_source?: string;
  importance: number;
  tags: string[];
  hash: string;
}

export interface ExtractionResult {
  blocks: MemoryBlock[];
  metadata: {
    confidence: number;
    patterns_detected: string[];
    agent_mentions: string[];
  };
}

/**
 * Pattern definitions for memory block detection
 */
const EXTRACTION_PATTERNS = {
  vision_detection: {
    triggers: ['objectif', 'livrable', 'contrainte', 'succès', 'mission', 'vision', 'but', 'finalité'],
    weight: 0.9,
    importance_base: 9
  },
  decision_detection: {
    triggers: ['décide', 'valide', 'rejette', 'approuve', 'tranche', 'opte pour', 'choisit'],
    weight: 0.8,
    importance_base: 8
  },
  blocker_detection: {
    triggers: ['bloqué', 'problème', 'impossible', 'manque', 'attente', 'obstacle', 'difficulté'],
    weight: 0.9,
    importance_base: 8
  },
  context_evolution: {
    triggers: ['par contre', 'maintenant', 'finalement', 'en fait', 'update', 'changement', 'évolution'],
    weight: 0.7,
    importance_base: 7
  },
  agents_interaction: {
    triggers: ['coordination', 'échange', 'discussion', 'réunion', 'point', 'sync'],
    weight: 0.6,
    importance_base: 6
  },
  governance: {
    triggers: ['gate', 'validation', 'approuvé', 'conforme', 'audit', 'contrôle', 'gouvernance'],
    weight: 0.8,
    importance_base: 9
  },
  insight: {
    triggers: ['insight', 'découverte', 'apprentissage', 'constat', 'observation', 'retour d\'expérience'],
    weight: 0.7,
    importance_base: 6
  }
};

/**
 * Extract structured memory blocks from text content
 */
export function extractMemoryBlocks(content: string, agent_source?: string): ExtractionResult {
  const blocks: MemoryBlock[] = [];
  const patterns_detected: string[] = [];
  const agent_mentions = extractAgentMentions(content);
  
  let overall_confidence = 0;
  let pattern_count = 0;

  // Analyze content for each pattern type
  for (const [pattern_type, config] of Object.entries(EXTRACTION_PATTERNS)) {
    const detection = detectPattern(content, config, pattern_type);
    
    if (detection.found) {
      const block = createMemoryBlock(
        detection.content,
        pattern_type.replace('_detection', '') as MemoryBlock['block_type'],
        agent_source,
        detection.importance,
        detection.tags
      );
      
      blocks.push(block);
      patterns_detected.push(pattern_type);
      overall_confidence += detection.confidence * config.weight;
      pattern_count++;
    }
  }

  // Normalize confidence
  const final_confidence = pattern_count > 0 ? overall_confidence / pattern_count : 0;

  return {
    blocks,
    metadata: {
      confidence: Math.round(final_confidence * 100) / 100,
      patterns_detected,
      agent_mentions
    }
  };
}

/**
 * Detect specific pattern in content
 */
function detectPattern(content: string, config: any, pattern_type: string) {
  const content_lower = content.toLowerCase();
  let trigger_count = 0;
  let found_triggers: string[] = [];
  
  // Count trigger word occurrences
  for (const trigger of config.triggers) {
    if (content_lower.includes(trigger)) {
      trigger_count++;
      found_triggers.push(trigger);
    }
  }

  if (trigger_count === 0) {
    return { found: false, confidence: 0, content: null, importance: 0, tags: [] };
  }

  // Extract structured content based on pattern type
  const structured_content = extractStructuredContent(content, pattern_type, found_triggers);
  const importance = calculateImportance(config.importance_base, trigger_count, content.length);
  const tags = generateTags(pattern_type, found_triggers, content);
  const confidence = Math.min(0.9, trigger_count * 0.3 + (structured_content ? 0.4 : 0.1));

  return {
    found: true,
    confidence,
    content: structured_content,
    importance,
    tags
  };
}

/**
 * Extract structured content based on pattern type
 */
function extractStructuredContent(content: string, pattern_type: string, triggers: string[]): Record<string, any> {
  const lines = content.split('\n').filter(line => line.trim());
  
  switch (pattern_type) {
    case 'vision_detection':
      return extractVisionContent(content, lines);
    
    case 'decision_detection':
      return extractDecisionContent(content, lines, triggers);
    
    case 'blocker_detection':
      return extractBlockerContent(content, lines);
    
    case 'context_evolution':
      return extractContextEvolutionContent(content, lines);
    
    case 'agents_interaction':
      return extractAgentsInteractionContent(content, lines);
    
    case 'governance':
      return extractGovernanceContent(content, lines);
    
    case 'insight':
      return extractInsightContent(content, lines);
    
    default:
      return { summary: content.slice(0, 200), full_content: content };
  }
}

/**
 * Extract vision-related content
 */
function extractVisionContent(content: string, lines: string[]): Record<string, any> {
  const objectives = extractListItems(content, ['objectif', 'but', 'goal']);
  const constraints = extractListItems(content, ['contrainte', 'limite', 'restriction']);
  const deliverables = extractListItems(content, ['livrable', 'deliverable', 'résultat']);
  const success_criteria = extractListItems(content, ['succès', 'critère', 'réussite']);

  return {
    objectif: objectives.length > 0 ? objectives.join('; ') : extractFirstSentence(content),
    contraintes: constraints,
    livrables: deliverables,
    criteres_succes: success_criteria,
    summary: content.slice(0, 150)
  };
}

/**
 * Extract decision-related content
 */
function extractDecisionContent(content: string, lines: string[], triggers: string[]): Record<string, any> {
  const decision_line = lines.find(line => 
    triggers.some(trigger => line.toLowerCase().includes(trigger))
  ) || lines[0];

  return {
    decision: decision_line.slice(0, 200),
    rationale: extractRationale(content),
    impact: extractImpacts(content),
    responsable: extractResponsible(content),
    summary: decision_line.slice(0, 100)
  };
}

/**
 * Extract blocker-related content
 */
function extractBlockerContent(content: string, lines: string[]): Record<string, any> {
  return {
    blocker: extractFirstSentence(content),
    cause: extractCause(content),
    impact: extractImpacts(content).join('; '),
    resolution_needed: extractResolution(content),
    urgency: assessUrgency(content)
  };
}

/**
 * Extract context evolution content
 */
function extractContextEvolutionContent(content: string, lines: string[]): Record<string, any> {
  return {
    previous_state: extractPreviousState(content),
    new_state: extractNewState(content),
    reason: extractReason(content),
    agents_impacted: extractAgentMentions(content),
    impact_analysis: extractFirstSentence(content)
  };
}

/**
 * Extract agent interaction content
 */
function extractAgentsInteractionContent(content: string, lines: string[]): Record<string, any> {
  return {
    summary: extractFirstSentence(content),
    participants: extractAgentMentions(content),
    decisions_prises: extractDecisions(content),
    actions_suivies: extractActions(content),
    satisfaction: assessSatisfaction(content)
  };
}

/**
 * Extract governance content
 */
function extractGovernanceContent(content: string, lines: string[]): Record<string, any> {
  return {
    gate_passed: extractGate(content),
    validation_details: extractValidationDetails(content),
    validateur: extractValidator(content),
    criteres_respectes: extractCriteria(content),
    risk_assessment: assessRisk(content)
  };
}

/**
 * Extract insight content
 */
function extractInsightContent(content: string, lines: string[]): Record<string, any> {
  return {
    insight: extractFirstSentence(content),
    context: extractContext(content),
    learning: extractLearning(content),
    actionable: extractActionable(content)
  };
}

/**
 * Helper functions for content extraction
 */
function extractListItems(content: string, keywords: string[]): string[] {
  const items: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
      const item = trimmed.substring(1).trim();
      if (keywords.some(keyword => line.toLowerCase().includes(keyword)) || items.length < 3) {
        items.push(item);
      }
    }
  }
  
  return items.slice(0, 5); // Max 5 items
}

function extractFirstSentence(content: string): string {
  const sentences = content.split(/[.!?]+/);
  return sentences[0]?.trim() || content.slice(0, 100);
}

function extractAgentMentions(content: string): string[] {
  const agents: string[] = [];
  const agent_patterns = ['PMO', 'AGP', 'heloise-rh', 'agp-gate', 'Héloïse', 'archiviste'];
  
  for (const agent of agent_patterns) {
    if (content.toLowerCase().includes(agent.toLowerCase())) {
      agents.push(agent);
    }
  }
  
  return [...new Set(agents)]; // Remove duplicates
}

function extractRationale(content: string): string {
  const rationale_keywords = ['parce que', 'car', 'en raison de', 'étant donné', 'vu que'];
  for (const keyword of rationale_keywords) {
    const index = content.toLowerCase().indexOf(keyword);
    if (index !== -1) {
      return content.substring(index).split('.')[0];
    }
  }
  return '';
}

function extractImpacts(content: string): string[] {
  const impact_lines = content.split('\n').filter(line => 
    line.toLowerCase().includes('impact') || line.toLowerCase().includes('conséquence')
  );
  return impact_lines.slice(0, 3);
}

function extractResponsible(content: string): string {
  const agents = extractAgentMentions(content);
  return agents[0] || '';
}

// Additional helper functions
function extractCause(content: string): string {
  return extractFirstSentence(content);
}

function extractResolution(content: string): string {
  const resolution_keywords = ['solution', 'résolution', 'action', 'next step'];
  for (const keyword of resolution_keywords) {
    if (content.toLowerCase().includes(keyword)) {
      const sentences = content.split('.');
      const relevant = sentences.find(s => s.toLowerCase().includes(keyword));
      if (relevant) return relevant.trim();
    }
  }
  return '';
}

function assessUrgency(content: string): string {
  if (content.toLowerCase().includes('urgent') || content.toLowerCase().includes('critique')) return 'high';
  if (content.toLowerCase().includes('important') || content.toLowerCase().includes('priorité')) return 'medium';
  return 'low';
}

function extractPreviousState(content: string): string {
  const patterns = ['avant', 'précédemment', 'auparavant', 'initialement'];
  for (const pattern of patterns) {
    if (content.toLowerCase().includes(pattern)) {
      return content.split('.')[0];
    }
  }
  return '';
}

function extractNewState(content: string): string {
  const patterns = ['maintenant', 'désormais', 'dorénavant', 'actuellement'];
  for (const pattern of patterns) {
    if (content.toLowerCase().includes(pattern)) {
      return content.split('.').slice(-1)[0] || content.split('.')[1] || '';
    }
  }
  return extractFirstSentence(content);
}

function extractReason(content: string): string {
  return extractRationale(content) || extractFirstSentence(content);
}

function extractDecisions(content: string): string[] {
  return extractListItems(content, ['décision', 'décide', 'valide']);
}

function extractActions(content: string): string[] {
  return extractListItems(content, ['action', 'tâche', 'todo', 'faire']);
}

function assessSatisfaction(content: string): number {
  if (content.toLowerCase().includes('excellent') || content.toLowerCase().includes('parfait')) return 10;
  if (content.toLowerCase().includes('très bien') || content.toLowerCase().includes('satisfait')) return 8;
  if (content.toLowerCase().includes('bien') || content.toLowerCase().includes('ok')) return 7;
  if (content.toLowerCase().includes('moyen') || content.toLowerCase().includes('correct')) return 5;
  if (content.toLowerCase().includes('problème') || content.toLowerCase().includes('difficile')) return 3;
  return 6; // Default neutral
}

function extractGate(content: string): string {
  const gate_patterns = ['DoR', 'AGP-PASS', 'validation', 'gate'];
  for (const pattern of gate_patterns) {
    if (content.includes(pattern)) return pattern;
  }
  return '';
}

function extractValidationDetails(content: string): string {
  return extractFirstSentence(content);
}

function extractValidator(content: string): string {
  return extractResponsible(content);
}

function extractCriteria(content: string): string[] {
  return extractListItems(content, ['critère', 'exigence', 'condition']);
}

function assessRisk(content: string): string {
  if (content.toLowerCase().includes('critique') || content.toLowerCase().includes('bloquant')) return 'Élevé';
  if (content.toLowerCase().includes('attention') || content.toLowerCase().includes('surveiller')) return 'Moyen';
  return 'Faible';
}

function extractContext(content: string): string {
  return content.slice(0, 200);
}

function extractLearning(content: string): string {
  const learning_keywords = ['apprentissage', 'leçon', 'retour', 'expérience'];
  for (const keyword of learning_keywords) {
    if (content.toLowerCase().includes(keyword)) {
      return content.split('.').find(s => s.toLowerCase().includes(keyword))?.trim() || '';
    }
  }
  return '';
}

function extractActionable(content: string): string {
  return extractResolution(content);
}

/**
 * Calculate importance based on pattern and context
 */
function calculateImportance(base: number, trigger_count: number, content_length: number): number {
  let importance = base;
  
  // Boost for multiple triggers
  if (trigger_count > 2) importance += 1;
  
  // Boost for detailed content
  if (content_length > 500) importance += 1;
  
  // Cap at 10
  return Math.min(10, importance);
}

/**
 * Generate relevant tags
 */
function generateTags(pattern_type: string, triggers: string[], content: string): string[] {
  const tags = [pattern_type.replace('_detection', '')];
  
  // Add trigger-based tags
  tags.push(...triggers.slice(0, 2));
  
  // Add content-based tags
  const agent_mentions = extractAgentMentions(content);
  if (agent_mentions.length > 0) tags.push('agents');
  
  if (content.toLowerCase().includes('budget')) tags.push('budget');
  if (content.toLowerCase().includes('planning')) tags.push('planning');
  if (content.toLowerCase().includes('sécurité')) tags.push('sécurité');
  
  return [...new Set(tags)].slice(0, 5); // Max 5 unique tags
}

/**
 * Create memory block with hash
 */
function createMemoryBlock(
  content: Record<string, any>,
  block_type: MemoryBlock['block_type'],
  agent_source: string = '',
  importance: number,
  tags: string[]
): MemoryBlock {
  const content_str = JSON.stringify(content, null, 2);
  const hash = crypto.createHash('sha256').update(content_str).digest('hex');
  
  return {
    block_type,
    content,
    agent_source,
    importance,
    tags,
    hash: `sha256:${hash}`
  };
}

/**
 * Calculate context completion percentage
 */
export function calculateContextCompletion(blocks: MemoryBlock[]): number {
  const type_counts = blocks.reduce((acc, block) => {
    acc[block.block_type] = (acc[block.block_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Weighted completion formula from B22 spec
  const completion = (
    (type_counts.vision || 0) * 0.3 +
    (type_counts.decision || 0) * 0.25 + 
    (type_counts.context_evolution || 0) * 0.2 +
    (type_counts.agents_interaction || 0) * 0.15 +
    (type_counts.governance || 0) * 0.1
  ) / 10 * 100; // Normalized to expected project complexity

  return Math.min(100, Math.round(completion));
}