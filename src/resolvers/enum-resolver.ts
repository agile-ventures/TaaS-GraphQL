export const enumResolver = {
    BalanceUpdateKind: {
        CONTRACT: 'contract',
        FREEZER: 'freezer',
    },

    BalanceUpdateCategory: {
        DEPOSITS: 'deposits',
        FEES: 'fees',
        REWARDS: 'rewards',
    },

    BallotVote: {
        NAY: 'nay',
        PASS: 'pass',
        YAY: 'yay',
    },

    OperationKind: {
        ACTIVATE_ACCOUNT: 'activate_account',
        BALLOT: 'ballot',
        DELEGATION: 'delegation',
        DOUBLE_BAKING_EVIDENCE: 'double_baking_evidence',
        DOUBLE_ENDORSEMENT_EVIDENCE: 'double_endorsement_evidence',
        ENDORSEMENT: 'endorsement',
        ORIGINATION: 'origination',
        PROPOSALS: 'proposals',
        REVEAL: 'reveal',
        SEED_NONCE_REVELATION: 'seed_nonce_revelation',
        TRANSACTION: 'transaction',
    },

    InternalOperationKind: {
        DELEGATION: 'delegation',
        ORIGINATION: 'origination',
        REVEAL: 'reveal',
        TRANSACTION: 'transaction',
    },

    OperationResultStatus: {
        APPLIED: 'applied',
        BACKTRACKED: 'backtracked',
        FAILED: 'failed',
        SKIPPED: 'skipped',
    },

    BigMapKeyType: {
        STRING: 'string',
        NAT: 'nat',
        INT: 'int',
        BYTES: 'bytes',
        BOOL: 'bool',
        MUTEZ: 'mutez',
        ADDRESS: 'address',
        KEY_HASH: 'key_hash',
    },

    TestChainStatusType: {
        NOT_RUNNING: 'not_running',
        FORKING: 'forking',
        RUNNING: 'running',
    },

    VotingPeriodKind: {
        PROPOSAL: 'proposal',
        TESTING_VOTE: 'testing_vote',
        TESTING: 'testing',
        PROMOTION_VOTE: 'promotion_vote',
    },
};
