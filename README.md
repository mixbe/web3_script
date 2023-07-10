## ZkSync Era Network Batch Airdrop Script


## Feature
- [√] Batch of production wallets
- [√] Turn into ETH in batches through cross -chain
- [√] Transfer to ETH through OKX batch (recommended method)
- [√] Batch wallet operation -cross -chain (ETH-> ZKSYNC2)
- [√] Batch wallet operation-transfer
- [√] Batch wallet operation-deployment contract
- [√] Batch wallet operation -cross -chain (ZKSYNC2-> ETH)
- [] Batch wallet operation -SWAP
- [] Batch wallet operation -Mint NFT


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