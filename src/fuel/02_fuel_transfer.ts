import {BN, Wallet, Contract, WalletUnlocked, Provider, Address} from "fuels";
import {NativeAssetId} from '@fuel-ts/address/configs';
import {join} from "path";

function randomNum(minNum, maxNum) {
    return Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
}

async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length; i++) {
        try {
            const PRIVATE_KEY = wallets[i].privateKey;
            const provider = new Provider('https://beta-3.fuel.network/graphql');
            const sender = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
            const balance = new BN(await sender.getBalance()).toNumber();
            console.log(`index: ${i}  Address: ${wallets[i].address}  Balance: ${balance}`);
            if (balance <= 1) {
                console.log(`Address: ${wallets[i].address} Insufficient balance ${balance}`);
                continue;
            }

            let amount = randomNum(100000, balance / 2);
            console.log(`Transfer amount : ${amount / (10**9)}`)
            sender.transfer(sender.address, amount, NativeAssetId, {
                gasLimit: 100,
                gasPrice: 1,
            });

            // const response = await sender.transfer(sender.address, 1000000, NativeAssetId, {
            //     gasLimit: 100,
            //     gasPrice: 1,
            // });
            // console.log("Transaction hash: ", response.id)
        } catch (err) {
            console.log("Transfer failed", err)
        }
    }
}

main().catch(console.error);

