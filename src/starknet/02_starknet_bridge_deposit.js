import {Contract, Provider} from 'starknet';
import Web3 from 'web3';
import axios from "axios";
import 'dotenv/config';
import readAccounts from "../../libs/readAccounts.js";
import {ethers} from "ethers";

const web3 = new Web3(process.env.ETH_NODE_URL)

async function get_gas_fee(l2Address, transferAmount) {
    const url = 'https://alpha4.starknet.io/feeder_gateway/estimate_message_fee?blockNumber=pending';
    const headers = {
        'authority': 'alpha4.starknet.io',
        'accept': '*/*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'content-type': 'application/json',
        'origin': 'https://goerli.starkgate.starknet.io',
        'sec-ch-ua': '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
    };
    const postData = {
        "from_address": web3.utils.hexToNumberString(process.env.START_L1_DELEGATE_PROXY_ADDRESS),
        "to_address": process.env.START_L2_GATE_PROXY_BRIDGE_ADDRESS,
        "entry_point_selector": process.env.START_L2_HANDLE_DEPOSIT,
        "payload": [
            l2Address,
            web3.utils.toHex(transferAmount),
            web3.utils.toHex(0)
        ]
    };
    try {
        const response = await axios.post(url, postData, {headers: headers});
        // gas fee
        return response.data.overall_fee
    } catch (error) {
        console.error("post_gas_fee err: ", error);
    }
}

async function get_balnce(l2Address) {
    const provider = new Provider({sequencer: {baseUrl: process.env.START_NET_URL}});
    const abi = [{
        "name": "balanceOf",
        "type": "function",
        "inputs": [
            {
                "name": "account",
                "type": "felt"
            }
        ],
        "outputs": [
            {
                "name": "balance",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view"
    }]
    const L2TokenContract = new Contract(abi, process.env.START_L2_ETH_TOKEN_ADDRESS, provider);
    const balance = await L2TokenContract.balanceOf(l2Address);
    return ethers.utils.formatEther(balance.balance);
}

async function deposit(l1PrivateKey, l2address, transferAmount) {
    const abi = [
        {
            "inputs": [
                {"internalType": "uint256", "name": "amount", "type": "uint256"},
                {"internalType": "uint256", "name": "l2Recipient", "type": "uint256"}],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }]
    const contract = new web3.eth.Contract(abi, process.env.START_L1_DELEGATE_PROXY_ADDRESS)
    const functionCallData = contract.methods.deposit(transferAmount, l2address).encodeABI();
    const l1Account = web3.eth.accounts.privateKeyToAccount(l1PrivateKey);
    const tx = {
        from: l1Account.address,
        to: process.env.START_L1_DELEGATE_PROXY_ADDRESS,
        value: await get_gas_fee(l2address, transferAmount) + transferAmount,
        gaslimit: 200000,
        gasPrice: (await web3.eth.getGasPrice()).toString(), // 10 Gwei
        data: functionCallData
    };
    let gas = await web3.eth.estimateGas(tx);
    tx.gas = gas.toString()
    console.log(tx)
    const signed_tx = await web3.eth.accounts.signTransaction(tx, l1PrivateKey)
    const res = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
    const res_value = await web3.eth.getTransaction(res.transactionHash);
    console.log(`transaction sent，status：${res.status},tx_hash: ${res.transactionHash}， gas${res.gasUsed},value：${res_value.value}`)
    console.log(`After waiting for a few minutes, you can check the transaction event through this link: ${process.env.START_TRANSFER_LOG_URL}${l2address}`)
}


const main = async () => {
    const erc20_wallets = readAccounts('erc20_wallets.json');
    const argentx_wallets = readAccounts('ArgentX_wallets.json');
    // todo update amount

    let amount = ethers.utils.parseEther('0.001').toNumber();
    for (let i = 0; i < erc20_wallets.length; i++) {
        console.log(`Beginning Index:${i} startnet bridge deposit.....`);
        if (i >= argentx_wallets.length) {
            console.log(`Index: ${i} Not enough Argent X Wallets`);
            return;
        }
        try {
            console.log(`Before bridge L2 ${argentx_wallets[i].address} balance: ${await get_balnce(argentx_wallets[i].address)}`)
            await deposit(erc20_wallets[i].privateKey, argentx_wallets[i].address, amount)
        } catch (err) {
            console.log("Beginning Index:${i} startnet bridge deposit failed", err)
        }
    }
}
export default main();