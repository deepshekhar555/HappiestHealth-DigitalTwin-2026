const { mongoose } = require('../config/mongo');

const ClinicalWorkflowSchema = new mongoose.Schema({
  workflowId: { type: String, required: true, unique: true, index: true },
  patientId: { type: String, required: true, index: true },
  recommendationKey: { type: String, required: true, index: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['draft', 'pending_clinician_review', 'approved', 'rejected', 'escalated', 'archived'],
    default: 'pending_clinician_review'
  },
  reviewNotes: { type: String, default: '' },
  decisionBy: { type: String },
  decisionAt: { type: Date },
  evidenceSummary: [{ type: mongoose.Schema.Types.Mixed }],
  safetyReview: { type: mongoose.Schema.Types.Mixed },
  recommendation: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'clinical_workflows' });

ClinicalWorkflowSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ClinicalWorkflow', ClinicalWorkflowSchema);
