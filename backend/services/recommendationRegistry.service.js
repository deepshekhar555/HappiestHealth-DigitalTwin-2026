const recommendationRegistry = new Map();

const registerRecommendation = (key, recommendation) => {
  if (!key || typeof key !== 'string') {
    throw new Error('A recommendation key is required');
  }

  recommendationRegistry.set(key, {
    key,
    createdAt: new Date().toISOString(),
    ...recommendation
  });

  return recommendationRegistry.get(key);
};

const getRecommendation = (key) => recommendationRegistry.get(key) || null;

const listRecommendations = () => Array.from(recommendationRegistry.values());

const createDefaultRecommendation = (patient, analysis) => ({
  key: `recommendation-${patient?.patientId || 'unknown'}-${Date.now()}`,
  patientId: patient?.patientId || patient?.id || 'unknown',
  status: 'draft',
  title: 'Personalized treatment recommendation',
  evidence: analysis?.evidenceSummary || [],
  safetyReview: analysis?.safetyReview || null,
  createdAt: new Date().toISOString()
});

module.exports = {
  recommendationRegistry,
  registerRecommendation,
  getRecommendation,
  listRecommendations,
  createDefaultRecommendation
};
