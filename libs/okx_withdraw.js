import * as dotenv from "dotenv";
import CryptoJS from "crypto-js";
import axios from "axios";
import readAccounts from "./readAccounts.js";

dotenv.config();


// https://www.okx.com/docs-v5/en/#overview-api-resources-and-support
const BASE_URL = 'https://aws.okx.com'
const apiKey = process.env.OKX_API_KEY ?? "xxx";
const secretKey = process.env.OKX_SECRET_KEY ?? "xxx";
const passPhrase = process.env.OKX_PASS_PHRASE ?? "xxx";


/**
 * Get current withdraw fee
 *
 * @param ccy
 * @returns {Promise<*>}
 */
async function getCurrencies(ccy = "ETH") {
    if (apiKey.indexOf('xxx') !== -1) throw new Error('ERROR: OKX_API_KEY');
    if (secretKey.indexOf('xxx') !== -1) throw new Error('ERROR: OKX_SECRET_KEY');
    if (passPhrase.indexOf('xxx') !== -1) throw new Error('ERROR: OKX_PASS_PHRASE');

    const timestamp = new Date().toISOString();
    const path = `/api/v5/asset/currencies?ccy=${ccy}`;
    const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + "GET" + path, secretKey));
    try {
        let result = await axios.get(BASE_URL + path, {
            headers: {
                "OK-ACCESS-KEY": apiKey,
                "OK-ACCESS-SIGN": sign,
                "OK-ACCESS-TIMESTAMP": timestamp,
                "OK-ACCESS-PASSPHRASE": passPhrase,
                "Content-Type": "application/json",
            }
        });
        const chain = result.data.data.filter((coin) => coin.chain === "ETH-ERC20");
        return chain[0].minFee;

    } catch (error) {
        console.log(`Get  ${ccy} withdrawal fee failed: `, error);
    }
}

/**
 * Withdrawal of tokens
 *
 * https://www.okcoin.com/docs-v5/en/#rest-api-funding-withdrawal
 * @param ccy
 * @param amt
 * @param fee
 * @param toAddress
 * @returns {Promise<void>}
 */
export async function withdraw(ccy = "ETH", amt, fee = 0, toAddress = []) {
    const path = `/api/v5/asset/withdrawal`;
    for (let i = 0; i < toAddress.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const withdrawParams = {
            ccy,
            dest: 4,
            amt,
            toAddr: toAddress[i].address,
            fee,
            chain: "ETH-ERC20",
        }

        const timestamp = new Date().toISOString();
        const sign = CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA256(
                timestamp + "POST" + path + JSON.stringify(withdrawParams),
                secretKey
            )
        );

        try {
            let result = await axios.post(
                BASE_URL + path,
                withdrawParams,
                {
                    headers: {
                        "OK-ACCESS-KEY": apiKey,
                        "OK-ACCESS-SIGN": sign,
                        "OK-ACCESS-TIMESTAMP": timestamp,
                        "OK-ACCESS-PASSPHRASE": passPhrase,
                        "Content-Type": "application/json",
                    }
                }
            );
            if (result.data.code === 0) {
                console.log(`Withdraw Success  ${i}：`);
            } else {
                console.log(`Withdraw Success  ${i}：`, result.data);
            }
        } catch (error) {
            console.log(`Withdraw Failed ：${i}`, error);
        }
    }
}

export async function main() {
    const start = +new Date();
    console.log("Withdrawal starts...");

    try {
        let accounts = readAccounts();
        const fee = await getCurrencies();
        console.log("fee: ", fee);
        await withdraw("ETH", 0.01, fee, accounts);

    } catch (error) {
        console.log("Withdrawal failed: ....", error)
    }

    const end = +new Date();
    console.log(`Withdrawal is over, Time consuming: ${end - start}ms`);
}

main();

export default main;