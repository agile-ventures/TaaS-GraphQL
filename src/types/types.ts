import BigNumber from 'bignumber.js';

export type BalanceResponse = BigNumber;
export type StorageResponse = ScriptedContracts['storage'];
export type ScriptResponse = ScriptedContracts;
export type BigMapGetResponse = MichelsonV1Expression;
export type ManagerResponse = { manager: string };
export type ManagerKeyResponse = string | { key: string };
export type DelegateResponse = string | null;

export type OperationHash = string;

export interface DelegatesResponse {
  balance: BigNumber;
  frozen_balance: BigNumber;
  frozen_balance_by_cycle: Frozenbalancebycycle[];
  staking_balance: BigNumber;
  delegated_contracts: string[];
  delegated_balance: BigNumber;
  deactivated: boolean;
  grace_period: number;
}

interface Frozenbalancebycycle {
  cycle: number;
  deposit: BigNumber;
  fees: BigNumber;
  rewards: BigNumber;
}

export type BigMapKey = { key: { [key: string]: string }; type: { prim: string } };

// BlockResponse interface
// header:
export interface BlockFullHeader {
  level: number;
  proto: number;
  predecessor: string;
  timestamp: TimeStampMixed;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  seed_nonce_hash?: string;
  signature: string;
}

export type InlinedEndorsementKindEnum = 'endorsement';

export interface InlinedEndorsementContents {
  kind: InlinedEndorsementKindEnum;
  level: number;
}

export interface InlinedEndorsement {
  branch: string;
  operations: InlinedEndorsementContents;
  signature?: string;
}

export type Ballot = 'nay' | 'yay' | 'pass';

export interface OperationContentsEndorsement extends OperationContents {
  kind: 'endorsement';
  level: number;
  metadata: OperationContentsAndResultMetadataExtended;
}

export interface OperationContentsRevelation extends OperationContents {
  kind: 'seed_nonce_revelation';
  level: number;
  nonce: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsDoubleEndorsement extends OperationContents {
  kind: 'double_endorsement_evidence';
  op1: InlinedEndorsement;
  op2: InlinedEndorsement;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsDoubleBaking extends OperationContents {
  kind: 'double_baking_evidence';
  bh1: BlockFullHeader;
  bh2: BlockFullHeader;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsActivateAccount extends OperationContents {
  kind: 'activate_account';
  pkh: string;
  secret: string;
  metadata: OperationContentsAndResultMetadata;
}

export interface OperationContentsProposals extends OperationContents {
  kind: 'proposals';
  source: string;
  period: number;
  proposals: string[];
  metadata: any;
}

export interface OperationContentsBallot extends OperationContents {
  kind: 'ballot';
  source: string;
  period: number;
  proposal: string;
  ballot: Ballot;
  metadata: any;
}

export interface OperationContentsReveal extends OperationContents {
  kind: 'reveal';
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  public_key: string;
  metadata: OperationContentsMetadataReveal;
}

export interface OperationContentsTransaction extends OperationContents {
  kind: 'transaction';
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  amount: string;
  destination: string;
  parameters?: MichelsonV1Expression;
  metadata: OperationContentsMetadataTransaction;
}

export interface OperationContentsOrigination extends OperationContents {
  kind: 'origination';
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  balance: string;
  delegate?: string;
  script?: ScriptedContracts;
  metadata: OperationContentsMetadataOrigination;
}

export interface OperationContentsDelegation extends OperationContents {
  kind: 'delegation';
  source: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  delegate?: string;
  metadata: OperationContentsMetadataDelegation;
}

export interface OperationContents {
  kind: string;
  operation: OperationEntry;
}

export interface OperationContentsAndResultMetadataExtended {
  balance_updates: OperationMetadataBalanceUpdates[];
  delegate: string;
  slots: number[];
}

export interface OperationContentsMetadataReveal {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultReveal;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsMetadataTransaction {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultTransaction;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsMetadataDelegation {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultDelegation;
  internal_operation_results?: InternalOperationResult[];
}

export interface OperationContentsAndResultMetadata {
  balance_updates: OperationMetadataBalanceUpdates[];
}

export interface OperationEntry {
  protocol: string;
  chain_id: string;
  hash: string;
  branch: string;
  contents: OperationContents[];
  signature?: string;
}

export interface Block {
  protocol: string;
  chain_id: string;
  hash: string;
  header: BlockFullHeader;
  metadata: BlockMetadata;
  operations: OperationEntry[][];
}

export type BakingRightsArgumentsDelegate = string | string[];
export type BakingRightsArgumentsCycle = number | number[];
export type BakingRightsArgumentsLevel = number | number[];

export interface BakingRightsQueryArguments {
  level?: BakingRightsArgumentsLevel;
  cycle?: BakingRightsArgumentsCycle;
  delegate?: BakingRightsArgumentsDelegate;
  max_priority?: number;
  all?: null;
}

export interface BakingRightsResponseItem {
  level: number;
  delegate: string;
  priority: number;
  estimated_time?: Date;
}

export type BakingRightsResponse = BakingRightsResponseItem[];

export type EndorsingRightsArgumentsDelegate = string | string[];
export type EndorsingRightsArgumentsCycle = number | number[];
export type EndorsingRightsArgumentsLevel = number | number[];

export interface EndorsingRightsQueryArguments {
  level?: EndorsingRightsArgumentsLevel;
  cycle?: EndorsingRightsArgumentsCycle;
  delegate?: EndorsingRightsArgumentsDelegate;
}

export interface EndorsingRightsResponseItem {
  level: number;
  delegate: string;
  slots: number[];
  estimated_time?: Date;
}

export type EndorsingRightsResponse = EndorsingRightsResponseItem[];

export type BallotListResponseEnum = 'nay' | 'yay' | 'pass';

export interface BallotListResponseItem {
  pkh: string;
  ballot: BallotListResponseEnum;
}

export type BallotListResponse = BallotListResponseItem[];

export interface BallotsResponse {
  yay: number;
  nay: number;
  pass: number;
}

export type PeriodKindResponse = 'proposal' | 'testing_vote' | 'testing' | 'promotion_vote';

export type CurrentProposalResponse = string | null;

export type CurrentQuorumResponse = number;

export interface VotesListingsResponseItem {
  pkh: string;
  rolls: number;
}

export type VotesListingsResponse = VotesListingsResponseItem[];

export type ProposalsResponseItem = [string, number];

export type ProposalsResponse = ProposalsResponseItem[];

export interface RawBlockHeaderResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}

export interface BlockHeaderResponse {
  protocol: string;
  chain_id: string;
  hash: string;
  level: number;
  proto: number;
  predecessor: string;
  timestamp: string;
  validation_pass: number;
  operations_hash: string;
  fitness: string[];
  context: string;
  priority: number;
  proof_of_work_nonce: string;
  signature: string;
}

export interface PackDataParams {
  data: MichelsonV1Expression;
  type: MichelsonV1Expression;
  gas?: BigNumber;
}

export type HexString = string;

export interface PackDataResponse {
  packed: HexString;
  gas?: BigNumber | 'unaccounted';
}

export type BigMapResponse = MichelsonV1Expression | MichelsonV1Expression[];

export type PreapplyParams = OperationObject[];
export type PreapplyResponse = {
  contents: OperationContents[];
};

export type ForgeOperationsParams = Pick<OperationObject, 'branch' | 'contents'>;

export type TimeStampMixed = Date | string;

export enum BalanceUpdateKind {
  CONTRACT = 'contract',
  FREEZER =  'freezer'
};

export type BalanceUpdateCategoryEnum = 'rewards' | 'fees' | 'deposits';

export interface MichelsonV1ExpressionBase {
  int?: string;
  string?: string;
  bytes?: string;
}

export interface MichelsonV1ExpressionExtended {
  prim: string;
  args?: MichelsonV1Expression[];
  annots?: string[];
}

export type MichelsonV1Expression = MichelsonV1ExpressionBase | MichelsonV1ExpressionExtended;

export interface ScriptedContracts {
  code: MichelsonV1Expression[];
  storage: MichelsonV1Expression;
}

// BlockResponse interface
// metadata: {
//   balanceUpdates:
// }
export interface OperationBalanceUpdatesItem {
  kind: BalanceUpdateKind;
  category?: BalanceUpdateCategoryEnum;
  delegate?: string;
  cycle?: number;
  contract?: string;
  change: string;
}

export type OperationBalanceUpdates = OperationBalanceUpdatesItem[];

export interface ConstructedOperation {
  kind: string;
  level: number;
  nonce: string;
  pkh: string;
  hash: string;
  secret: string;
  source: string;
  period: number;
  proposal: string;
  ballot: string;
  fee: string;
  counter: string;
  gas_limit: string;
  storage_limit: string;
  parameters: string;
  balance: string;
  delegate: string;
  amount: string;
  destination: string;
  public_key: string;
  script: { code: string; storage: string };
}

export interface OperationObject {
  branch?: string;
  contents?: ConstructedOperation[];
  protocol?: string;
  signature?: string;
}

export type InternalOperationKind =
  | 'reveal'
  | 'transaction'
  | 'origination'
  | 'delegation';

export interface OperationResult {
  status: OperationResultStatus;
  consumed_gas?: string;
  errors?: TezosGenericOperationError[];
}

export interface OperationResultReveal extends OperationResult {
}

export interface OperationResultTransaction extends OperationResult {
  storage?: MichelsonV1Expression;
  big_map_diff?: ContractBigMapDiff;
  balance_updates?: OperationBalanceUpdates;
  originated_contracts?: string[];
  storage_size?: string;
  paid_storage_size_diff?: string;
  allocated_destination_contract?: boolean;
}

export interface OperationResultDelegation extends OperationResult {
}

export interface OperationResultOrigination extends OperationResult {
  balance_updates?: OperationBalanceUpdates;
  originated_contracts?: string[];
  storage_size?: string;
  paid_storage_size_diff?: string;
}

export interface ContractBigMapDiffItem {
  key_hash: string;
  key: MichelsonV1Expression;
  value?: MichelsonV1Expression;
}

export type ContractBigMapDiff = ContractBigMapDiffItem[];

export interface TezosGenericOperationError {
  kind: string;
  id: string;
}

export interface InternalOperationResult {
  kind: InternalOperationKind;
  source: string;
  nonce: number;
  amount?: string;
  destination?: string;
  parameters?: MichelsonV1Expression;
  public_key?: string;
  balance?: string;
  delegate?: string;
  script?: ScriptedContracts;
  result: OperationResult;
}

export type BalanceUpdateCategory = 'rewards' | 'fees' | 'deposits';

export interface OperationMetadataBalanceUpdates {
  kind: BalanceUpdateKind;
  category?: BalanceUpdateCategory;
  contract?: string;
  delegate?: string;
  cycle?: number;
  change: string;
}

export type OperationResultStatus = 'applied' | 'failed' | 'skipped' | 'backtracked';

export interface OperationContentsMetadataOrigination {
  balance_updates: OperationMetadataBalanceUpdates[];
  operation_result: OperationResultOrigination;
  internal_operation_results?: InternalOperationResult[];
}

export interface ConstantsResponse {
  proof_of_work_nonce_size: number;
  nonce_length: number;
  max_revelations_per_block: number;
  max_operation_data_length: number;
  preserved_cycles: number;
  blocks_per_cycle: number;
  blocks_per_commitment: number;
  blocks_per_roll_snapshot: number;
  blocks_per_voting_period: number;
  time_between_blocks: BigNumber[];
  endorsers_per_block: number;
  hard_gas_limit_per_operation: BigNumber;
  hard_gas_limit_per_block: BigNumber;
  proof_of_work_threshold: BigNumber;
  tokens_per_roll: BigNumber;
  michelson_maximum_type_size: number;
  seed_nonce_revelation_tip: string;
  origination_burn: string;
  block_security_deposit: BigNumber;
  endorsement_security_deposit: BigNumber;
  block_reward: BigNumber;
  endorsement_reward: BigNumber;
  cost_per_byte: BigNumber;
  hard_storage_limit_per_operation: BigNumber;
  min_proposal_quorum?: number;
  quorum_max?: number;
  quorum_min?: number;
  delay_per_missing_endorsement?: number;
  initial_endorsers?: string[];
}

export interface ContractResponse {
  balance: BigNumber;
  script: ScriptedContracts;
  counter?: string;
}

export interface TestChainStatus {
  status: string;
}

export interface MaxOperationListLength {
  max_size: number;
  max_op: number;
}

export interface Level {
  level: number;
  level_position: number;
  cycle: number;
  cycle_position: number;
  voting_period: number;
  voting_period_position: number;
  expected_commitment: boolean;
}

export interface BlockMetadata {
  protocol: string;
  next_protocol: string;
  test_chain_status: TestChainStatus;
  max_operations_ttl: number;
  max_operation_data_length: number;
  max_block_header_length: number;
  max_operation_list_length: MaxOperationListLength[];
  baker: string;
  level: Level;
  voting_period_kind: string;
  nonce_hash?: any;
  consumed_gas: string;
  deactivated: any[];
  balance_updates: OperationBalanceUpdates;
}

export type RPCRunOperationParam = {
  operation: OperationObject;
  chain_id: string;
};

export type EntrypointsResponse = {
  entrypoints: { [key: string]: Object };
  unreachable?: { path: ('Left' | 'Right')[] };
};
