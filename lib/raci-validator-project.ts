// RACI invariants validation for project document assignments (using existing DB schema)

import { sql } from './db';

export interface RACIAssignment {
  document_id: string;
  agent_id: string;
  role: 'A' | 'R' | 'C' | 'I';
}

export interface RACIValidationResult {
  isValid: boolean;
  violations: string[];
}

export async function validateRACIInvariantsProject(
  projectId: number,
  newAssignments: RACIAssignment[]
): Promise<RACIValidationResult> {
  const violations: string[] = [];

  try {
    // Get all current assignments for this project
    const currentAssignments = await sql`
      SELECT document_id, agent_id, raci_role as role
      FROM project_assignments 
      WHERE project_id = ${projectId} 
        AND agent_id IS NOT NULL 
        AND raci_role IS NOT NULL
    `;

    // Group assignments by document
    const assignmentsByDoc = new Map<string, RACIAssignment[]>();
    
    // Add current assignments
    for (const assignment of currentAssignments) {
      const docId = assignment.document_id.toString();
      if (!assignmentsByDoc.has(docId)) {
        assignmentsByDoc.set(docId, []);
      }
      assignmentsByDoc.get(docId)!.push({
        document_id: docId,
        agent_id: assignment.agent_id,
        role: assignment.role as 'A' | 'R' | 'C' | 'I'
      });
    }

    // Apply new assignments (replace if same doc+agent, add if new)
    for (const newAssignment of newAssignments) {
      const docId = newAssignment.document_id;
      if (!assignmentsByDoc.has(docId)) {
        assignmentsByDoc.set(docId, []);
      }

      const docAssignments = assignmentsByDoc.get(docId)!;
      const existingIndex = docAssignments.findIndex(a => a.agent_id === newAssignment.agent_id);
      
      if (existingIndex >= 0) {
        // Replace existing assignment
        docAssignments[existingIndex] = newAssignment;
      } else {
        // Add new assignment
        docAssignments.push(newAssignment);
      }
    }

    // Validate invariants for each document
    for (const [docId, assignments] of assignmentsByDoc.entries()) {
      const accountableCount = assignments.filter(a => a.role === 'A').length;
      const responsibleCount = assignments.filter(a => a.role === 'R').length;

      // Rule 1: Exactly one A per document
      if (accountableCount === 0) {
        violations.push(`Document '${docId}' has no Accountable (A) role assigned`);
      } else if (accountableCount > 1) {
        const agents = assignments.filter(a => a.role === 'A').map(a => a.agent_id);
        violations.push(`Document '${docId}' has multiple Accountable (A) roles: ${agents.join(', ')}`);
      }

      // Rule 2: At least one R per document  
      if (responsibleCount === 0) {
        violations.push(`Document '${docId}' has no Responsible (R) role assigned`);
      }

      // Rule 3: Same agent cannot have both A and R on same document
      const agentRoles = new Map<string, string[]>();
      for (const assignment of assignments) {
        if (!agentRoles.has(assignment.agent_id)) {
          agentRoles.set(assignment.agent_id, []);
        }
        agentRoles.get(assignment.agent_id)!.push(assignment.role);
      }

      for (const [agentId, roles] of agentRoles.entries()) {
        if (roles.includes('A') && roles.includes('R')) {
          violations.push(`Agent '${agentId}' cannot have both Accountable (A) and Responsible (R) roles on document '${docId}'`);
        }
      }
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  } catch (error) {
    console.error('RACI validation error:', error);
    return {
      isValid: false,
      violations: ['Failed to validate RACI assignments due to database error']
    };
  }
}

export function validateSingleRACIAssignment(assignment: RACIAssignment): string[] {
  const violations: string[] = [];

  if (!assignment.document_id || assignment.document_id.trim() === '') {
    violations.push('Document ID is required');
  }

  if (!assignment.agent_id || assignment.agent_id.trim() === '') {
    violations.push('Agent ID is required');
  }

  if (!['A', 'R', 'C', 'I'].includes(assignment.role)) {
    violations.push(`Invalid RACI role '${assignment.role}'. Must be A, R, C, or I`);
  }

  return violations;
}