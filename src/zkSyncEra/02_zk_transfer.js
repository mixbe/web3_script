import {ethers} from "ethers";
import readAccounts from "../../libs/readAccounts.js";
import {Provider, utils, Wallet} from "zksync-web3";
import 'dotenv/config';


const zkSyncProvider = new Provider(process.env.ZK_NODE_URL);
const ethereumProvider = ethers.getDefaultProvider(process.env.ETH_NODE_URL);

const main = async (tokenAddress = utils.ETH_ADDRESS, times = 1, amount = 0.001) => {
    const _amount = ethers.utils.parseEther('0.001');
    const accounts = readAccounts();

    for (let t = 0; t < times; t++) {
        for (let i = 0; i < accounts.length; i++) {
            const zkWallet = new Wallet(accounts[i].privateKey, zkSyncProvider, ethereumProvider);
            console.log(`Begin zk_transfer:  index:  ${i} address: ${accounts[i].address}  Balance: ${ethers.utils.formatEther(await zkWallet.getBalance(utils.ETH_ADDRESS))}  amount: ${ethers.utils.formatEther(_amount)}`);
            try {
                const transfer = await zkWallet.transfer({
                    to: accounts[i].address,
                    token: tokenAddress,
                    _amount
                });
                const txs = await transfer.wait();
                console.log(`TransactionHash: ${txs.transactionHash}`);
            } catch (err) {
                console.log("Transfer failed: ", err);
            }
        }
    }
}


export default main();