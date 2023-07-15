import {Account, CallData, Contract, ec, hash, Provider} from "starknet";
import readAccounts from "../../libs/readAccounts.js";
import "dotenv/config"
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
    const L2TokenContract = new Contract(abi, process.env.START_L2_ETH_TOKEN_ADDRESS, provider);
    const balance = await L2TokenContract.balanceOf(l2Address);
    return ethers.utils.formatEther(balance.balance);
}

/**
 * If you have sent enough fund to this new address, you can go forward to the final step
 * https://www.starknetjs.com/docs/guides/create_account#deployment-of-the-new-account-1
 *
 * @returns {Promise<void>}
 */
const main = async () => {
    const argentx_wallets = readAccounts('ArgentX_wallets.json');
    const provider = new Provider({sequencer: {baseUrl: process.env.START_NET_URL}});

    for (let i = 0; i < argentx_wallets.length; i++) {
        console.log(`Beginning Index:${i} deployment ArgentX account.....`);
        try {
            const address = argentx_wallets[i].address;
            const ethBalance = await get_balnce(address);
            console.log(` Index:${i} Address: ${address}  ETH_Balance: ${ethBalance}`);
            if (ethBalance <= 0.00000001) {
                console.log(` ERR: Index:${i} Address: ${address} Insufficient balance`);
                continue;
            }
            const privateKeyAX = argentx_wallets[i].privateKey;

            const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
            const AXproxyConstructorCallData = CallData.compile({
                implementation: process.env.ARGENT_X_ACCOUNT_CLASS_HASH,
                selector: hash.getSelectorFromName("initialize"),
                calldata: CallData.compile({signer: starkKeyPubAX, guardian: "0"}),
            });
            const accountAX = new Account(provider, address, privateKeyAX);

            const deployAccountPayload = {
                classHash: process.env.ARGENT_X_PROXY_CLASS_HASH,
                constructorCalldata: AXproxyConstructorCallData,
                contractAddress: address,
                addressSalt: starkKeyPubAX
            };

            const {transaction_hash: AXdAth, contract_address: AXcontractFinalAdress} = await accountAX.deployAccount(deployAccountPayload);
            console.log(`✅ ArgentX wallet deployed AXdAth: ${AXdAth} ContractAddress: ${AXcontractFinalAdress}`);
        } catch (err) {
            console.log(`Address: ${argentx_wallets[i].address}, Deployment of the new account failed: \n`, err);
        }
    }
}
export default main();