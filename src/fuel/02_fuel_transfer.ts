import {BN, Wallet, Contract, WalletUnlocked, Provider} from "fuels";
import {NativeAssetId} from '@fuel-ts/address/configs';
import {join} from "path";


async function main() {
    const filePaht = join(__dirname, '../../accounts', `fuel_wallets.json`);
    var wallets = require(filePaht);
    for (var i = 0; i < wallets.length; i++) {
        const PRIVATE_KEY = wallets[i].privateKey;
        const provider = new Provider('https://beta-3.fuel.network/graphql');
        const sender = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
        const balance = new BN(await sender.getBalance()).toNumber();
        console.log(`Address: ${wallets[i].address}  Balance: ${balance}`);
        if (balance <= 1) {
            console.log(`Address: ${wallets[i].address} Insufficient balance ${balance}`);
            continue;
        }
        const response = await sender.transfer(sender.address, 100000, NativeAssetId, {
            gasLimit: 100,
            gasPrice: 1,
        });
        await response.wait();
        console.log("Transaction hash: ", response.id)
    }

    return
    // const myWallet: WalletUnlocked = Wallet.generate();
    // console.log(myWallet.publicKey)
    // console.log(myWallet.address)
    // console.log(myWallet.privateKey)

    // address fuel1wghfrzm0d7xmfgmn5q6j5xpny8e80qmjxtvr754qpddrdj6zduqs8ja3s6
    // private 0x8db05cdad7ae79b798677136d3849726f74d8a41f2c633dd3e63b5377f11a61c


    // const provider = new Provider("https://beta-3.fuel.network/graphql");
    // const myWallet = Wallet.fromAddress("fuel122zwtl078gprtd8s8q9cm2ymff0jxk9qw6dxjyxmamlv5vxgjr7qd4ewap", provider);
    // const balance = await myWallet.getBalance();
    // console.log(new BN(balance).toNumber())


    // const PRIVATE_KEY = '0x8db05cdad7ae79b798677136d3849726f74d8a41f2c633dd3e63b5377f11a61c';
    // const provider = new Provider('https://beta-3.fuel.network/graphql');
    //
    //
    // const sender = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
    // const balance = new BN(await sender.getBalance()).toNumber();
    //
    //
    // console.log(balance);
    //
    // const receiver = Wallet.fromAddress('fuel122zwtl078gprtd8s8q9cm2ymff0jxk9qw6dxjyxmamlv5vxgjr7qd4ewap')
    // //const receiver = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
    //
    //
    // const response = await sender.transfer(sender.address, 100000, NativeAssetId, {
    //     gasLimit: 100,
    //     gasPrice: 1,
    // });
    // await response.wait();
    // console.log("Transaction hash: ", response.id)

    // const senderBalances = await sender.getBalances();
    // const receiverBalances = await receiver.getBalances();


    // // Setup a private key
    // const PRIVATE_KEY = '0x8db05cdad7ae79b798677136d3849726f74d8a41f2c633dd3e63b5377f11a61c';
    //
    // // Create the wallet, passing provider
    // const wallet: WalletUnlocked = Wallet.fromPrivateKey(PRIVATE_KEY, provider);


    // const wallet = Wallet.fromPrivateKey(PRIVATE_KEY); // private key with coins
    // const contractId = "0x...";
    // const contract = new Contract(contractId, abi, wallet);
    //
    // // All contract methods are available under functions
    // const {transactionId, value} = await contract.functions
    //     .foo<[BigNumberish], BN>("bar")
    //     .call();
    //
    // console.log(transactionId, value);

}

main().catch(console.error);

