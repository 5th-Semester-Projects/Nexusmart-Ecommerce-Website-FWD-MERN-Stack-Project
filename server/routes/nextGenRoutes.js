import express from 'express';
import {
  semanticSearch,
  assignExperiment,
  riskScore,
  orchestratePayment,
  deliverySlots,
  createReturn,
  landedCost,
  bundles,
  referral,
  stories,
  moderate,
  checkoutCopilot,
  visualSearch,
  tokenize,
  contractPricing,
  audit,
  slo,
  userEmbeddings,
  sessionRecommendations,
  priceElasticity,
  dynamicContent,
  multimodalSearch,
  facetGeneration,
  queryUnderstanding,
  assortmentGaps,
  marginAwareRanking,
  pricingExperiments,
  behavioralBiometrics,
  binRouting,
  adaptive3ds,
  mlEta,
  slotPricing,
  delayComms,
  returnsAvoidance,
  sharedCarts,
  catalogEntitlements,
  punchout,
  aiPdpEnrichment,
  ugcQuality,
  creatorPortal,
  tracing,
  anomalyDetection,
  chaosSim,
  piiVault,
  hsClassification,
  fxHedging,
  buyerCopilot,
  agentCopilot,
  merchantCopilot
} from '../controllers/nextGenController.js';

const router = express.Router();

router.get('/search', semanticSearch);
router.post('/experiments/assign', assignExperiment);
router.post('/risk-score', riskScore);
router.post('/payments/orchestrate', orchestratePayment);
router.get('/delivery/slots', deliverySlots);
router.post('/returns', createReturn);
router.post('/landed-cost', landedCost);
router.get('/bundles', bundles);
router.post('/referral', referral);
router.get('/stories', stories);
router.post('/moderate', moderate);
router.post('/checkout/copilot', checkoutCopilot);
router.post('/visual-search', visualSearch);
router.post('/payments/tokenize', tokenize);
router.post('/contract-pricing', contractPricing);
router.post('/audit', audit);
router.get('/slos', slo);
router.get('/user-embeddings', userEmbeddings);
router.get('/session-recos', sessionRecommendations);
router.post('/price-elasticity', priceElasticity);
router.get('/dynamic-content', dynamicContent);
router.post('/multimodal-search', multimodalSearch);
router.get('/facets/auto', facetGeneration);
router.get('/query-understanding', queryUnderstanding);
router.get('/assortment-gaps', assortmentGaps);
router.get('/ranking/margin-aware', marginAwareRanking);
router.get('/pricing-experiments', pricingExperiments);
router.get('/risk/behavioral', behavioralBiometrics);
router.post('/payments/bin-routing', binRouting);
router.get('/payments/adaptive-3ds', adaptive3ds);
router.get('/logistics/ml-eta', mlEta);
router.get('/logistics/slot-pricing', slotPricing);
router.post('/logistics/delay-comms', delayComms);
router.get('/logistics/returns-avoidance', returnsAvoidance);
router.get('/b2b/shared-carts', sharedCarts);
router.get('/b2b/catalog-entitlements', catalogEntitlements);
router.get('/b2b/punchout', punchout);
router.post('/content/ai-pdp', aiPdpEnrichment);
router.get('/content/ugc-quality', ugcQuality);
router.get('/content/creators', creatorPortal);
router.get('/ops/tracing', tracing);
router.get('/ops/anomalies', anomalyDetection);
router.get('/ops/chaos', chaosSim);
router.get('/security/pii-vault', piiVault);
router.get('/intl/hs-classification', hsClassification);
router.get('/intl/fx-hedging', fxHedging);
router.get('/copilot/buyer', buyerCopilot);
router.get('/copilot/agent', agentCopilot);
router.get('/copilot/merchant', merchantCopilot);

export default router;
