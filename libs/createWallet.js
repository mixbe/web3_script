import {ethers} from "ethers";
import dayjs from 'dayjs';
import fs from 'fs'
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));


export function createWallet(number = 500) {
    const wallets = [];
    for (let i = 0; i < number; i++) {
        const {privateKey, address} = ethers.Wallet.createRandom();
        console.log(privateKey, address);
        wallets.push({
            index: i,
            address: address,
            privateKey: privateKey
        })
    }
    const date = dayjs().format('YYYY-MM-DD');
    const basePath = join(__dirname, '../accounts', `${date}_${Date.now()}.json`);
    fs.writeFileSync(basePath, JSON.stringify(wallets, null, "    "));
}

createWallet()

export default createWallet;