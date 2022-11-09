import { getBackendUri, getBatcherUri, getIndexerUri } from "../state";
const toJson = (res) => res.json();
const toText = (res) => res.text();
async function endpointCall(uri, toFxn) {
    try {
        const j = await fetch(uri).then(toFxn);
        return {
            success: true,
            result: j,
        };
    }
    catch (err) {
        console.log(`[endpointCall] error while calling uri ${uri}:`, err);
        return {
            success: false,
            message: "",
        };
    }
}
const jsonEndpointCall = (uri) => endpointCall(uri, toJson);
const textEndpointCall = (uri) => endpointCall(uri, toText);
export async function backendEndpointCall(query) {
    const uri = `${getBackendUri()}/${query}`;
    return jsonEndpointCall(uri);
}
export async function backendTextEndpointCall(query) {
    const uri = `${getBackendUri()}/${query}`;
    return textEndpointCall(uri);
}
export async function indexerEndpointCall(query) {
    const uri = `${getIndexerUri()}/${query}`;
    return jsonEndpointCall(uri);
}
export async function batcherEndpointCall(query) {
    const uri = `${getBatcherUri()}/${query}`;
    return jsonEndpointCall(uri);
}
async function postToEndpoint(uri, data) {
    try {
        const j = await fetch(uri, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: data,
        }).then(res => res.json());
        return {
            success: true,
            result: j,
        };
    }
    catch (err) {
        console.log(`[postToEndpoint] error while posting data: ${data}`);
        console.log(`[postToEndpoint] ...to uri ${uri}:`, err);
        return {
            success: false,
            message: "",
        };
    }
}
export async function postToBatcher(query, data) {
    const uri = `${getBatcherUri()}/${query}`;
    return postToEndpoint(uri, data);
}
