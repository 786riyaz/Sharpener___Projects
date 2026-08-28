import { Cashfree, CFEnvironment } from "cashfree-pg"; 

const cashfree = new Cashfree(CFEnvironment.SANDBOX, "TEST430329ae80e0f32e41a393d78b923034", "TESTaf195616268bd6202eeb3bf8dc458956e7192a85");

var request = {
    "order_amount": 1.00,
    "order_currency": "INR",
    "order_id": "devstudio_7499051740034960824",
    "customer_details": {
        "customer_id": "devstudio_user",
        "customer_phone": "9876543210",
        "customer_name": "Harshith",
        "customer_email": "test@cashfree.com"
    },
    "order_meta": {
        "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
        "notify_url": "https://www.cashfree.com/devstudio/preview/pg/webhooks/43200891",
        "payment_methods": "cc,dc,upi"
    },
    "order_expiry_time": "2026-08-29T10:59:54.013Z"
};

cashfree.PGCreateOrder(request).then((response) => {
    console.log('Order created successfully:',response.data);
}).catch((error) => {
    console.error('Error:', error.response.data.message);
});