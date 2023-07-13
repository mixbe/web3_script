import {Account, ec, json, stark, Provider,CallData, hash, RpcProvider, Contract} from 'starknet';
import Web3 from 'web3';
import axios from "axios";
import { BigNumber } from "ethers";

// const Web3 = require('web3')
const web3 = new Web3('https://rpc.ankr.com/eth_goerli')
// const axios = require('axios')
// const HttpsProxyAgent = require('https-proxy-agent');

const sleep = (s) => {
    console.log(`延时${s}秒`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, s * 1000)
    })
}

const provider = new RpcProvider({
    nodeUrl: 'https://starknet-goerli.infura.io/v3/21569b7e1ee64e6ba90974e0f1df36c5',
})


// 代理合约
// L1链上的deposit合约地址
const L1DelegateProxyAddress = '0xc3511006C04EF1d78af4C8E0e74Ec18A6E64Ff9e'
// L2上StarkGate ETH Bridge合约地址
const L2DelegateProxyBridgeAddress = '0x073314940630fd6dcda0d772d4c972c4e0a9946bef9dabf4ef84eda8ef542b82'
// L2上StarkGate ETH Token合约地址
const L2DelegateProxyTokenAddress2 = '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'

// L2上的handle_deposit的查询方法地址
const handle_depositSelect = '0x2d757788a8d8d6f21d1cd40bce38a8222d70654214e96ff95d8086e684fbee5'

//Argent X钱包的classhash地址。new Argent X account v0.2.3 :
const argentXproxyClassHash = "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
const argentXaccountClassHash = "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";

// 转账金额
// const transferAmount = 10000000000000000

// 定义L2链上交易查询最长等待时间
const waitTime = 10
const gasLimit = 200000

class Deposit {
    constructor(L1PrivateKey, transferAmount) {  // 类的构造函数  创建opensee的网络连接请求头
        this.L2Address = ''
        this.L2privateKeyAX = ''
        this.L1PrivateKey = L1PrivateKey
        this.transferAmount = transferAmount
        this.L1Account = web3.eth.accounts.privateKeyToAccount(this.L1PrivateKey);
    }

    async post_gas_fee() {
        const url = 'https://alpha4.starknet.io/feeder_gateway/estimate_message_fee?blockNumber=pending';
        // const agent = new HttpsProxyAgent({
        //     host: '127.0.0.1',
        //     port: '23457',
        // });
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
            // web3.utils.toBN(from_address).toString(10)
            "from_address": web3.utils.BN(L1DelegateProxyAddress).toString(10),
            "to_address": L2DelegateProxyBridgeAddress,
            "entry_point_selector": handle_depositSelect,
            "payload": [
                this.L2Address,
                web3.utils.toHex(this.transferAmount),
                web3.utils.toHex(0)
            ]
        };

        try {
            // const response = await axios.post(url, postData, {headers: headers, httpsAgent: agent});
            const response = await axios.post(url, postData, {headers: headers});
            // console.log(response);
            // 获取gas fee
            return response.data.overall_fee
        } catch (error) {
            console.error(error);
        }
    }

    // 将ETH从L1跨链到L2上。
    deposit = async () => {
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
        const contract = new web3.eth.Contract(abi, L1DelegateProxyAddress)

        const functionCallData = contract.methods.deposit(`${this.transferAmount}`, web3.utils.toBN(this.L2Address).toString(10)).encodeABI();

        const tx = {
            from: this.L1Account.address,
            to: L1DelegateProxyAddress,
            value: await this.post_gas_fee() + this.transferAmount,
            gaslimit: gasLimit,
            gasPrice: await web3.eth.getGasPrice(), // 10 Gwei
            data: functionCallData,
        };
        tx.gas = await web3.eth.estimateGas(tx)

        const signed_tx = await web3.eth.accounts.signTransaction(tx, this.L1PrivateKey)
        const res = await web3.eth.sendSignedTransaction(signed_tx.rawTransaction);
        // 获取交易发送的value
        const res_value = await web3.eth.getTransaction(res.transactionHash);
        console.log(`交易已发起，交易状态：${res.status}，交易哈希: ${res.transactionHash}，消耗gas${res.gasUsed}，转账value：${res_value.value}\n`)
    }

    // 请求查询l2链上某个地址的所有转账。
    async get_l2_tx() {
        const url = `https://goerli.starkgate.starknet.io/transfer-log/api/get_transfers?l2address=${this.L2Address}`;
        // const agent = new HttpsProxyAgent({
        //     host: '127.0.0.1',
        //     port: '23457',
        // });
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

        try {
            // const response = await axios.get(url, {headers: headers, httpsAgent: agent});
            const response = await axios.get(url, {headers: headers});
            // 获取交易记录
            return response.data.logs
        } catch (error) {
            console.error(error);
        }
    }

    async get_balnce() {
        // 由于查询余额是访问的 StarkGate: ETH Token 合约，但是他又是一个proxy合约，所以需要从实现合约，去获取balanceOf的abi数据
        // 即：0x000fa904eea70850fdd44e155dcc79a8d96515755ed43990ff4e7e7c096673e7
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
        // 与以太坊链上的代理合约逻辑一样，访问的合约，还是访问 StarkGate: ETH Token 合约，她会自动转发调用到实现合约过去，并返回返回值。
        const L2TokenContract = new Contract(abi, L2DelegateProxyTokenAddress2, provider);
        const balance = await L2TokenContract.balanceOf(this.L2Address)
        // 获取到的数据是一个BN数据，所以需要转为string，但是单位也是wei，需要自己在转换一下。
        return balance.toString()
    }

    createAccount() {
        console.log('开始生成随机argentX钱包');
        let privateKey = stark.randomAddress();
        console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKey);
        // const starkKeyPairAX = ec.starkCurve.getStarkKey(privateKey);
        // const starkKeyPubAX = ec.getStarkKey(starkKeyPairAX);
        const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
        console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPub);

        // Calculate future address of the ArgentX account
        // const AXproxyConstructorCallData = stark.compileCalldata({
        //     implementation: argentXaccountClassHash,
        //     selector: hash.getSelectorFromName("initialize"),
        //     // calldata: stark.compileCalldata({ signer: starkKeyPub, guardian: "0" }),
        //     calldata: stark.compileCalldata({signer: starkKeyPub, guardian: "0"}),
        // });
        // const AXcontractAddress = hash.calculateContractAddressFromHash(
        //     starkKeyPub,
        //     argentXproxyClassHash,
        //     AXproxyConstructorCallData,
        //     0
        // );

        const AXproxyConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
        const AXcontractAddress = hash.calculateContractAddressFromHash(
            starkKeyPub,
            argentXproxyClassHash,
            AXproxyConstructorCallData,
            0
        );

        console.log('钱包生成成功，account address=', AXcontractAddress);
        this.L2Address = AXcontractAddress
        this.L2privateKeyAX = privateKey
        this.AXproxyConstructorCallData = AXproxyConstructorCallData
        this.starkKeyPubAX = starkKeyPub
    }


}

const amount = 10000000000000000
const _L1PrivateKey = ''

const main = async () => {
    console.log('开始跨链转账');
    console.log(BigNumber.from("0x00c0154342F6971DCED31f07d0D6327b8e5e13f03bb4FCbfD6e4b8915C97ad8A").toBigInt().toString(10))
    const account = new Deposit(_L1PrivateKey, amount)
    account.createAccount(_L1PrivateKey, account);
    // 发起转账
    await account.deposit()
    // 转账金额
    let _L2FullAmount
    console.log('开始查询是否已在L2上链');
    for (let i = 0; i <= waitTime; i++) {
        await sleep(61)
        // L2上查询是否产生转账哈希了，此处需要轮询，因为在L1转账完成之后，L2上没法直接查到记录。
        const L2TxLogs = await this.get_l2_tx()
        const NewLog = L2TxLogs[0]

        if (NewLog?.l2TxStatus) {
            console.log(`已查询到交易，等待L2上链确认：${NewLog.l2TxHash}，由于确认时间较长，请耐心等待。`);
            await provider.waitForTransaction(NewLog.l2TxHash);
            _L2FullAmount = NewLog.fullAmount
            console.log(`L2上查询到交易记录最新一笔交易：交易状态：${NewLog.status}，L1交易哈希: ${NewLog.l1TxHash}，L2交易哈希: ${NewLog.l2TxHash}，转账金额${NewLog.fullAmount}`)
            break
        } else {
            console.log('未生成L2交易哈希，继续等待。');
        }
    }
    console.log('查询L2上的ETH余额');
    // 通过L2链上的ETH Token合约，查询钱包余额是否与转账金额一致。
    const L2BalanceETH = await this.get_balnce()
    console.log(`跨链转账已成功！L1转账金额：${this.transferAmount}，L2转账金额： ${_L2FullAmount}，L2链上合约查询余额: ${L2BalanceETH}，\n`)

    // 确认跨链成功之后，还需要设置一下钱包，后面才可以正常交易。
    const accountAX = new Account(provider, this.L2Address, ec.getKeyPair(this.L2privateKeyAX));
    const deployAccountPayload = {
        classHash: argentXproxyClassHash,
        constructorCalldata: this.AXproxyConstructorCallData,
        contractAddress: this.L2Address,
        addressSalt: this.starkKeyPubAX
    };
    // 计算交易哈希。
    const {transaction_hash: AXdAth, contract_address: AXcontractFinalAdress} = await accountAX.deployAccount(deployAccountPayload);

    console.log(`等待交易确认。ArgentX wallet：${AXcontractFinalAdress} deployed hash at：${AXdAth}`);
    await provider.waitForTransaction(AXdAth);
    console.log('钱包设置成功。');
}
export default main();