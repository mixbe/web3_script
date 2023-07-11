import {BN, bn, Wallet, Contract, WalletUnlocked, Provider, ContractFactory, Address} from "fuels";
import {join} from "path";
import {readFileSync} from 'fs';


const ZERO = bn(0);
const gasPrice = 1;
const gasLimit = 100000;
const DAI_CONTRACT_ADDRESS = 'fuel1pkd7yhmtaawfgh8yfkmykv76jg6lhudf76gznp5cmzv664g2htssx8pqs3';
const sETH_CONTRACT_ADDRESS = 'fuel1r00wm9hwre0v5z736lhwk5ws8vpq9s067aj0asdjw6az04wkrkys8ttuy8';
const EXCHANGE_CONTRACT_ADDRESS = 'fuel1qp8l9vahnfnur4t5l2z222h5dn6zm0q6cq3f6ylv0qpyvrk7jyvqk7ya82';

async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length; i++) {
        const provider = new Provider('https://beta-3.fuel.network/graphql');
        const wallet = Wallet.fromPrivateKey(wallets[i].privateKey, provider);
        const balance = new BN(await wallet.getBalance()).toNumber();
        console.log(`Address: ${wallets[i].address}  Balance: ${balance}`);
        if (balance <= 1) {
            console.log(`Address: ${wallets[i].address} Insufficient balance ${balance}`);
            continue;
        }
        const abiJsonPath = join(__dirname, `./abi/exchange-contract-abi.json`);
        const abiJSON = JSON.parse(readFileSync(abiJsonPath, 'utf8'));

        const contract: Contract = new Contract(Address.fromString(EXCHANGE_CONTRACT_ADDRESS),
            abiJSON,
            wallet);

        try {
            let amount = 1200000000;
            console.log("DAI -> sETH")
            const {value: minAmount} = await contract.functions
                .get_swap_with_minimum(amount)
                .callParams({
                    forward: [0, Address.fromString(DAI_CONTRACT_ADDRESS).toB256()],
                })
                .txParams({
                    gasPrice: ZERO,
                })
                .get();
            console.log(minAmount);
            console.log(new BN(minAmount.amount).toNumber());


            const blockHeight = await provider.getBlockNumber();
            const deadline = blockHeight?.add(1000);
            const {transactionResult} = await contract.functions
                .swap_with_minimum(minAmount.amount, deadline)
                .callParams({
                    forward: [amount, Address.fromString(DAI_CONTRACT_ADDRESS).toB256()],
                })
                .txParams({
                        variableOutputs: 2,
                        gasLimit,
                        gasPrice
                    }
                ).call();

            console.log("Tx hash: ", transactionResult.transactionId);
        } catch (err) {
            console.log("DAI -> sETH failed", err);
        }


        try {
            let amount = 1000000;
            console.log("sETH -> DAI")
            const {value: minAmount} = await contract.functions
                .get_swap_with_minimum(amount)
                .callParams({
                    forward: [0, Address.fromString(sETH_CONTRACT_ADDRESS).toB256()],
                })
                .txParams({
                    gasPrice: ZERO,
                })
                .get();
            console.log(minAmount);
            console.log(new BN(minAmount.amount).toNumber());


            const blockHeight = await provider.getBlockNumber();
            const deadline = blockHeight?.add(1000);
            const {transactionResult} = await contract.functions
                .swap_with_minimum(minAmount.amount, deadline)
                .callParams({
                    forward: [amount, Address.fromString(sETH_CONTRACT_ADDRESS).toB256()],
                })
                .txParams({
                        variableOutputs: 2,
                        gasLimit,
                        gasPrice
                    }
                ).call();
            console.log("Tx hash: ", transactionResult.transactionId);
        } catch (err) {
            console.log("sETH -> DAI failed", err);
        }

    }
}

main().catch(console.error);

