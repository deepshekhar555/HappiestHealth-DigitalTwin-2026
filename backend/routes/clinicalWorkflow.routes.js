const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth.middleware');
const {
  createWorkflow,
  getWorkflowById,
  listWorkflowsForPatient,
  updateWorkflowStatus
} = require('../services/clinicalWorkflow.service');

router.use(authorize('doctor', 'admin'));

router.post('/', async (req, res) => {
  try {
    const { patientId, recommendation, reviewer, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const workflow = await createWorkflow({
      patientId,
      recommendation,
      reviewer: reviewer || 'system',
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Clinical workflow creation failed:', error);
    return res.status(500).json({
      error: 'Failed to create clinical workflow',
      details: error.message
    });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const workflows = await listWorkflowsForPatient(req.params.patientId);
    return res.json({
      success: true,
      patientId: req.params.patientId,
      workflows
    });
  } catch (error) {
    console.error('Clinical workflow lookup failed:', error);
    return res.status(500).json({
      error: 'Failed to list workflows for patient',
      details: error.message
    });
  }
});

router.get('/:workflowId', async (req, res) => {
  try {
    const workflow = await getWorkflowById(req.params.workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    return res.json({ success: true, workflow });
  } catch (error) {
    console.error('Clinical workflow retrieval failed:', error);
    return res.status(500).json({
      error: 'Failed to retrieve workflow',
      details: error.message
    });
  }
});

router.patch('/:workflowId/status', async (req, res) => {
  try {
    const { status, reviewer, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const workflow = await updateWorkflowStatus(req.params.workflowId, {
      status,
      reviewer: reviewer || 'system',
      notes: notes || ''
    });

    return res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Clinical workflow status update failed:', error);
    return res.status(500).json({
      error: 'Failed to update workflow status',
      details: error.message
    });
  }
});

module.exports = router;
