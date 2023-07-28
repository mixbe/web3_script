import {BN, bn, Wallet, Contract, WalletUnlocked, Provider, ContractFactory, Address} from "fuels";
import {join} from "path";
import {readFileSync} from 'fs';

const gasPrice = 1;
const gasLimit = 100000;
const DAI_CONTRACT_ADDRESS = 'fuel1pkd7yhmtaawfgh8yfkmykv76jg6lhudf76gznp5cmzv664g2htssx8pqs3';
const sETH_CONTRACT_ADDRESS = 'fuel1r00wm9hwre0v5z736lhwk5ws8vpq9s067aj0asdjw6az04wkrkys8ttuy8';
const EXCHANGE_CONTRACT_ADDRESS = 'fuel1qp8l9vahnfnur4t5l2z222h5dn6zm0q6cq3f6ylv0qpyvrk7jyvqk7ya82';
const DAI_ID = '0x0d9be25f6bef5c945ce44db64b33da9235fbf1a9f690298698d899ad550abae1';
const sETH_id = '0x1bdeed96ee1e5eca0bd1d7eeeb51d03b0202c1faf764fec1b276ba27d5d61d89';


function randomNum(minNum, maxNum) {
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length - 1; i++) {
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
            console.log("sETH -> DAI")
            const balance = new BN(await wallet.getBalance(sETH_id)).toNumber()
            console.log(`Current sETH balance: ${balance}`);

            let amount = randomNum(100000, 5000000);
            console.log(`Swap amount: ${amount}`);
            if (amount < balance) {
                // const {value: minAmount} = await contract.functions
                //     .get_swap_with_minimum(amount)
                //     .callParams({
                //         forward: [0, Address.fromString(sETH_CONTRACT_ADDRESS).toB256()],
                //     })
                //     .txParams({
                //         gasPrice: ZERO,
                //     })
                //     .get();
                // console.log(minAmount);
                // console.log(new BN(minAmount.amount).toNumber());


                const blockHeight = await provider.getBlockNumber();
                const deadline = blockHeight?.add(1000);
                const {transactionResult} = await contract.functions
                    .swap_with_minimum(1, deadline)
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
            }

        } catch (err) {
            console.log("sETH -> DAI failed", err);
        }

        try {
            console.log("DAI -> sETH")
            const balance = new BN(await wallet.getBalance(DAI_ID)).toNumber()
            console.log(`Current DAI balance: ${balance}`);

            let amount = randomNum(100000000, 50000000000);
            console.log(`Swap amount: ${amount}`);
            if (amount < balance) {
                //     const {value: minAmount} = await contract.functions
                //         .get_swap_with_minimum(amount)
                //         .callParams({
                //             forward: [0, Address.fromString(DAI_CONTRACT_ADDRESS).toB256()],
                //         })
                //         .txParams({
                //             gasPrice: ZERO,
                //         })
                //         .get();
                //     console.log(minAmount);
                //     console.log(new BN(minAmount.amount).toNumber());

                const blockHeight = await provider.getBlockNumber();
                const deadline = blockHeight?.add(1000);
                const {transactionResult} = await contract.functions
                    .swap_with_minimum(1, deadline)
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
            }
        } catch (err) {
            console.log("DAI -> sETH failed", err);
        }

    }
}

main().catch(console.error);

