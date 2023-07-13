import {Provider, constants, ec, stark, Account, hash, CallData} from 'starknet';


const main = async () => {
    // const provider = new Provider({sequencer: {network: constants.NetworkName.SN_MAIN}});
    // const provider = new Provider({sequencer: {network: constants.NetworkName.SN_GOERLI}});// for testnet 1
    const provider = new Provider({sequencer: {network: constants.NetworkName.SN_GOERLI2}});  // for testnet 2
    // const account = new Account(provider, accountAddress, privateKey);

    // new Open Zeppelin account v0.5.1 :
    // Generate public and private key pair.
    const privateKey = stark.randomAddress();
    console.log('OZ account : privateKey=', privateKey);
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    console.log('publicKey=', starkKeyPub);

    const OZaccountClassHash = "0x2794ce20e5f2ff0d40e632cb53845b9f4e526ebd8471983f7dbd355b721d5a";
    // Calculate future address of the account
    const OZaccountConstructorCallData = CallData.compile({publicKey: starkKeyPub});
    const OZcontractAddress = hash.calculateContractAddressFromHash(
        starkKeyPub,
        OZaccountClassHash,
        OZaccountConstructorCallData,
        0
    );
    console.log('Precalculated account address=', OZcontractAddress);


}

export default main();