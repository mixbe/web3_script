import {JsonRpcProvider, Connection, Ed25519Keypair, fromB64} from '@mysten/sui.js';


import dayjs from "dayjs";
import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const connection = new Connection({
    fullnode: 'https://fullnode.devnet.sui.io',
    faucet: 'https://faucet.devnet.sui.io/gas',
});

const create_argent_account = async (numbers = 10) => {
    const keypair = new Ed25519Keypair()

    const privateKey = keypair.export().privateKey;
    console.log(keypair.getPublicKey().toSuiAddress());
    console.log(keypair.export().privateKey)

    const keypair2 = Ed25519Keypair.fromSecretKey(fromB64(privateKey))
    console.log(keypair2.getPublicKey().toSuiAddress());
    console.log(keypair2.export().privateKey);

    let wallets = [];
    for (let i = 0; i < numbers; i++) {
        console.log(`Beginning create Sui account..... Index:${i} `);
        // Generate public and private key pair.
        const keypair = new Ed25519Keypair()
        wallets.push({
            index: i,
            address: keypair.getPublicKey().toSuiAddress(),
            privateKey: keypair.export().privateKey
        })
    }
    const date = dayjs().format('YYYY-MM-DD');
    const basePath = join(__dirname, '../../accounts', `${date}_${Date.now()}.json`);
    fs.writeFileSync(basePath, JSON.stringify(wallets, null, "    "));
    console.log("Finished All");
}

// https://www.starknetjs.com/docs/guides/create_account#create-oz-open-zeppelin-account-
const main = async () => {
    await create_argent_account();
}

export default main();