import AMLScreening from '../models/AMLScreening.js';
import AgeVerification from '../models/AgeVerification.js';
import ESGScoring from '../models/ESGScoring.js';
import catchAsyncErrors from '../middleware/catchAsyncErrors.js';
import ErrorHandler from '../utils/errorHandler.js';

// AML Screening Controllers

export const performAMLScreening = catchAsyncErrors(async (req, res, next) => {
  const { personalInfo } = req.body;

  // Simulate AML screening checks
  const screening = await AMLScreening.create({
    user: req.user.id,
    screening: {
      performedAt: Date.now(),
      provider: 'CompliancePro',
      reference: 'AML-' + Date.now(),
      automated: true
    },
    personalInfo,
    checks: {
      pep: {
        checked: true,
        result: 'clear',
        matches: []
      },
      sanctions: {
        checked: true,
        result: 'clear',
        lists: ['OFAC', 'UN', 'EU'],
        matches: []
      },
      adverseMedia: {
        checked: true,
        result: 'clear',
        findings: []
      },
      watchlists: {
        checked: true,
        result: 'clear',
        matches: []
      }
    },
    riskScore: {
      overall: 15,
      level: 'low',
      factors: [
        { factor: 'No adverse findings', score: 5, weight: 0.3 },
        { factor: 'Clear sanctions check', score: 10, weight: 0.7 }
      ]
    },
    decision: {
      status: 'approved',
      decidedBy: { automated: true },
      decidedAt: Date.now()
    },
    monitoring: {
      continuous: true,
      frequency: 'monthly',
      lastChecked: Date.now()
    }
  });

  res.status(200).json({
    success: true,
    data: screening
  });
});

export const getAMLStatus = catchAsyncErrors(async (req, res, next) => {
  const screening = await AMLScreening.findOne({ user: req.user.id }).sort('-createdAt');

  if (!screening) {
    return next(new ErrorHandler('No AML screening found', 404));
  }

  res.status(200).json({
    success: true,
    data: screening
  });
});

// Age Verification Controllers

export const verifyAge = catchAsyncErrors(async (req, res, next) => {
  const { productId, documentVerification, requiredAge } = req.body;

  const verification = await AgeVerification.create({
    user: req.user.id,
    product: productId,
    requiredAge: requiredAge || 18,
    verificationType: 'document',
    documentVerification,
    verification: {
      method: 'document_scan',
      provider: 'IDVerify',
      reference: 'AGE-' + Date.now(),
      verifiedAt: Date.now()
    },
    result: {
      verified: true,
      age: 25,
      dateOfBirth: new Date('1999-01-01'),
      meetsRequirement: true,
      confidence: 95
    },
    status: 'verified',
    compliance: {
      jurisdiction: 'US',
      regulation: 'State Age Restriction Laws'
    }
  });

  res.status(200).json({
    success: true,
    data: verification
  });
});

export const getAgeVerificationStatus = catchAsyncErrors(async (req, res, next) => {
  const verification = await AgeVerification.findOne({
    user: req.user.id,
    status: 'verified'
  }).sort('-createdAt');

  if (!verification) {
    return res.status(200).json({
      success: true,
      verified: false
    });
  }

  res.status(200).json({
    success: true,
    verified: true,
    data: verification
  });
});

// ESG Scoring Controllers

export const calculateESGScore = catchAsyncErrors(async (req, res, next) => {
  const { entityType, entityId, assessmentData } = req.body;

  // Calculate ESG scores
  const environmental = calculateEnvironmentalScore(assessmentData);
  const social = calculateSocialScore(assessmentData);
  const governance = calculateGovernanceScore(assessmentData);

  const overallScore = (environmental + social + governance) / 3;
  const grade = getESGGrade(overallScore);

  const esgScoring = await ESGScoring.create({
    entity: {
      type: entityType,
      referenceId: entityId
    },
    environmental: {
      carbonFootprint: assessmentData.carbonFootprint || {},
      materials: assessmentData.materials || {},
      overallScore: environmental
    },
    social: {
      laborPractices: assessmentData.laborPractices || {},
      diversity: assessmentData.diversity || {},
      overallScore: social
    },
    governance: {
      transparency: assessmentData.transparency || {},
      ethics: assessmentData.ethics || {},
      overallScore: governance
    },
    overall: {
      score: overallScore,
      grade,
      percentile: 75,
      trend: 'improving'
    },
    certifications: assessmentData.certifications || [],
    lastAssessed: Date.now()
  });

  res.status(200).json({
    success: true,
    data: esgScoring
  });
});

export const getESGScore = catchAsyncErrors(async (req, res, next) => {
  const { entityType, entityId } = req.params;

  const esgScoring = await ESGScoring.findOne({
    'entity.type': entityType,
    'entity.referenceId': entityId
  }).sort('-lastAssessed');

  if (!esgScoring) {
    return next(new ErrorHandler('ESG scoring not found', 404));
  }

  res.status(200).json({
    success: true,
    data: esgScoring
  });
});

// Helper functions
function calculateEnvironmentalScore(data) {
  // Simplified scoring
  let score = 50;
  if (data.carbonFootprint?.offsetPercentage > 50) score += 20;
  if (data.materials?.sustainable > 70) score += 15;
  if (data.packaging?.recyclable) score += 15;
  return Math.min(score, 100);
}

function calculateSocialScore(data) {
  let score = 50;
  if (data.laborPractices?.fairWages) score += 20;
  if (data.diversity?.genderEquality > 40) score += 15;
  if (data.communityImpact?.localSourcing) score += 15;
  return Math.min(score, 100);
}

function calculateGovernanceScore(data) {
  let score = 50;
  if (data.transparency?.reporting) score += 20;
  if (data.ethics?.codeOfConduct) score += 15;
  if (data.compliance?.gdprCompliant) score += 15;
  return Math.min(score, 100);
}

function getESGGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B+';
  if (score >= 65) return 'B';
  if (score >= 55) return 'C+';
  if (score >= 45) return 'C';
  if (score >= 35) return 'D';
  return 'F';
}
