export const MY_SWAP_ABI = [
    {
        "name": "Uint256",
        "size": 2,
        "type": "struct",
        "members": [
            {
                "name": "low",
                "type": "felt",
                "offset": 0
            },
            {
                "name": "high",
                "type": "felt",
                "offset": 1
            }
        ]
    },
    {
        "name": "Pool",
        "size": 10,
        "type": "struct",
        "members": [
            {
                "name": "name",
                "type": "felt",
                "offset": 0
            },
            {
                "name": "token_a_address",
                "type": "felt",
                "offset": 1
            },
            {
                "name": "token_a_reserves",
                "type": "Uint256",
                "offset": 2
            },
            {
                "name": "token_b_address",
                "type": "felt",
                "offset": 4
            },
            {
                "name": "token_b_reserves",
                "type": "Uint256",
                "offset": 5
            },
            {
                "name": "fee_percentage",
                "type": "felt",
                "offset": 7
            },
            {
                "name": "cfmm_type",
                "type": "felt",
                "offset": 8
            },
            {
                "name": "liq_token",
                "type": "felt",
                "offset": 9
            }
        ]
    },
    {
        "data": [
            {
                "name": "implementation",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "previousAdmin",
                "type": "felt"
            },
            {
                "name": "newAdmin",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "AdminChanged",
        "type": "event"
    },
    {
        "name": "get_new_pool_reserves",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "tokena_reserves",
                "type": "Uint256"
            },
            {
                "name": "tokenb_reserves",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "swap",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            },
            {
                "name": "token_from_addr",
                "type": "felt"
            },
            {
                "name": "amount_from",
                "type": "Uint256"
            },
            {
                "name": "amount_to_min",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "amount_to",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "withdraw_liquidity",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            },
            {
                "name": "shares_amount",
                "type": "Uint256"
            },
            {
                "name": "amount_min_a",
                "type": "Uint256"
            },
            {
                "name": "amount_min_b",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "actual1",
                "type": "Uint256"
            },
            {
                "name": "actual2",
                "type": "Uint256"
            },
            {
                "name": "res1",
                "type": "Uint256"
            },
            {
                "name": "res2",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "add_liquidity",
        "type": "function",
        "inputs": [
            {
                "name": "a_address",
                "type": "felt"
            },
            {
                "name": "a_amount",
                "type": "Uint256"
            },
            {
                "name": "a_min_amount",
                "type": "Uint256"
            },
            {
                "name": "b_address",
                "type": "felt"
            },
            {
                "name": "b_amount",
                "type": "Uint256"
            },
            {
                "name": "b_min_amount",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "actual1",
                "type": "Uint256"
            },
            {
                "name": "actual2",
                "type": "Uint256"
            }
        ]
    },
    {
        "name": "create_new_pool",
        "type": "function",
        "inputs": [
            {
                "name": "pool_name",
                "type": "felt"
            },
            {
                "name": "a_address",
                "type": "felt"
            },
            {
                "name": "a_initial_liquidity",
                "type": "Uint256"
            },
            {
                "name": "b_address",
                "type": "felt"
            },
            {
                "name": "b_initial_liquidity",
                "type": "Uint256"
            },
            {
                "name": "a_times_b_sqrt_value",
                "type": "Uint256"
            }
        ],
        "outputs": [
            {
                "name": "pool_id",
                "type": "felt"
            }
        ]
    },
    {
        "name": "get_version",
        "type": "function",
        "inputs": [],
        "outputs": [
            {
                "name": "ver",
                "type": "felt"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_total_number_of_pools",
        "type": "function",
        "inputs": [],
        "outputs": [
            {
                "name": "num",
                "type": "felt"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_pool",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "pool",
                "type": "Pool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_lp_balance",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            },
            {
                "name": "lp_address",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "shares",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "get_total_shares",
        "type": "function",
        "inputs": [
            {
                "name": "pool_id",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "total_shares",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "name": "upgrade",
        "type": "function",
        "inputs": [
            {
                "name": "new_implementation",
                "type": "felt"
            }
        ],
        "outputs": []
    }
]