import {CallData, ec, hash, stark} from 'starknet';
import dayjs from "dayjs";
import fs from "fs";
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const create_argent_account = async (numbers = 10) => {
    let wallets = [];
    for (let i = 0; i < numbers; i++) {
        //new Argent X account v0.2.3 :
        const argentXproxyClassHash = "0x25ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918";
        const argentXaccountClassHash = "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2";

        // Generate public and private key pair.
        const privateKeyAX = stark.randomAddress();
        console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKeyAX);
        const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
        console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPubAX);

        // Calculate future address of the ArgentX account
        const AXproxyConstructorCallData = CallData.compile({
            implementation: argentXaccountClassHash,
            selector: hash.getSelectorFromName("initialize"),
            calldata: CallData.compile({signer: starkKeyPubAX, guardian: "0"}),
        });
        const AXcontractAddress = hash.calculateContractAddressFromHash(
            starkKeyPubAX,
            argentXproxyClassHash,
            AXproxyConstructorCallData,
            0
        );
        wallets.push({
            index: i,
            address: AXcontractAddress,
            privateKey: privateKeyAX
        })
    }
    const date = dayjs().format('YYYY-MM-DD');
    const basePath = join(__dirname, '../../accounts', `${date}_${Date.now()}.json`);
    fs.writeFileSync(basePath, JSON.stringify(wallets, null, "    "));
}

// https://www.starknetjs.com/docs/guides/create_account#create-oz-open-zeppelin-account-
const main = async () => {
    await create_argent_account();
}

export default main();