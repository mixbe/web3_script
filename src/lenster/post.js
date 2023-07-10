import {login} from "./login.js";
import axios from "axios";
import {getUserProfiles} from "./profiles.js";
import {v4 as uuidv4} from 'uuid';
import 'dotenv/config';


const quotes = [
    "You only live once, but if you do it right, once is enough. – Mae West",
    "If you want to live a happy life, tie it to a goal, not to people or things. – Albert Einstein",
    "Never let the fear of striking out keep you from playing the game. - Babe Ruth",
    "Your time is limited, so don’t waste it living someone else’s life. - Steve Jobs",
    "In order to write about life first you must live it. - Ernest Hemingway",
    "Life is not a problem to be solved, but a reality to be experienced. - Soren Kierkegaard",
    "The unexamined life is not worth living. - Socrates",
    "Turn your wounds into wisdom. - Oprah Winfrey",
    "The purpose of our lives is to be happy. - Dalai Lama",
    "Live for each second without hesitation. - Elton John",
    "Treat yourself well.",
    "Only they who fulfill their duties in everyday matters will fulfill them on great occasions.",
    "Life is real, life is earnest.",
    "Life is the art of drawing sufficient conclusions form insufficient premises.",
    "Life is fine and enjoyable, yet you must learn to enjoy your fine life.",
    "Life is like music. It must be composed by ear, feeling and instinct, not by rule.",
    "Nurture passes nature.",
    "There's only one corner of the universe you can be sure of improving, and that's your own self.",
    "Behind the mountains there are people to be found.",
    "Good morning Phaver Family 💗ISPARTA",
    ""
]


let post1 = async (userProfile, context) => {
    let url = "https://metadata.lenster.xyz/";
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
    let payload = {
        "version": "2.0.0",
        "metadata_id": `${uuidv4()}`,
        "content": `${context}`,
        "external_url": `https://lenster.xyz/u/${userProfile.handle}`,
        "image": null,
        "imageMimeType": null,
        "name": `Post by @${userProfile.handle}`,
        "tags": [],
        "animation_url": null,
        "mainContentFocus": "TEXT_ONLY",
        "contentWarning": null,
        "attributes": [{
            "traitType": "type",
            "displayType": "string",
            "value": "text_only"
        }],
        "media": [],
        "locale": "zh-CN",
        "appId": "Lenster"
    };
    try {
        let res = await axios.post(url, payload, config);
        // console.log(res.data.id);
        return res.data.id;
    } catch (err) {
        console.log(`${userProfile.handle}---post1失败: ${err}`);
        return false
    }
}

let post2 = async (arId, userProfile, accessToken) => {
    let url = "https://api.lens.dev/";
    let config = {
        headers: {
            'referer': 'https://lenster.xyz/',
            'origin': 'https://lenster.xyz',
            'authority': 'api.lens.dev',
            'pragma': 'no-cache',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
            "x-access-token": `Bearer ${accessToken}`,
        }
    };
    let payload = {
        "operationName": "CreateDataAvailabilityPostViaDispatcher",
        "variables": {
            "request": {
                "from": `${userProfile.id}`,
                "contentURI": `ar://${arId}`,
            }
        },
        "query": "mutation CreateDataAvailabilityPostViaDispatcher($request: CreateDataAvailabilityPostRequest!) {\n  createDataAvailabilityPostViaDispatcher(request: $request) {\n    ... on CreateDataAvailabilityPublicationResult {\n      id\n      proofs\n      __typename\n    }\n    ... on RelayError {\n      reason\n      __typename\n    }\n    __typename\n  }\n}\n"
    };

    try {
        let res = await axios.post(url, payload, config);
        if (res.data.data.createDataAvailabilityPostViaDispatcher.id !== "") {
            console.log(`${userProfile.handle}---发帖成功`);
        } else {
            console.log(res.data.data)
        }
    } catch (err) {
        console.log(`${userProfile.handle}---post2失败: ${err}`);
        return false
    }
}


let start = async () => {
    let pk = process.env.PRIVATE_KEY;

    let random = Math.floor(Math.random() * quotes.length);
    let context = quotes[random];

    let loginResult = await login(pk);
    let userProfile = await getUserProfiles(pk);
    let arId = await post1(userProfile, context);
    await post2(arId, userProfile, loginResult.accessToken);
}

start()