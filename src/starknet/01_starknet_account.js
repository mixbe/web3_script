import {CallData, ec, hash, stark} from 'starknet';
import dayjs from "dayjs";
import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

const create_argent_account = async (numbers = 10) => {
    let wallets = [];
    for (let i = 0; i < numbers; i++) {
        console.log(`Beginning Index:${i} create account.....`);
        // Generate public and private key pair.
        const privateKeyAX = stark.randomAddress();
        const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

        // Calculate future address of the ArgentX account
        const AXproxyConstructorCallData = CallData.compile({
            implementation: process.env.ARGENT_X_ACCOUNT_CLASS_HASH,
            selector: hash.getSelectorFromName("initialize"),
            calldata: CallData.compile({signer: starkKeyPubAX, guardian: "0"}),
        });
        const AXcontractAddress = hash.calculateContractAddressFromHash(
                starkKeyPubAX,
                process.env.ARGENT_X_PROXY_CLASS_HASH,
                AXproxyConstructorCallData,
                0
            )
        ;
        wallets.push({
            index: i,
            address: AXcontractAddress,
            privateKey: privateKeyAX
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