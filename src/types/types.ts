import BigNumber from 'bignumber.js';

export interface Block {
    protocol: string;
    chain_id: string;
    hash: string;
    header: BlockHeader;
    metadata: BlockMetadata;
    operations: OperationEntry[][];
}

export interface BlockHeader {
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
    seed_nonce_hash?: string;
    signature: string;
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
    nonce_hash?: string;
    consumed_gas: string;
    deactivated: string[];
    balance_updates: BalanceUpdate[];
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

export interface TestChainStatus {
    status: string;
}

export interface MaxOperationListLength {
    max_size: number;
    max_op?: number;
}

export enum BalanceUpdateKind {
    CONTRACT = 'contract',
    FREEZER = 'freezer',
}

export type BalanceUpdateCategory = 'rewards' | 'fees' | 'deposits';

export interface Delegate {
    balance: BigNumber;
    frozen_balance: BigNumber;
    frozen_balance_by_cycle: FrozenBalanceByCycle[];
    staking_balance: BigNumber;
    delegated_contracts: string[];
    delegated_balance: BigNumber;
    deactivated: boolean;
    grace_period: number;
}

interface FrozenBalanceByCycle {
    cycle: number;
    deposit: BigNumber;
    fees: BigNumber;
    rewards: BigNumber;
}

export interface Contract {
    address: string;
    blockHash: string;
    balance: BigNumber;
    script?: ScriptedContracts;
    counter?: string;
}

export interface ManagerKey {
    key: string;
    invalid?: boolean;
}

export type ContractEntrypoint = {
    entrypoints: { [key: string]: Object };
    unreachable?: { path: EntrypointPath[] };
};

export enum EntrypointPath {
    Left = 'Left',
    Right = 'Right',
}

export interface ScriptedContracts {
    code: MichelsonExpression[];
    storage: MichelsonExpression;
}

export type MichelsonExpression = MichelsonExpressionBase | MichelsonExpressionExtended;

export interface MichelsonExpressionBase {
    int?: string;
    string?: string;
    bytes?: string;
}

export interface MichelsonExpressionExtended {
    prim: string;
    args?: MichelsonExpression[];
    annots?: string[];
}

export interface OperationEntry {
    protocol: string;
    chain_id: string;
    hash: string;
    branch: string;
    contents: OperationContents[];
    signature?: string;
}

export interface OperationContents {
    kind: string;
    operation: OperationEntry;
}

export interface Endorsement extends OperationContents {
    kind: 'endorsement';
    level: number;
    metadata: EndorsementMetadata;
}

export interface EndorsementMetadata {
    balance_updates: BalanceUpdate[];
    delegate: string;
    slots: number[];
}

export interface SeedNonceRevelation extends OperationContents {
    kind: 'seed_nonce_revelation';
    level: number;
    nonce: string;
    metadata: OperationContentMetadata;
}

export interface DoubleEndorsementEvidence extends OperationContents {
    kind: 'double_endorsement_evidence';
    op1: InlinedEndorsement;
    op2: InlinedEndorsement;
    metadata: OperationContentMetadata;
}

export interface InlinedEndorsement {
    branch: string;
    operations: InlinedEndorsementContents;
    signature?: string;
}

export interface InlinedEndorsementContents {
    kind: InlinedEndorsementKindEnum;
    level: number;
}

export type InlinedEndorsementKindEnum = 'endorsement';

export interface OperationContentMetadata {
    balance_updates: BalanceUpdate[];
}

export interface DoubleBakingEvidence extends OperationContents {
    kind: 'double_baking_evidence';
    bh1: BlockHeader;
    bh2: BlockHeader;
    metadata: OperationContentMetadata;
}

export interface ActivateAccount extends OperationContents {
    kind: 'activate_account';
    pkh: string;
    secret: string;
    metadata: OperationContentMetadata;
}

export interface Reveal extends OperationContents {
    kind: 'reveal';
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    public_key: string;
    metadata: RevealMetadata;
}

export interface RevealMetadata {
    balance_updates: BalanceUpdate[];
    operation_result: RevealOperationResult;
    internal_operation_results?: InternalOperationResult[];
}

export interface RevealOperationResult extends OperationResult {}

export interface Transaction extends OperationContents {
    kind: 'transaction';
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    amount: string;
    destination: string;
    parameters?: MichelsonExpression;
    metadata: TransactionMetadata;
}

export interface TransactionMetadata {
    balance_updates: BalanceUpdate[];
    operation_result: TransactionOperationResult;
    internal_operation_results?: InternalOperationResult[];
}

export interface TransactionOperationResult extends OperationResult {
    storage?: MichelsonExpression;
    big_map_diff?: BigMapDiffItem[];
    balance_updates?: BalanceUpdate[];
    originated_contracts?: string[];
    storage_size?: string;
    paid_storage_size_diff?: string;
    allocated_destination_contract?: boolean;
}

export interface BigMapDiffItem {
    key_hash: string;
    key: MichelsonExpression;
    value?: MichelsonExpression;
}

export interface Delegation extends OperationContents {
    kind: 'delegation';
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    delegate?: string;
    metadata: DelegationMetadata;
}

export interface DelegationMetadata {
    balance_updates: BalanceUpdate[];
    operation_result: DelegationOperationResult;
    internal_operation_results?: InternalOperationResult[];
}

export interface DelegationOperationResult extends OperationResult {}

export interface Origination extends OperationContents {
    kind: 'origination';
    source: string;
    fee: string;
    counter: string;
    gas_limit: string;
    storage_limit: string;
    balance: string;
    delegate?: string;
    script?: ScriptedContracts;
    metadata: OriginationMetadata;
}

export interface OriginationMetadata {
    balance_updates: BalanceUpdate[];
    operation_result: OriginationOperationResult;
    internal_operation_results?: InternalOperationResult[];
}

export interface OriginationOperationResult extends OperationResult {
    balance_updates?: BalanceUpdate[];
    originated_contracts?: string[];
    storage_size?: string;
    paid_storage_size_diff?: string;
}

export interface Proposals extends OperationContents {
    kind: 'proposals';
    source: string;
    period: number;
    proposals: string[];
    metadata: any;
}

export interface Ballot extends OperationContents {
    kind: 'ballot';
    source: string;
    period: number;
    proposal: string;
    ballot: BallotVote;
    metadata: any;
}

export type BallotVote = 'nay' | 'yay' | 'pass';

export interface BalanceUpdate {
    kind: BalanceUpdateKind;
    category?: BalanceUpdateCategory;
    contract?: string;
    delegate?: string;
    cycle?: number;
    change: string;
}

export interface InternalOperationResult {
    kind: InternalOperationKind;
    source: string;
    nonce: number;
    amount?: string;
    destination?: string;
    parameters?: TransactionOperationParameter;
    public_key?: string;
    balance?: string;
    delegate?: string;
    script?: ScriptedContracts;
    result: OperationResult;
}

export type InternalOperationKind = 'reveal' | 'transaction' | 'origination' | 'delegation';

export interface TransactionOperationParameter {
    entrypoint: string;
    value: MichelsonExpression;
}

export interface OperationResult {
    status: OperationResultStatus;
    consumed_gas?: string;
    errors?: OperationError[];
}

export type OperationResultStatus = 'applied' | 'failed' | 'skipped' | 'backtracked';

export interface OperationError {
    kind: string;
    id: string;
}

export type BigMapKeyType = 'string' | 'nat' | 'int' | 'bytes' | 'bool' | 'mutez' | 'address' | 'key_hash';
