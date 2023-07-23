import readAccounts from "../../libs/readAccounts.js";
import {devnetConnection, Ed25519Keypair, fromB64, JsonRpcProvider, RawSigner, TransactionBlock} from "@mysten/sui.js";


const provider = new JsonRpcProvider(devnetConnection);

const main = async () => {
    const sui_wallets = readAccounts('sui_wallets.json');
    // for (let i = 0; i < sui_wallets.length; i++) {
    //     const keypair = Ed25519Keypair.fromSecretKey(fromB64(sui_wallets[i].privateKey));
    //     console.log(keypair.getPublicKey().toSuiAddress())
    // }


    const keypair = Ed25519Keypair.fromSecretKey(fromB64(sui_wallets[0].privateKey));
    const keypair_1 = Ed25519Keypair.fromSecretKey(fromB64(sui_wallets[1].privateKey));

    const address = keypair.getPublicKey().toSuiAddress();

    console.log(address);

    const coinBalance = await provider.getBalance({
        owner: address
    });
    console.log(coinBalance)


    // transfer
    // const signer = new RawSigner(keypair, provider);
    // const tx = new TransactionBlock();
    // const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000)]);
    // const to_address = keypair_1.getPublicKey().toSuiAddress();
    //
    // tx.transferObjects([coin], tx.pure(to_address));
    // const result = await signer.signAndExecuteTransactionBlock({
    //     transactionBlock: tx,
    // });
    // console.log({result});
    // console.log(await provider.getBalance({
    //     owner: to_address
    // }))


    // const signer = new RawSigner(keypair, provider);
    // const tx = new TransactionBlock();
    // const [coin] = tx.splitCoins(tx.gas, [tx.pure(1000)]);
    // tx.transferObjects([coin], tx.pure(keypair.getPublicKey().toSuiAddress()));
    // const result = await signer.signAndExecuteTransactionBlock({
    //     transactionBlock: tx,
    // });
    // console.log({ result });


}

export default main();