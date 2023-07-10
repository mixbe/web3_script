import {ethers} from "ethers";
import axios from "axios";


let url = "https://api.lens.dev/"


let config = {
    headers: {
        'referer': 'https://lenster.xyz/',
        'origin': 'https://lenster.xyz',
        'authority': 'api.lens.dev',
        'pragma': 'no-cache',
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    }
};



let getMessage = async (address) => {
    let payload = {
        "operationName": "Challenge",
        "variables": {
            "request": {
                "address": `${address}`
            },
        },
        "query":"query Challenge($request: ChallengeRequest!) {\n  challenge(request: $request) {\n    text\n    __typename\n  }\n}\n"
    };


    try {
        let res = await axios.post(url, payload, config);
        return res.data.data.challenge.text;
    } catch (err) {
        console.log(`${address}---获取签名信息失败: ${err}`);
        return false
    }
}

let sendLogin = async (address, signature) => {
    let payload = {
        "operationName": "Authenticate",
        "variables": {
            "request": {
                "address": `${address}`,
                "signature": `${signature}`
            }
        },
        "query":"mutation Authenticate($request: SignedAuthChallenge!) {\n  authenticate(request: $request) {\n    accessToken\n    refreshToken\n    __typename\n  }\n}\n"
    };
    try {
        let res = await axios.post(url, payload, config);
        return {
            "walletAddress": address,
            "accessToken": res.data.data.authenticate.accessToken,
            "refreshToken": res.data.data.authenticate.refreshToken
        }
    } catch (err) {
        console.log(`${address}---登录失败: ${err}`);
        return false
    }
}

let login = async (pk) => {
    let wallet = new ethers.Wallet(pk);
    let message = await getMessage(wallet.address);

    let signature = await wallet.signMessage(message);
    let result = await sendLogin(wallet.address, signature);
    return result;
}

export {
    login
}