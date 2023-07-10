import {Provider, utils, Wallet} from "zksync-web3";
import {ethers} from "ethers";
import 'dotenv/config';
import readAccounts from "../../libs/readAccounts.js";


const zkSyncProvider = new Provider(process.env.ZK_NODE_URL);
const ethereumProvider = ethers.getDefaultProvider(process.env.ETH_NODE_URL);

const main = async () => {
    const amount = ethers.utils.parseEther("0.001");
    const accounts = readAccounts();
    for (let i = 0; i < accounts.length; i++) {
        const zkWallet = new Wallet(accounts[i].privateKey, zkSyncProvider, ethereumProvider);
        try {
            const result = await zkWallet.withdraw({
                token: utils.ETH_ADDRESS,
                amount: amount,
                to: accounts[i].address
            });
            console.log("withdraw to zsSync result...", result.hash);
            const ethereumTxReceipt = await  result.wait();
            console.log("ethereum deposit result...", ethereumTxReceipt.transactionHash);
        } catch (err) {
            console.log("Withdraw failed...", error);
        }
    }

}

export default main();