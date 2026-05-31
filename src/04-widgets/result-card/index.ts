export { ResultCard } from './ui/result-card.widget';
export { freshnessSnapshotFromIso } from './lib/freshness';
export {
  buildResultCardSnapshot,
  isTerminalStatus,
} from './lib/build-snapshot';
export type {
  ResultCardSnapshot,
  FactCheckSnapshot,
  ContextSnapshot,
  RelatedArticleRef,
  TruthLabel,
  ClaimScoreStatus,
  ClaimAttributionSnapshot,
  FreshnessSnapshot,
  ClaimCardSnapshot,
} from './model/types';
