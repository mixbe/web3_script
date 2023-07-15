import "dotenv/config";
import {Account, cairo, Contract, Provider, uint256, CallData} from "starknet";
import {MY_SWAP_ABI} from "./abi/MY_SWAP.js";
import {ERC_20_ABI} from "./abi/ERC_20.js";
import {ethers} from "ethers";
import readAccounts from "../../libs/readAccounts.js";
import {eth} from "web3";


const do_myswap = async (myswap) => {

}

const main = async () => {
    const argentx_wallets = readAccounts('ArgentX_wallets.json');

    let l2Address = argentx_wallets[0].address;
    const provider = new Provider({rpc: {nodeUrl: process.env.START_NET_URL}});
    const _account = new Account(provider, l2Address, argentx_wallets[0].privateKey);



    const ethContract = new Contract(ERC_20_ABI, process.env.START_L2_ETH_TOKEN_ADDRESS, provider);
    const balance = await ethContract.balanceOf(l2Address);
    console.log(balance.balance.toString())
    //ethContract.connect(_account);
    // const res = await ethContract.approve(myCall.calldata);
    // await provider.waitForTransaction(res.transaction_hash);


    const mySwapContract = new Contract(MY_SWAP_ABI, '0x018a439bcbb1b3535a6145c1dc9bc6366267d923f60a84bd0c7618f33c81d334', provider);
    //mySwapContract.connect(_account);

    // todo update amount
    let amount = ethers.utils.parseEther('0.0001').toNumber();

    //
    // const myCall = mySwapContract.populate("swap", ["4", process.env.START_L2_ETH_TOKEN_ADDRESS, cairo.uint256(100000), cairo.uint256(0)]);
    // const res = await mySwapContract.swap(myCall.calldata);
    // await provider.waitForTransaction(res.transaction_hash);

    const calls = [
        {
            contractAddress: process.env.START_L2_ETH_TOKEN_ADDRESS,
            entrypoint: 'approve',
            calldata: ['0x018a439bcbb1b3535a6145c1dc9bc6366267d923f60a84bd0c7618f33c81d334', cairo.uint256(amount)]
        },
        {
            contractAddress: '0x018a439bcbb1b3535a6145c1dc9bc6366267d923f60a84bd0c7618f33c81d334',
            entrypoint: 'swap',
            calldata: ["4", process.env.START_L2_ETH_TOKEN_ADDRESS, cairo.uint256(amount), cairo.uint256(0)]
        }
    ]


    const result = await _account.execute(calls)

    const multiCall = await provider.waitForTransaction(result.transaction_hash);
    console.log( multiCall.transaction_hash);




}

export default main();