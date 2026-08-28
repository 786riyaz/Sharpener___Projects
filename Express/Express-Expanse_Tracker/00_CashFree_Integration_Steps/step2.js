import {load} from '@cashfreepayments/cashfree-js';

let cashfree;
var initializeSDK = async function () {          
    cashfree = await load({
        mode: "sandbox"
    });
};
initializeSDK();