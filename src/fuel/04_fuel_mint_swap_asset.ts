import {BN, Wallet, Contract, WalletUnlocked, Provider, ContractFactory, Address} from "fuels";
import {join} from "path";
import {readFileSync} from 'fs';


const gasPrice = 1;
const gasLimit = 100000;
const DAI_CONTRACT_ADDRESS = 'fuel1pkd7yhmtaawfgh8yfkmykv76jg6lhudf76gznp5cmzv664g2htssx8pqs3';
const sETH_CONTRACT_ADDRESS = 'fuel1r00wm9hwre0v5z736lhwk5ws8vpq9s067aj0asdjw6az04wkrkys8ttuy8';
const DAI_ID = '0x0d9be25f6bef5c945ce44db64b33da9235fbf1a9f690298698d899ad550abae1';
const sETH_id = '0x1bdeed96ee1e5eca0bd1d7eeeb51d03b0202c1faf764fec1b276ba27d5d61d89';

async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length; i++) {
        const PRIVATE_KEY = wallets[i].privateKey;
        const provider = new Provider('https://beta-3.fuel.network/graphql');
        const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
        const balance = new BN(await wallet.getBalance()).toNumber();
        console.log(`Address: ${wallets[i].address} ETH Balance: ${balance}`);
        if (balance <= 1) {
            console.log(`Address: ${wallets[i].address} Insufficient balance ${balance}`);
            continue;
        }
        try {
            // mint sETH
            const balance = new BN(await wallet.getBalance(sETH_id)).toNumber()
            console.log(`Current sETH balance: ${balance}`);
            if (balance <= 0.000001) {
                const abiJsonPath = join(__dirname, `./abi/token-contract-abi.json`);
                const abiJSON = JSON.parse(readFileSync(abiJsonPath, 'utf8'));

                const contract: Contract = new Contract(Address.fromString(sETH_CONTRACT_ADDRESS),
                    abiJSON,
                    wallet);
                const {transactionResult} = await contract.functions
                    .mint()
                    .txParams({
                        gasPrice,
                        gasLimit,
                    })
                    .call();
                console.log(transactionResult.status);
            }
        } catch (err) {
            console.log("Mint swap sETH failed: ", err);
        }

        try {
            // mint DAI
            const balance = new BN(await wallet.getBalance(DAI_ID)).toNumber()
            console.log(`Current DAI balance: ${balance}`);
            if (balance < 0.000001) {
                const abiJsonPath = join(__dirname, `./abi/token-contract-abi.json`);
                const abiJSON = JSON.parse(readFileSync(abiJsonPath, 'utf8'));

                const contract: Contract = new Contract(Address.fromString(DAI_CONTRACT_ADDRESS),
                    abiJSON,
                    wallet);
                const {transactionResult} = await contract.functions
                    .mint()
                    .txParams({
                        gasPrice,
                        gasLimit,
                    })
                    .call();
                console.log(transactionResult.status);
            }

        } catch (err) {
            console.log("Mint swap DAI failed: ", err);
        }
    }
}

main().catch(console.error);

