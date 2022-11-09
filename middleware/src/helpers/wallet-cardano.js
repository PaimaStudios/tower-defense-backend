import { utf8ToHex } from "web3-utils";
import { cardanoConnected, getCardanoApi, setCardanoAddress, setCardanoApi, } from "../state";
export async function cardanoLogin() {
    if (cardanoConnected()) {
        return;
    }
    const api = await window.cardano.enable();
    setCardanoApi(api);
    const addresses = await api.getUsedAddresses();
    const userAddress = addresses[0];
    setCardanoAddress(userAddress);
}
export async function signMessageCardano(userAddress, message) {
    await cardanoLogin();
    const api = getCardanoApi();
    const hexMessage = utf8ToHex(message).slice(2);
    return api.signData(userAddress, hexMessage);
}
