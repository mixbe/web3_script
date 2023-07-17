import "dotenv/config";
import {Account, cairo, Contract, Provider} from "starknet";
import {ERC_20_ABI} from "./abi/ERC_20.js";
import readAccounts from "../../libs/readAccounts.js";
import {ethers} from "ethers";


const provider = new Provider({rpc: {nodeUrl: process.env.START_NET_URL}});

const do_myswap = async (account, poolId, amount, tokenFromAddr) => {

    const calls = [
        {
            contractAddress: tokenFromAddr,
            entrypoint: 'approve',
            calldata: [process.env.START_MYSWAP, cairo.uint256(amount)]
        },
        {
            contractAddress: process.env.START_MYSWAP,
            entrypoint: 'swap',
            calldata: [poolId, tokenFromAddr, cairo.uint256(amount), cairo.uint256(0)]
        }
    ]
    const result = await account.execute(calls);
    const multiCall = await provider.waitForTransaction(result.transaction_hash);
    console.log(multiCall.transaction_hash);

}

const main = async () => {
    const argentx_wallets = readAccounts('ArgentX_wallets.json');
    for (let i = 0; i < argentx_wallets.length; i++) {
        try {
            const l2Address = argentx_wallets[i].address;
            const l2PrivateKey = argentx_wallets[0].privateKey;

            const _account = new Account(provider, l2Address, l2PrivateKey);

            const ethContract = new Contract(ERC_20_ABI, process.env.START_L2_ETH_TOKEN_ADDRESS, provider);
            let balance = await ethContract.balanceOf(l2Address);
            console.log("Current eth balance: ", ethers.utils.formatEther(balance.balance.toString()));

            // eth_balance / 2
            // A -----> B
            if (balance.balance > 0) {
                let amount = balance.balance / 2n;
                await do_myswap(_account, "4", amount.toString(), process.env.START_L2_ETH_TOKEN_ADDRESS);
            }

            // sleep 2s
            new Promise(resolve => setTimeout(resolve, 2000));

            // todo option B -----> A
            // const wstETHContract = new Contract(ERC_20_ABI, process.env.START_MYSWAP_TO_TOKEN, provider);
            // balance = await wstETHContract.balanceOf(l2Address);
            // if (balance.balance > 0) {
            //     let amount = balance.balance.toString();
            //     await do_myswap(_account, "4", amount, process.env.START_MYSWAP_TO_TOKEN);
            // }

        } catch (err) {
            console.log("Do swap failed: ", err);
        }

    }
}

export default main();