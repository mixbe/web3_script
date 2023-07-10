import readAccounts from "../../libs/readAccounts.js";
import {Provider, utils, Wallet} from "zksync-web3";
import {ethers} from "ethers";
import 'dotenv/config';


const zkSyncProvider = new Provider(process.env.ZK_NODE_URL);
const ethereumProvider = ethers.getDefaultProvider(process.env.ETH_NODE_URL);
const main = async () => {
    const amount = ethers.utils.parseEther("0.001");
    const accounts = readAccounts();
    for (let i = 0; i < accounts.length; i++) {
        console.log("zk_bridge_deposit address: ", accounts[i].address)
        const zkWallet = new Wallet(accounts[i].privateKey, zkSyncProvider, ethereumProvider);
        try {
            const result = await zkWallet.deposit({
                token: utils.ETH_ADDRESS,
                amount: amount,
                to: accounts[i].address,
                l2GasLimit: 1123680,
                gasLimit: 200000,
            })
            console.log("deposit to zkSync result...", result.hash);
            const ethereumTxReceipt = await result.waitL1Commit();
            console.log("ethereum deposit result...", ethereumTxReceipt.transactionHash);
        } catch (error) {
            console.log("deposit failed...", error);
        }

    }


}

export default main()