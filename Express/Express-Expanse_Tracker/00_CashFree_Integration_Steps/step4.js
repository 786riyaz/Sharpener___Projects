import { load } from "@cashfreepayments/cashfree-js";

function Checkout() {
    let cashfree;
    var initializeSDK = async function () {          
        cashfree = await load({
            mode: "sandbox"
        });
    }
    initializeSDK();

    const doPayment = async () => {
        let checkoutOptions = {
            paymentSessionId: "session_eC2lf3LVji_OFjmMDV0VWSX2cCp1B-IxMfCCFKpg7t0fi4yj5NM0l6aqUUlesy6tEZUtyPxuqzOrYRvK4UdKS-SnNAvPts_lHFdpUqkN71SPOgAcyacJTFkS7oQpayment",
            redirectTarget: "_self",
        };
        cashfree.checkout(checkoutOptions);
    };

    return (
        <div class="row">
            <p>Click below to open the checkout page in current tab</p>
            <button type="submit" class="btn btn-primary" id="renderBtn" onClick={doPayment}>
                Proceed to Pay
            </button>
        </div>
    );
}
export default Checkout;