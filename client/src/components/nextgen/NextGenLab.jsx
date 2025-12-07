import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  BeakerIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon,
  MapIcon,
  ArrowUturnLeftIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  DocumentCheckIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CpuChipIcon,
  PresentationChartLineIcon,
  ShieldExclamationIcon,
  SignalIcon,
  ChartBarIcon,
  CubeTransparentIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API = '/api/v1/next-gen';

const Card = ({ title, icon: Icon, children, accent = 'from-indigo-500 to-purple-500' }) => (
  <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 shadow-lg shadow-black/20">
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${accent} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-xs text-gray-400">Labs • PoC endpoints</p>
      </div>
    </div>
    {children}
  </div>
);

const useFetch = (deps, fn) => {
  const [state, setState] = useState({ loading: false, data: null, error: null });
  const run = useMemo(() => async () => {
    setState({ loading: true, data: null, error: null });
    try {
      const data = await fn();
      setState({ loading: false, data, error: null });
    } catch (err) {
      setState({ loading: false, data: null, error: err?.message || 'Error' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return [state, run];
};

const pretty = (obj) => JSON.stringify(obj, null, 2);

const NextGenLab = () => {
  const [query, setQuery] = useState('wireless headphones');
  const [searchState, runSearch] = useFetch([query], async () => {
    const res = await fetch(`${API}/search?query=${encodeURIComponent(query)}`);
    return res.json();
  });

  const [expState, runExp] = useFetch([], async () => {
    const res = await fetch(`${API}/experiments/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user', experimentKey: 'homepage-layout', variants: ['control', 'heroA', 'heroB'] })
    });
    return res.json();
  });

  const [riskState, runRisk] = useFetch([], async () => {
    const res = await fetch(`${API}/risk-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 240, deviceTrust: 0.55, velocity: 2, recentChargebacks: 1 })
    });
    return res.json();
  });

  const [payState, runPay] = useFetch([], async () => {
    const res = await fetch(`${API}/payments/orchestrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferred: 'stripe', fallback: true })
    });
    return res.json();
  });

  const [slotState, runSlots] = useFetch([], async () => {
    const res = await fetch(`${API}/delivery/slots`);
    return res.json();
  });

  const [returnState, runReturn] = useFetch([], async () => {
    const res = await fetch(`${API}/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ORDER-123', items: [{ sku: 'sku-1', qty: 1 }] })
    });
    if (!res.ok) throw new Error('Return failed');
    return res.json();
  });

  const [landedState, runLanded] = useFetch([], async () => {
    const res = await fetch(`${API}/landed-cost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtotal: 180, origin: 'US', destination: 'CA', currency: 'USD' })
    });
    return res.json();
  });

  const [bundleState, runBundles] = useFetch([], async () => {
    const res = await fetch(`${API}/bundles?productId=prod-1001`);
    return res.json();
  });

  const [refState, runReferral] = useFetch([], async () => {
    const res = await fetch(`${API}/referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo-user' })
    });
    return res.json();
  });

  const [storyState, runStories] = useFetch([], async () => {
    const res = await fetch(`${API}/stories`);
    return res.json();
  });

  const [moderateState, runModerate] = useFetch([], async () => {
    const res = await fetch(`${API}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Call me at 555-123-4567 you idiot' })
    });
    return res.json();
  });

  const [copilotState, runCopilot] = useFetch([], async () => {
    const res = await fetch(`${API}/checkout/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingSpeed: 'standard', carbonAware: true })
    });
    return res.json();
  });

  const [visualState, runVisual] = useFetch([], async () => {
    const res = await fetch(`${API}/visual-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f' })
    });
    if (!res.ok) throw new Error('visual search failed');
    return res.json();
  });

  const [tokenState, runToken] = useFetch([], async () => {
    const res = await fetch(`${API}/payments/tokenize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last4: '4242', network: 'visa' })
    });
    return res.json();
  });

  const [contractState, runContract] = useFetch([], async () => {
    const res = await fetch(`${API}/contract-pricing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountLevel: 'gold', sku: 'desk-500', basePrice: 300 })
    });
    return res.json();
  });

  const [auditState, runAudit] = useFetch([], async () => {
    const res = await fetch(`${API}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'demo-admin', action: 'update-price', target: 'sku-123' })
    });
    return res.json();
  });

  const [sloState, runSlo] = useFetch([], async () => {
    const res = await fetch(`${API}/slos`);
    return res.json();
  });

  const [embeddingState, runEmbeddings] = useFetch([], async () => {
    const res = await fetch(`${API}/user-embeddings`);
    return res.json();
  });

  const [sessionRecoState, runSessionRecos] = useFetch([], async () => {
    const res = await fetch(`${API}/session-recos`);
    return res.json();
  });

  const [elasticityState, runElasticity] = useFetch([], async () => {
    const res = await fetch(`${API}/price-elasticity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: 'sku-100', price: 120 })
    });
    return res.json();
  });

  const [dynamicContentState, runDynamicContent] = useFetch([], async () => {
    const res = await fetch(`${API}/dynamic-content`);
    return res.json();
  });

  const [multimodalState, runMultimodal] = useFetch([query], async () => {
    const res = await fetch(`${API}/multimodal-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef', text: query })
    });
    return res.json();
  });

  const [facetState, runFacets] = useFetch([query], async () => {
    const res = await fetch(`${API}/facets/auto?query=${encodeURIComponent(query)}`);
    return res.json();
  });

  const [queryUxState, runQueryUnderstanding] = useFetch([query], async () => {
    const res = await fetch(`${API}/query-understanding?query=${encodeURIComponent(query)}`);
    return res.json();
  });

  const [assortmentState, runAssortmentGaps] = useFetch([], async () => {
    const res = await fetch(`${API}/assortment-gaps`);
    return res.json();
  });

  const [marginState, runMarginRanking] = useFetch([], async () => {
    const res = await fetch(`${API}/ranking/margin-aware`);
    return res.json();
  });

  const [pricingExpState, runPricingExperiments] = useFetch([], async () => {
    const res = await fetch(`${API}/pricing-experiments`);
    return res.json();
  });

  const [behavioralState, runBehavioral] = useFetch([], async () => {
    const res = await fetch(`${API}/risk/behavioral`);
    return res.json();
  });

  const [binRoutingState, runBinRouting] = useFetch([], async () => {
    const res = await fetch(`${API}/payments/bin-routing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bin: '411111', amount: 240 })
    });
    return res.json();
  });

  const [adaptive3dsState, runAdaptive3ds] = useFetch([], async () => {
    const res = await fetch(`${API}/payments/adaptive-3ds`);
    return res.json();
  });

  const [mlEtaState, runMlEta] = useFetch([], async () => {
    const res = await fetch(`${API}/logistics/ml-eta`);
    return res.json();
  });

  const [slotPricingState, runSlotPricing] = useFetch([], async () => {
    const res = await fetch(`${API}/logistics/slot-pricing`);
    return res.json();
  });

  const [delayState, runDelayComms] = useFetch([], async () => {
    const res = await fetch(`${API}/logistics/delay-comms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: 'ORDER-123', severity: 'high' })
    });
    return res.json();
  });

  const [returnsAvoidState, runReturnsAvoidance] = useFetch([], async () => {
    const res = await fetch(`${API}/logistics/returns-avoidance`);
    return res.json();
  });

  const [sharedCartState, runSharedCarts] = useFetch([], async () => {
    const res = await fetch(`${API}/b2b/shared-carts`);
    return res.json();
  });

  const [entitlementsState, runEntitlements] = useFetch([], async () => {
    const res = await fetch(`${API}/b2b/catalog-entitlements`);
    return res.json();
  });

  const [punchoutState, runPunchout] = useFetch([], async () => {
    const res = await fetch(`${API}/b2b/punchout`);
    return res.json();
  });

  const [aiPdpState, runAiPdp] = useFetch([], async () => {
    const res = await fetch(`${API}/content/ai-pdp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: 'sku-100', locale: 'en-US' })
    });
    return res.json();
  });

  const [ugcState, runUgcQuality] = useFetch([], async () => {
    const res = await fetch(`${API}/content/ugc-quality`);
    return res.json();
  });

  const [creatorState, runCreatorPortal] = useFetch([], async () => {
    const res = await fetch(`${API}/content/creators`);
    return res.json();
  });

  const [tracingState, runTracing] = useFetch([], async () => {
    const res = await fetch(`${API}/ops/tracing`);
    return res.json();
  });

  const [anomalyState, runAnomalies] = useFetch([], async () => {
    const res = await fetch(`${API}/ops/anomalies`);
    return res.json();
  });

  const [chaosState, runChaos] = useFetch([], async () => {
    const res = await fetch(`${API}/ops/chaos`);
    return res.json();
  });

  const [piiState, runPiiVault] = useFetch([], async () => {
    const res = await fetch(`${API}/security/pii-vault`);
    return res.json();
  });

  const [hsState, runHsClassification] = useFetch([], async () => {
    const res = await fetch(`${API}/intl/hs-classification`);
    return res.json();
  });

  const [fxState, runFxHedging] = useFetch([], async () => {
    const res = await fetch(`${API}/intl/fx-hedging`);
    return res.json();
  });

  const [buyerCopilotState, runBuyerCopilot] = useFetch([], async () => {
    const res = await fetch(`${API}/copilot/buyer`);
    return res.json();
  });

  const [agentCopilotState, runAgentCopilot] = useFetch([], async () => {
    const res = await fetch(`${API}/copilot/agent`);
    return res.json();
  });

  const [merchantCopilotState, runMerchantCopilot] = useFetch([], async () => {
    const res = await fetch(`${API}/copilot/merchant`);
    return res.json();
  });

  useEffect(() => {
    runSearch();
    runExp();
    runRisk();
    runPay();
    runSlots();
    runLanded();
    runBundles();
    runReferral();
    runStories();
    runModerate();
    runCopilot();
    runVisual();
    runToken();
    runContract();
    runAudit();
    runSlo();
    runEmbeddings();
    runSessionRecos();
    runElasticity();
    runDynamicContent();
    runMultimodal();
    runFacets();
    runQueryUnderstanding();
    runAssortmentGaps();
    runMarginRanking();
    runPricingExperiments();
    runBehavioral();
    runBinRouting();
    runAdaptive3ds();
    runMlEta();
    runSlotPricing();
    runDelayComms();
    runReturnsAvoidance();
    runSharedCarts();
    runEntitlements();
    runPunchout();
    runAiPdp();
    runUgcQuality();
    runCreatorPortal();
    runTracing();
    runAnomalies();
    runChaos();
    runPiiVault();
    runHsClassification();
    runFxHedging();
    runBuyerCopilot();
    runAgentCopilot();
    runMerchantCopilot();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = [
    { label: 'Trigger Return', fn: runReturn },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-blue-400 tracking-wide">Next-gen</p>
          <h2 className="text-3xl font-bold text-white">AI Commerce Labs</h2>
          <p className="text-gray-400">Semantic search, experiments, risk, payments, logistics, and more (mock APIs).</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {actions.map((a) => (
            <button key={a.label} onClick={() => a.fn().then(() => toast.success(`${a.label} executed`))} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm">
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Semantic & Multilingual Search" icon={MagnifyingGlassIcon} accent="from-blue-500 to-cyan-500">
          <div className="flex gap-2 mb-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" placeholder="Search..." />
            <button onClick={runSearch} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Search</button>
          </div>
          <pre className="bg-black/40 text-xs text-emerald-200 p-3 rounded-lg max-h-52 overflow-auto">{pretty(searchState.data || {})}</pre>
        </Card>

        <Card title="Experiments & Feature Flags" icon={BeakerIcon} accent="from-purple-500 to-pink-500">
          <button onClick={runExp} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm mb-3">Assign Variant</button>
          <pre className="bg-black/40 text-xs text-purple-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(expState.data || {})}</pre>
        </Card>

        <Card title="Fraud Risk & 3DS" icon={ShieldCheckIcon} accent="from-amber-500 to-orange-500">
          <button onClick={runRisk} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm mb-3">Score</button>
          <pre className="bg-black/40 text-xs text-amber-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(riskState.data || {})}</pre>
        </Card>

        <Card title="Payment Orchestration" icon={CreditCardIcon} accent="from-sky-500 to-indigo-500">
          <button onClick={runPay} className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm mb-3">Route</button>
          <pre className="bg-black/40 text-xs text-sky-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(payState.data || {})}</pre>
        </Card>

        <Card title="Slot Optimization" icon={MapIcon} accent="from-green-500 to-emerald-500">
          <button onClick={runSlots} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm mb-3">Refresh Slots</button>
          <pre className="bg-black/40 text-xs text-green-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(slotState.data || {})}</pre>
        </Card>

        <Card title="Reverse Logistics" icon={ArrowUturnLeftIcon} accent="from-rose-500 to-red-500">
          <button onClick={runReturn} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm mb-3">Create RMA</button>
          <pre className="bg-black/40 text-xs text-rose-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(returnState.data || {})}</pre>
        </Card>

        <Card title="Landed Cost & Localization" icon={GlobeAltIcon} accent="from-cyan-500 to-teal-500">
          <button onClick={runLanded} className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm mb-3">Recalculate</button>
          <pre className="bg-black/40 text-xs text-cyan-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(landedState.data || {})}</pre>
        </Card>

        <Card title="Bundles & Cross-Sell" icon={Squares2X2Icon} accent="from-indigo-500 to-violet-500">
          <button onClick={runBundles} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm mb-3">Get Bundles</button>
          <pre className="bg-black/40 text-xs text-indigo-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(bundleState.data || {})}</pre>
        </Card>

        <Card title="Referrals & Stories" icon={UsersIcon} accent="from-fuchsia-500 to-pink-500">
          <div className="flex gap-2 mb-3">
            <button onClick={runReferral} className="px-3 py-2 bg-fuchsia-600 text-white rounded-lg text-sm">Referral</button>
            <button onClick={runStories} className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm">Stories</button>
          </div>
          <pre className="bg-black/40 text-xs text-pink-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ referral: refState.data, stories: storyState.data })}</pre>
        </Card>

        <Card title="Content Safety" icon={ChatBubbleLeftRightIcon} accent="from-red-500 to-orange-500">
          <button onClick={runModerate} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm mb-3">Moderate</button>
          <pre className="bg-black/40 text-xs text-orange-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(moderateState.data || {})}</pre>
        </Card>

        <Card title="Checkout Co-Pilot" icon={ArrowTrendingUpIcon} accent="from-emerald-500 to-lime-500">
          <button onClick={runCopilot} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm mb-3">Suggest</button>
          <pre className="bg-black/40 text-xs text-emerald-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(copilotState.data || {})}</pre>
        </Card>

        <Card title="Visual Similarity" icon={PhotoIcon} accent="from-blue-500 to-cyan-500">
          <button onClick={runVisual} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm mb-3">Match</button>
          <pre className="bg-black/40 text-xs text-blue-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty(visualState.data || {})}</pre>
        </Card>

        <Card title="Tokenization & Contract Pricing" icon={CreditCardIcon} accent="from-amber-500 to-yellow-500">
          <div className="flex gap-2 mb-3">
            <button onClick={runToken} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm">Tokenize</button>
            <button onClick={runContract} className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm">Contract Price</button>
          </div>
          <pre className="bg-black/40 text-xs text-amber-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ tokenization: tokenState.data, contract: contractState.data })}</pre>
        </Card>

        <Card title="Audit Trail & SLOs" icon={DocumentCheckIcon} accent="from-slate-500 to-gray-500">
          <div className="flex gap-2 mb-3">
            <button onClick={runAudit} className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm">Audit</button>
            <button onClick={runSlo} className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm">SLOs</button>
          </div>
          <pre className="bg-black/40 text-xs text-slate-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ audit: auditState.data, slos: sloState.data })}</pre>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Embeddings & Session Recos" icon={SparklesIcon} accent="from-fuchsia-500 to-purple-500">
          <div className="flex gap-2 mb-3">
            <button onClick={runEmbeddings} className="px-3 py-2 bg-fuchsia-600 text-white rounded-lg text-sm">Embeddings</button>
            <button onClick={runSessionRecos} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm">Session Recos</button>
          </div>
          <pre className="bg-black/40 text-xs text-fuchsia-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ embeddings: embeddingState.data, sessionRecommendations: sessionRecoState.data })}</pre>
        </Card>

        <Card title="Search Intelligence" icon={CpuChipIcon} accent="from-cyan-500 to-sky-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runElasticity} className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm">Price Elasticity</button>
            <button onClick={runDynamicContent} className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm">Dynamic Content</button>
            <button onClick={runMultimodal} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Multimodal</button>
          </div>
          <pre className="bg-black/40 text-xs text-cyan-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ elasticity: elasticityState.data, dynamicContent: dynamicContentState.data, multimodal: multimodalState.data })}</pre>
        </Card>

        <Card title="Facets, Queries & Assortment" icon={PresentationChartLineIcon} accent="from-lime-500 to-green-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runFacets} className="px-3 py-2 bg-lime-600 text-white rounded-lg text-sm">Auto Facets</button>
            <button onClick={runQueryUnderstanding} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Query UX</button>
            <button onClick={runAssortmentGaps} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Assortment</button>
            <button onClick={runMarginRanking} className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm">Margin Rank</button>
            <button onClick={runPricingExperiments} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm">Pricing Exp</button>
          </div>
          <pre className="bg-black/40 text-xs text-lime-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ facets: facetState.data, queryUnderstanding: queryUxState.data, assortment: assortmentState.data, marginRanking: marginState.data, pricingExperiments: pricingExpState.data })}</pre>
        </Card>

        <Card title="Behavioral Security & BIN" icon={ShieldExclamationIcon} accent="from-amber-500 to-red-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runBehavioral} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm">Behavioral</button>
            <button onClick={runBinRouting} className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm">BIN Routing</button>
            <button onClick={runAdaptive3ds} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm">Adaptive 3DS</button>
          </div>
          <pre className="bg-black/40 text-xs text-amber-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ behavioral: behavioralState.data, binRouting: binRoutingState.data, adaptive3ds: adaptive3dsState.data })}</pre>
        </Card>

        <Card title="Logistics ML" icon={SignalIcon} accent="from-indigo-500 to-blue-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runMlEta} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">ML ETA</button>
            <button onClick={runSlotPricing} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Slot Pricing</button>
            <button onClick={runDelayComms} className="px-3 py-2 bg-sky-600 text-white rounded-lg text-sm">Delay Comms</button>
            <button onClick={runReturnsAvoidance} className="px-3 py-2 bg-cyan-600 text-white rounded-lg text-sm">Returns Avoidance</button>
          </div>
          <pre className="bg-black/40 text-xs text-indigo-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ mlEta: mlEtaState.data, slotPricing: slotPricingState.data, delayComms: delayState.data, returnsAvoidance: returnsAvoidState.data })}</pre>
        </Card>

        <Card title="B2B & Shared Carts" icon={ChartBarIcon} accent="from-teal-500 to-emerald-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runSharedCarts} className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm">Shared Carts</button>
            <button onClick={runEntitlements} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm">Entitlements</button>
            <button onClick={runPunchout} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Punchout</button>
          </div>
          <pre className="bg-black/40 text-xs text-teal-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ sharedCarts: sharedCartState.data, entitlements: entitlementsState.data, punchout: punchoutState.data })}</pre>
        </Card>

        <Card title="Content Enrichment" icon={CubeTransparentIcon} accent="from-pink-500 to-rose-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runAiPdp} className="px-3 py-2 bg-pink-600 text-white rounded-lg text-sm">AI PDP</button>
            <button onClick={runUgcQuality} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-sm">UGC Quality</button>
            <button onClick={runCreatorPortal} className="px-3 py-2 bg-fuchsia-600 text-white rounded-lg text-sm">Creator Portal</button>
          </div>
          <pre className="bg-black/40 text-xs text-pink-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ aiPdp: aiPdpState.data, ugcQuality: ugcState.data, creatorPortal: creatorState.data })}</pre>
        </Card>

        <Card title="Observability & Resilience" icon={ArrowPathIcon} accent="from-slate-500 to-gray-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runTracing} className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm">Tracing</button>
            <button onClick={runAnomalies} className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm">Anomalies</button>
            <button onClick={runChaos} className="px-3 py-2 bg-neutral-700 text-white rounded-lg text-sm">Chaos</button>
          </div>
          <pre className="bg-black/40 text-xs text-slate-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ tracing: tracingState.data, anomalies: anomalyState.data, chaos: chaosState.data })}</pre>
        </Card>

        <Card title="Security & International" icon={ShieldExclamationIcon} accent="from-yellow-500 to-amber-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runPiiVault} className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm">PII Vault</button>
            <button onClick={runHsClassification} className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm">HS Codes</button>
            <button onClick={runFxHedging} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm">FX Hedging</button>
          </div>
          <pre className="bg-black/40 text-xs text-yellow-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ piiVault: piiState.data, hsClassification: hsState.data, fxHedging: fxState.data })}</pre>
        </Card>

        <Card title="Co-Pilots" icon={BuildingOffice2Icon} accent="from-blue-500 to-indigo-500">
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={runBuyerCopilot} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Buyer</button>
            <button onClick={runAgentCopilot} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">Agent</button>
            <button onClick={runMerchantCopilot} className="px-3 py-2 bg-violet-600 text-white rounded-lg text-sm">Merchant</button>
          </div>
          <pre className="bg-black/40 text-xs text-blue-100 p-3 rounded-lg max-h-52 overflow-auto">{pretty({ buyer: buyerCopilotState.data, agent: agentCopilotState.data, merchant: merchantCopilotState.data })}</pre>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ArrowPathIcon className="w-4 h-4" />
        These are mock/demo endpoints. Wire to real ML/PSP/search providers as you integrate.
        <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
        Minimal client changes; server provides JSON contracts for future services.
      </div>
    </div>
  );
};

export default NextGenLab;
