import readAccounts from "../../libs/readAccounts.js";
import {Account, Contract, Provider} from "starknet";
import {utils} from 'starknetid.js';
import "dotenv/config";
import {ethers} from "ethers";

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
    const L2TokenContract = new Contract(abi, process.env.START_L2_DELEGATE_PROXY_TOKEN_ADDRESS, provider);
    const balance = await L2TokenContract.balanceOf(l2Address);
    return ethers.utils.formatEther(balance.balance);
}

const mint_domain = async (domain, wallet) => {
    const provider = new Provider({sequencer: {baseUrl: process.env.START_NET_URL}});
    const L2SendPrivateKey = wallet.privateKey;
    const L2SendAddress = wallet.address;

    console.log(`Account：${L2SendAddress} Beginning mint domain: ${domain}`);
    const abiprice = [{
        "inputs": [
            {
                "name": "domain",
                "type": "felt"
            },
            {
                "name": "days",
                "type": "felt"
            }
        ],
        "name": "compute_renew_price",
        "outputs": [
            {
                "name": "erc20_address",
                "type": "felt"
            },
            {
                "name": "price",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }]

    const privateKey = L2SendPrivateKey;
    const accountAddress = L2SendAddress;
    const _account = new Account(provider, accountAddress, privateKey);


    const _domain = utils.encodeDomain(domain)[0].toString()
    const token_id = Math.floor(1e12 * Math.random())
    const PriceContract = new Contract(abiprice, '0x012bfb305562ff88860883f4d839d3a5f888ed1921aa1e7528dc9b8bcbd98e65', provider);

    const gas_fee = await PriceContract.compute_renew_price(`${_domain}`, '365')
    const calls = [
        {
            contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            entrypoint: "approve",
            calldata: ["0x003bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce", gas_fee.price, 0]
        },
        {
            contractAddress: '0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d',
            entrypoint: "mint",
            calldata: [token_id]
        },
        {
            contractAddress: '0x003bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce',
            entrypoint: "buy",
            calldata: [token_id, _domain, 365, 0, _account.address]
        },
        {
            contractAddress: '0x003bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce',
            entrypoint: "set_address_to_domain",
            calldata: [1, _domain]
        }
    ]
    const multiCall = await _account.execute(calls)
    console.log('Mint commited ,wait for on-chain confirmation, transaction hash: ', multiCall.transaction_hash);
    await provider.waitForTransaction(multiCall.transaction_hash, {retryInterval: 60 * 1000});
    console.log('Mint is complete, please go to your on-chain browser to view');
}
const main = async () => {
    let domain = `${Math.floor(Math.random() * 100000000000)}`;
    const argentx_wallets = readAccounts('ArgentX_wallets.json');

    for (let i = 0; i < argentx_wallets.length; i++) {

        try {
            const address = argentx_wallets[i].address;
            const ethBalance = await get_balnce(address);
            console.log(` Index:${i} Address: ${address}  ETH_Balance: ${ethBalance}`);
            if (ethBalance <= 0.00000001) {
                console.log(` ERR: Index:${i} Address: ${address} Insufficient balance`);
                continue;
            }

            // begin mint domain
            await mint_domain(domain, argentx_wallets[i]);
        } catch (err) {
            console.log(`Address: ${argentx_wallets[i].address}, Mint domain failed: \n`, err);
        }

    }
}
export default main();