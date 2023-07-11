import {BN, Wallet, Contract, WalletUnlocked, Provider, ContractFactory} from "fuels";
import {join} from "path";
import {readFileSync} from 'fs';


async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length; i++) {
        const PRIVATE_KEY = wallets[i].privateKey;
        const provider = new Provider('https://beta-3.fuel.network/graphql');
        const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
        const balance = new BN(await wallet.getBalance()).toNumber();
        console.log(`Address: ${wallets[i].address}  Balance: ${balance}`);
        if (balance <= 1) {
            console.log(`Address: ${wallets[i].address} Insufficient balance ${balance}`);
            continue;
        }

        const byteCodePath = join(__dirname, './abi/counter-contract.bin')
        const byteCode = readFileSync(byteCodePath);


        const abiJsonPath = join(__dirname, `./abi/counter-contract-abi.json`);
        const abi = JSON.parse(readFileSync(abiJsonPath, 'utf8'));


        // #region contract-setup-3
        const factory = new ContractFactory(byteCode, abi, wallet);
        const contract = await factory.deployContract({
            gasLimit: 1000,
            gasPrice: 1,
        });
        // #endregion contract-setup-3
        console.log(`Contract address: ${contract.id.toAddress()}, Contract address(B256): ${contract.id.toB256()}`)

        // #region contract-setup-4
        const {value} = await contract.functions.count().get();
        console.log(value);


    }
}

main().catch(console.error);

