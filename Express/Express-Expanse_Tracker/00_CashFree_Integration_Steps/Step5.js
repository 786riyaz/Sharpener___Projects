import { Cashfree, CFEnvironment } from "cashfree-pg"; 

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "{appId}", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

cashfree.PGOrderFetchPayments("your-order-id").then((response) => {
    console.log('Order fetched successfully:', response.data);
}).catch((error) => {
    console.error('Error:', error.response.data.message);
});


let getOrderResponse = []; //Get Order API Response
let orderStatus;

if (getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
    orderStatus = "Success"
} else if (getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
    orderStatus = "Pending"
} else {
    orderStatus = "Failure"
}