## WEB3 Batch Airdrop Script


## Feature
### ZkSyncEra
- [x] 1.Batch of production wallets
- [x] 2.Turn into ETH in batches through cross -chain
- [x] 3.Transfer to ETH through OKX batch (recommended method)
- [x] 4.Batch wallet operation -cross -chain (ETH-> ZKSYNC2)
- [x] 5.Batch wallet operation-transfer
- [x] 6.Batch wallet operation-deployment contract
- [x] 7.Batch wallet operation -cross -chain (ZKSYNC2-> ETH)
- [] 8.Batch wallet operation -SWAP
- [] 9.Batch wallet operation -Mint NFT

### fuel
- [x] 1.wallet create
- [x] 2.Transfer
- [x] 3.Deploy contract
- [x] 4.Mint swap tokens
- [x] 5.swap


### lenster

- [x] 1.Automatic login
- [x] 2.Auto post
- [x] 3.Auto Follow
- [x] 4.Automatic likes

### startnet

- [x] 1.Account creation
- [x] 2.Cross-chain
- [x] 3.Deploy account (this step requires operation)
- [x] 4.mint domain name
- [x] 5.swap

# taiko



## config
> `cp .env.example .env`


- ETH_URL: eth node url
- ZKSYNC_URL : zksync node url
- OKX_XX： (optional)
-
```
PRIVATE_KEY=xxx

ETH_NODE_URL=https://rpc.ankr.com/eth_goerli
ZK_NODE_URL=https://testnet.era.zksync.dev/

OKX_API_KEY=xxx
OKX_SECRET_KEY=xxx
OKX_PASS_PHRASE=xxx
```

## run
```
npm run lenster-post

npm run create-wallet
npm run okx-withdraw

npm run zk-bridge-deposit
npm run zk-transfer
npm run zk-bridge-withdraw
npm run zk-mint-nft

```



## Risk
- This project script is hosted on the world's largest github, open, transparent, and secure, and refuses any private chat scripts.
- The distribution of handling fees from the exchange in the script involves the exchange's apiKey, which must not be exposed to others.
- Private key accounts are very important! The script only runs on your own computer, and refuses any proxy interaction.