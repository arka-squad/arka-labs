// Deterministic context completion formula for B15

export interface ContextCompletionWeights {
  objective: number;
  constraints: number;  
  participants: number;
  docs_ref: number;
  risks: number;
}

export interface ContextCompletionFactors {
  objective: boolean;      // Has clear objective been defined?
  constraints: boolean;    // Are constraints documented?
  participants: boolean;   // Are participants identified?
  docs_ref: boolean;      // Are reference documents linked?
  risks: boolean;         // Are risks identified?
}

export interface ContextCompletionResult {
  completion: number;
  completion_breakdown: Record<string, number>;
  weights_used: ContextCompletionWeights;
  factors_evaluated: ContextCompletionFactors;
}

// Default weights (sum = 1.0)
const DEFAULT_WEIGHTS: ContextCompletionWeights = {
  objective: 0.2,
  constraints: 0.2,
  participants: 0.2,
  docs_ref: 0.2,
  risks: 0.2
};

export function calculateContextCompletion(
  contextNotes: Array<{ type: string; content: string; agent?: string }>,
  weights: ContextCompletionWeights = DEFAULT_WEIGHTS
): ContextCompletionResult {
  
  // Evaluate each factor based on context notes
  const factors: ContextCompletionFactors = {
    objective: hasObjectiveDefinition(contextNotes),
    constraints: hasConstraintsDocumented(contextNotes),
    participants: hasParticipantsIdentified(contextNotes),
    docs_ref: hasDocumentReferences(contextNotes),
    risks: hasRisksIdentified(contextNotes)
  };

  // Calculate weighted completion
  const completion = Math.round(
    (weights.objective * (factors.objective ? 1 : 0) +
     weights.constraints * (factors.constraints ? 1 : 0) +
     weights.participants * (factors.participants ? 1 : 0) +
     weights.docs_ref * (factors.docs_ref ? 1 : 0) +
     weights.risks * (factors.risks ? 1 : 0)) * 100
  );

  // Create breakdown showing individual factor scores
  const completion_breakdown = {
    objective: factors.objective ? 1 : 0,
    constraints: factors.constraints ? 1 : 0, 
    participants: factors.participants ? 1 : 0,
    docs_ref: factors.docs_ref ? 1 : 0,
    risks: factors.risks ? 1 : 0
  };

  return {
    completion,
    completion_breakdown,
    weights_used: weights,
    factors_evaluated: factors
  };
}

// Factor evaluation functions
function hasObjectiveDefinition(notes: Array<{ type: string; content: string }>): boolean {
  return notes.some(note => 
    (note.type === 'objective' || note.type === 'agent_question') &&
    (note.content.toLowerCase().includes('objectif') ||
     note.content.toLowerCase().includes('but') ||
     note.content.toLowerCase().includes('goal'))
  );
}

function hasConstraintsDocumented(notes: Array<{ type: string; content: string }>): boolean {
  return notes.some(note =>
    (note.type === 'constraint' || note.type === 'user_note') &&
    (note.content.toLowerCase().includes('contrainte') ||
     note.content.toLowerCase().includes('limitation') ||
     note.content.toLowerCase().includes('budget') ||
     note.content.toLowerCase().includes('délai') ||
     note.content.toLowerCase().includes('échéance'))
  );
}

function hasParticipantsIdentified(notes: Array<{ type: string; content: string }>): boolean {
  return notes.some(note =>
    note.content.toLowerCase().includes('participant') ||
    note.content.toLowerCase().includes('personne') ||
    note.content.toLowerCase().includes('équipe') ||
    note.content.toLowerCase().includes('nombre') ||
    note.content.toLowerCase().includes('qui')
  );
}

function hasDocumentReferences(notes: Array<{ type: string; content: string }>): boolean {
  return notes.some(note =>
    note.content.toLowerCase().includes('document') ||
    note.content.toLowerCase().includes('fichier') ||
    note.content.toLowerCase().includes('rapport') ||
    note.content.toLowerCase().includes('synthèse') ||
    note.content.toLowerCase().includes('template')
  );
}

function hasRisksIdentified(notes: Array<{ type: string; content: string }>): boolean {
  return notes.some(note =>
    note.content.toLowerCase().includes('risque') ||
    note.content.toLowerCase().includes('problème') ||
    note.content.toLowerCase().includes('attention') ||
    note.content.toLowerCase().includes('sécurité') ||
    note.content.toLowerCase().includes('danger') ||
    note.content.toLowerCase().includes('incident')
  );
}

// Custom weights for different folder types
export const FOLDER_TYPE_WEIGHTS: Record<string, ContextCompletionWeights> = {
  'event': {
    objective: 0.15,
    constraints: 0.25,  // Higher weight for events (budget, venue, timing)
    participants: 0.30, // Critical for events
    docs_ref: 0.15,
    risks: 0.15
  },
  'project': {
    objective: 0.30,    // Projects need clear objectives
    constraints: 0.20,
    participants: 0.15,
    docs_ref: 0.25,     // Documentation is key for projects
    risks: 0.10
  },
  'training': {
    objective: 0.25,
    constraints: 0.15,
    participants: 0.25,
    docs_ref: 0.20,     // Training materials
    risks: 0.15
  }
};

export function getWeightsForFolderType(folderType?: string): ContextCompletionWeights {
  if (folderType && FOLDER_TYPE_WEIGHTS[folderType]) {
    return FOLDER_TYPE_WEIGHTS[folderType];
  }
  return DEFAULT_WEIGHTS;
}