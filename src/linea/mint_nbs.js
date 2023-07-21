import "dotenv/config";
import {ethers} from "ethers";
import readAccounts from "../../libs/readAccounts.js";

const contract_address = '0xeba2e9bd066dbce1b93a4007ef5431c234cbc7ae';


const deTransfer = async (wallet, to_address) => {
    const tx = {
        to: to_address,
        value: ethers.utils.parseEther("0.0005"),
        gasLimit: 21000
    }

    const receipt = await wallet.sendTransaction(tx);
    await receipt.wait(1) // 等待链上确认交易
    console.log(receipt.hash);
}

const doMint = async (wallet) => {
    console.log(await wallet.getBalance())
    const tx = {
        to: contract_address,
        value: ethers.utils.parseEther("0.00013"),
        data: `0x1e83409a000000000000000000000000${wallet.address.substring(2).toLowerCase()}`,
        gasLimit: 100000
    }

    const receipt = await wallet.sendTransaction(tx)
    //await receipt.wait(1) // 等待链上确认交易
    //console.log(receipt.hash) // 打印交易详情
}

const doTransferERC20 = async (wallet, erc20Address, toAddress, amount = ethers.utils.parseEther("50")) => {
    const abi = [
        "function balanceOf(address) public view returns(uint)",
        "function transfer(address, uint) public returns (bool)",
    ];
    const contractWETH = new ethers.Contract(erc20Address, abi, wallet);
    const tx = await contractWETH.transfer(toAddress, amount);
    await tx.wait(1);
    console.log(tx.hash) // 打印交易详情
}

const main = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://linea-mainnet.infura.io/v3/cd30803d26da4f27be76214ca8ae2f1c');
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);

    const accounts = readAccounts('Linea_wallets.json');


    // // do transfer
    // for (let i = 91; i < 100; i++) {
    //     console.log(`Transfer index: ${i}, address: ${accounts[i].address}`);
    //     await deTransfer(wallet, accounts[i].address);
    // }


    // do mint
    for (let i = 88; i < 100; i++) {
        console.log(`Do mint  index: ${i}, address: ${accounts[i].address}`);
        const account_wallet = new ethers.Wallet(accounts[i].privateKey, provider);
        console.log(await account_wallet.getBalance())
        await doMint(account_wallet);
    }

}

export default main();


