import axios from "axios";
import {login} from "./login.js";


let userProfiles = async(address, accessToken) => {
    let url = "https://api.lens.dev/"
    let config = {
        headers: {
            "x-access-token": `Bearer ${accessToken}`,
            'referer': 'https://lenster.xyz/',
            'origin': 'https://lenster.xyz',
            'authority': 'api.lens.dev',
            'pragma': 'no-cache',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        }
    };
    let payload = {
        "operationName": "UserProfiles",
        "variables": {
            "ownedBy": `${address}`
        },
        "query": "query UserProfiles($ownedBy: [EthereumAddress!]) {\n  profiles(request: {ownedBy: $ownedBy}) {\n    items {\n      ...ProfileFields\n      interests\n      isDefault\n      dispatcher {\n        address\n        canUseRelay\n        sponsor\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ProfileFields on Profile {\n  id\n  name\n  handle\n  bio\n  ownedBy\n  isFollowedByMe\n  stats {\n    totalFollowers\n    totalFollowing\n    totalPosts\n    totalComments\n    totalMirrors\n    __typename\n  }\n  attributes {\n    traitType\n    key\n    value\n    __typename\n  }\n  picture {\n    ... on MediaSet {\n      original {\n        url\n        __typename\n      }\n      __typename\n    }\n    ... on NftImage {\n      uri\n      tokenId\n      contractAddress\n      chainId\n      __typename\n    }\n    __typename\n  }\n  coverPicture {\n    ... on MediaSet {\n      original {\n        url\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  followModule {\n    __typename\n  }\n  __typename\n}\n"
    };
    try{
        let res = await axios.post(url, payload, config);
        return {
            // "id": res.data.data.profile.id,
            // "name": res.data.data.profile.name,
            // "handle": res.data.data.profile.handle,
            // "totalFollowers": res.data.data.profile.stats.totalFollowers,
            // "totalFollowing": res.data.data.profile.stats.totalFollowing,
            "id": res.data.data.profiles.items[0].id,
            "name": res.data.data.profiles.items[0].name,
            "handle": res.data.data.profiles.items[0].handle,
            "totalFollowers": res.data.data.profiles.items[0].stats.totalFollowers,
            "totalFollowing": res.data.data.profiles.items[0].stats.totalFollowing,
        }
    }catch(err){
        console.log(`${address}---获取个人信息失败: ${err}`);
        return false
    };
}


let getUserProfiles = async(pk) => {
    let loginResult = await login(pk);
    return await userProfiles(loginResult.walletAddress, loginResult.accessToken);
}

export {
    getUserProfiles
}