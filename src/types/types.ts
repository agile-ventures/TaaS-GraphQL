import BigNumber from 'bignumber.js';

export interface Block {
    protocol: string;
    chainId: string;
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
    validationPass: number;
    operationsHash: string;
    fitness: string[];
    context: string;
    priority: number;
    proofOfWorkNonce: string;
    seedNonceHash?: string;
    signature: string;
}

export interface BlockMetadata {
    protocol: string;
    nextProtocol: string;
    testChainStatus: TestChainStatus;
    maxOperationsTtl: number;
    maxOperationDataLength: number;
    maxBlockHeaderLength: number;
    maxOperationListLength: MaxOperationListLength[];
    baker: string;
    level: Level;
    votingPeriodKind: string;
    nonceHash?: string;
    consumedGas: string;
    deactivated: string[];
    balanceUpdates: BalanceUpdate[];
}

export interface Level {
    level: number;
    levelPosition: number;
    cycle: number;
    cyclePosition: number;
    votingPeriod: number;
    votingPeriodPosition: number;
    expectedCommitment: boolean;
}

export interface TestChainStatus {
    status: string;
}

export interface MaxOperationListLength {
    maxSize: number;
    maxOp?: number;
}

export enum BalanceUpdateKind {
    CONTRACT = 'contract',
    FREEZER = 'freezer',
}

export type BalanceUpdateCategory = 'rewards' | 'fees' | 'deposits';

export interface BakingRight {
    level: number;
    delegate: string;
    priority: number;
    estimatedTime?: Date;
}

export interface EndorsingRight {
    level: number;
    delegate: string;
    slots: number[];
    estimatedTime?: Date;
}

export interface Delegate {
    balance: BigNumber;
    frozenBalance: BigNumber;
    frozenBalanceByCycle: FrozenBalanceByCycle[];
    stakingBalance: BigNumber;
    delegatedContracts: string[];
    delegatedBalance: BigNumber;
    deactivated: boolean;
    gracePeriod: number;
    blockHash: string;
    address: string;
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

export interface Constants {
    proofOfWorkNonceSize: number;
    nonceLength: number;
    maxRevelationsPerBlock: number;
    maxOperationDataLength: number;
    preservedCycles: number;
    blocksPerCycle: number;
    blocksPerCommitment: number;
    blocksPerRollSnapshot: number;
    blocksPerVotingPeriod: number;
    timeBetweenBlocks: BigNumber[];
    endorsersPerBlock: number;
    hardGasLimitPerOperation: BigNumber;
    hardGasLimitPerBlock: BigNumber;
    proofOfWorkThreshold: BigNumber;
    tokensPerRoll: BigNumber;
    michelsonMaximumTypeSize: number;
    seedNonceRevelationTip: string;
    originationBurn: string;
    blockSecurityDeposit: BigNumber;
    endorsementSecurityDeposit: BigNumber;
    blockReward?: BigNumber;
    endorsementReward?: BigNumber | [BigNumber];
    costPerByte: BigNumber;
    hardStorageLimitPerOperation: BigNumber;
    minProposalQuorum?: number;
    quorumMax?: number;
    quorumMin?: number;
    delayPerMissingEndorsement?: number;
    initialEndorsers?: string[];
    bakingRewardPerEndorsement?: [BigNumber];
}

export interface ManagerKey {
    key: string;
    invalid?: boolean;
}

export type Entrypoints = {
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
    chainId: string;
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
    balanceUpdates: BalanceUpdate[];
    delegate: string;
    slots: number[];
}

export interface SeedNonceRevelation extends OperationContents {
    kind: 'seedNonceRevelation';
    level: number;
    nonce: string;
    metadata: OperationContentMetadata;
}

export interface DoubleEndorsementEvidence extends OperationContents {
    kind: 'doubleEndorsementEvidence';
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
    balanceUpdates: BalanceUpdate[];
}

export interface DoubleBakingEvidence extends OperationContents {
    kind: 'doubleBakingEvidence';
    bh1: BlockHeader;
    bh2: BlockHeader;
    metadata: OperationContentMetadata;
}

export interface ActivateAccount extends OperationContents {
    kind: 'activateAccount';
    pkh: string;
    secret: string;
    metadata: OperationContentMetadata;
}

export interface Reveal extends OperationContents {
    kind: 'reveal';
    source: string;
    fee: string;
    counter: string;
    gasLimit: string;
    storageLimit: string;
    publicKey: string;
    metadata: RevealMetadata;
}

export interface RevealMetadata {
    balanceUpdates: BalanceUpdate[];
    operationResult: RevealOperationResult;
    internalOperationResults?: InternalOperationResult[];
}

export interface RevealOperationResult extends OperationResult {}

export interface Transaction extends OperationContents {
    kind: 'transaction';
    source: string;
    fee: string;
    counter: string;
    gasLimit: string;
    storageLimit: string;
    amount: string;
    destination: string;
    parameters?: MichelsonExpression;
    metadata: TransactionMetadata;
}

export interface TransactionMetadata {
    balanceUpdates: BalanceUpdate[];
    operationResult: TransactionOperationResult;
    internalOperationResults?: InternalOperationResult[];
}

export interface TransactionOperationResult extends OperationResult {
    storage?: MichelsonExpression;
    bigMapDiff?: BigMapDiffItem[];
    balanceUpdates?: BalanceUpdate[];
    originatedContracts?: string[];
    storageSize?: string;
    paidStorageSizeDiff?: string;
    allocatedDestinationContract?: boolean;
}

export interface BigMapDiffItem {
    keyHash: string;
    key: MichelsonExpression;
    value?: MichelsonExpression;
}

export interface Delegation extends OperationContents {
    kind: 'delegation';
    source: string;
    fee: string;
    counter: string;
    gasLimit: string;
    storageLimit: string;
    delegate?: string;
    metadata: DelegationMetadata;
}

export interface DelegationMetadata {
    balanceUpdates: BalanceUpdate[];
    operationResult: DelegationOperationResult;
    internalOperationResults?: InternalOperationResult[];
}

export interface DelegationOperationResult extends OperationResult {}

export interface Origination extends OperationContents {
    kind: 'origination';
    source: string;
    fee: string;
    counter: string;
    gasLimit: string;
    storageLimit: string;
    balance: string;
    delegate?: string;
    script?: ScriptedContracts;
    metadata: OriginationMetadata;
}

export interface OriginationMetadata {
    balanceUpdates: BalanceUpdate[];
    operationResult: OriginationOperationResult;
    internalOperationResults?: InternalOperationResult[];
}

export interface OriginationOperationResult extends OperationResult {
    balanceUpdates?: BalanceUpdate[];
    originatedContracts?: string[];
    storageSize?: string;
    paidStorageSizeDiff?: string;
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
    publicKey?: string;
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
    consumedGas?: string;
    errors?: OperationError[];
}

export type OperationResultStatus = 'applied' | 'failed' | 'skipped' | 'backtracked';

export interface OperationError {
    kind: string;
    id: string;
}

export type BigMapKeyType = 'string' | 'nat' | 'int' | 'bytes' | 'bool' | 'mutez' | 'address' | 'key_hash';
