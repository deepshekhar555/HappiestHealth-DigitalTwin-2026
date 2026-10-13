const { v4: uuidv4 } = require('uuid');
const ClinicalWorkflow = require('../models/ClinicalWorkflow');

const ALLOWED_TRANSITIONS = {
  draft: ['pending_clinician_review', 'archived'],
  pending_clinician_review: ['approved', 'rejected', 'escalated', 'archived'],
  approved: ['archived'],
  rejected: ['draft', 'pending_clinician_review', 'archived'],
  escalated: ['pending_clinician_review', 'approved', 'rejected', 'archived'],
  archived: []
};

const ensureWorkflowStatus = (status) => {
  if (!status) return 'pending_clinician_review';
  if (!ALLOWED_TRANSITIONS[status] && status !== 'draft') {
    throw new Error(`Unsupported workflow status: ${status}`);
  }
  return status;
};

const normalizeRecommendationForWorkflow = (patientId, recommendation = {}) => {
  const title = recommendation.recommendedProtocol || recommendation.title || 'Personalized treatment recommendation';
  const workflow = {
    workflowId: `wf-${uuidv4().slice(0, 8)}-${Date.now()}`,
    patientId,
    recommendationKey: recommendation.registryKey || recommendation.key || `rec-${Date.now()}`,
    title,
    status: 'pending_clinician_review',
    evidenceSummary: recommendation.evidenceSummary || recommendation.evidence || [],
    safetyReview: recommendation.safetyReview || null,
    recommendation,
    reviewNotes: recommendation.reviewNotes || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return workflow;
};

const createWorkflow = async ({ patientId, recommendation, reviewer = 'system', notes = '' }) => {
  if (!patientId) {
    throw new Error('patientId is required');
  }

  const workflowData = normalizeRecommendationForWorkflow(patientId, recommendation || {});
  const workflow = new ClinicalWorkflow({
    ...workflowData,
    reviewNotes: notes || workflowData.reviewNotes,
    decisionBy: reviewer,
    status: 'pending_clinician_review'
  });

  await workflow.save();
  return workflow.toObject();
};

const getWorkflowById = async (workflowId) => {
  if (!workflowId) return null;
  return ClinicalWorkflow.findOne({ workflowId }).lean();
};

const listWorkflowsForPatient = async (patientId) => {
  return ClinicalWorkflow.find({ patientId }).sort({ createdAt: -1 }).lean();
};

const updateWorkflowStatus = async (workflowId, { status, reviewer = 'system', notes = '' }) => {
  const normalizedStatus = ensureWorkflowStatus(status);
  const workflow = await ClinicalWorkflow.findOne({ workflowId });

  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const currentStatus = workflow.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (allowed.length && !allowed.includes(normalizedStatus)) {
    throw new Error(`Status transition from ${currentStatus} to ${normalizedStatus} is not allowed`);
  }

  workflow.status = normalizedStatus;
  workflow.decisionBy = reviewer;
  workflow.decisionAt = new Date();
  workflow.reviewNotes = notes || workflow.reviewNotes || '';

  await workflow.save();
  return workflow.toObject();
};

module.exports = {
  ALLOWED_TRANSITIONS,
  createWorkflow,
  getWorkflowById,
  listWorkflowsForPatient,
  updateWorkflowStatus,
  normalizeRecommendationForWorkflow
};
