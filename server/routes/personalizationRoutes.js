import express from 'express';
import {
  analyzeUserLifeStage,
  getUserLifeStage,
  analyzeLifestyleCluster,
  getLifestyleCluster,
  getClusterRecommendations
} from '../controllers/personalizationController.js';
import { isAuthenticatedUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/life-stage/analyze', isAuthenticatedUser, analyzeUserLifeStage);
router.get('/life-stage', isAuthenticatedUser, getUserLifeStage);
router.post('/lifestyle/analyze', isAuthenticatedUser, analyzeLifestyleCluster);
router.get('/lifestyle', isAuthenticatedUser, getLifestyleCluster);
router.get('/lifestyle/recommendations', isAuthenticatedUser, getClusterRecommendations);

export default router;
