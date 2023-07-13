import Web3 from 'web3'
import readAccounts from "../../libs/readAccounts.js";
import 'dotenv/config';
import ABI from "./ABI/ABI.js";

export const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ZK_NODE_URL))
const NFT_ADDRESS = '0x0611f40ba68Fa9Cb1E83aa2AeEEfd383EB813689';

const main = async () => {
    const accounts = readAccounts('erc20_wallets');
    for (let i = 0; i < accounts.length; i++) {
        try {
            const {address: from} = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);

            const contract = new web3.eth.Contract(ABI, NFT_ADDRESS);
            const nonce = await web3.eth.getTransactionCount(from);
            const gasPrice = await web3.eth.getGasPrice();

            // await zkWallet.signTransaction()
            // await zkWallet.sendTransaction()

            const cid = 'Qmdkcx2h8xhDHsTEYKggbTt8ck5bWE1oLSqbwmbu4zVGap';

            // contract.methods.mint(accounts[i].address, cid).send({
            //     from
            // }).on('receipt', (data) => {
            //     console.log(data)
            // })

            const data = contract.methods['mint'](accounts[i].address, cid).encodeABI()
            const txs = {
                to: NFT_ADDRESS,
                from,
                nonce,
                data,
                gasPrice,
                gas: `5000000`,
            }
            const signedTx = await web3.eth.accounts.signTransaction(txs, accounts[i].privateKey)
            const {transactionHash} = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            console.log(transactionHash, 'transactionHash');

        } catch (error) {
            console.log("mint NFT failed...", error);
        }
    }

}
export default main();