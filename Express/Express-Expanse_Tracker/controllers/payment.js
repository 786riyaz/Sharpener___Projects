import cashfree from "../config/cashfree.js";
import { Order, User } from "../models/index.js";
// Server decides the price - never trust an amount sent from the client.
const PREMIUM_MEMBERSHIP_AMOUNT = 499.0;
// This is OUR business rule: after 10 minutes, we treat the order as
// expired/failed in our own database (see verifyPayment / checkSession sweep).
const ORDER_EXPIRY_MINUTES = 10;
// Cashfree itself rejects order_expiry_time values less than 15 minutes
// out (their hard minimum), so the value we actually send them has to be
// longer than our own expiry - we just stop honoring the order ourselves
// after ORDER_EXPIRY_MINUTES regardless of what Cashfree still allows.
const CASHFREE_ORDER_EXPIRY_MINUTES = 20;
const paymentController = {
// POST /payment/create-order
// Creates a PENDING order in our DB + a matching order on Cashfree,
// and returns the payment_session_id the frontend needs to open checkout.
createOrder: async (req, res) => {
try {
const user = await User.findByPk(req.userId, {
attributes: ["id", "name", "email"],
});
// console.log("User ::", user);
if (!user) {
return res.status(404).json({ error: "User not found." });
}
// Our own unique order id (Cashfree requires one per order).
const orderId = `premium_${user.id}_${Date.now()}`;
// Our own 10-minute rule, stored on the order and used by our
// verify/sweep logic - independent of what we tell Cashfree.
const expiresAt = new Date(Date.now() + ORDER_EXPIRY_MINUTES * 60 * 1000);
// What we actually send to Cashfree - has to clear their 15-minute
// minimum, so we pad it well past that.
const cashfreeExpiryTime = new Date(Date.now() + CASHFREE_ORDER_EXPIRY_MINUTES * 60 * 1000);
const baseUrl = `${req.protocol}://${req.get("host")}`;
const request = {
order_amount: PREMIUM_MEMBERSHIP_AMOUNT,
order_currency: "INR",
order_id: orderId,
customer_details: {
customer_id: `user_${user.id}`,
customer_name: user.name,
customer_email: user.email,
customer_phone: "9999999999", // replace with a real stored phone number if you collect one
},
order_meta: {
// Cashfree substitutes {order_id} itself and redirects the
// browser here once the payment attempt is done.
return_url: `${baseUrl}/dashboard.html?order_id={order_id}`,
payment_methods: "cc,dc,upi",
},
order_expiry_time: cashfreeExpiryTime.toISOString(),
};
const cfResponse = await cashfree.PGCreateOrder(request);
// Record the order as PENDING before the user even sees the checkout
// page - this is what lets us later flip it to FAILED if they never
// complete payment, drop off, or the payment is declined.
await Order.create({
orderId,
userId: user.id,
amount: PREMIUM_MEMBERSHIP_AMOUNT,
status: "PENDING",
paymentSessionId: cfResponse.data.payment_session_id,
expiresAt,
});
res.status(201).json({
orderId,
paymentSessionId: cfResponse.data.payment_session_id,
});
} catch (error) {
console.error("Create order error:", error.response?.data || error);
res.status(500).json({ error: "Failed to create order." });
}
},
// GET /payment/verify/:orderId
// Called once the user is redirected back from Cashfree checkout.
// Fetches the real payment status from Cashfree (never trust the
// frontend redirect alone), updates our Order row, and - on success -
// upgrades the user to premium.
verifyPayment: async (req, res) => {
try {
const { orderId } = req.params;
const order = await Order.findOne({
where: { orderId },
attributes: ["orderId", "userId", "status", "expiresAt"],
});
// console.log("Order ::", order);
if (!order) {
return res.status(404).json({ error: "Order not found." });
}
// Make sure the logged-in user can only verify their own order.
if (order.userId !== req.userId) {
return res.status(403).json({ error: "Not authorized to view this order." });
}
// Already resolved earlier (e.g. page was refreshed) - no need to hit Cashfree again.
if (order.status !== "PENDING") {
return res.status(200).json({ status: order.status });
}
// Guard for older rows created before expiresAt existed (null there).
const isExpired = Boolean(order.expiresAt) && new Date() > order.expiresAt;
const cfResponse = await cashfree.PGOrderFetchPayments(orderId);
const transactions = cfResponse.data || [];
// Same algorithm given in the assignment: any SUCCESS wins, else any
// PENDING keeps it pending, otherwise it's a Failure.
let orderStatus;
if (transactions.filter((t) => t.payment_status === "SUCCESS").length > 0) {
orderStatus = "Success";
} else if (transactions.filter((t) => t.payment_status === "PENDING").length > 0) {
orderStatus = "Pending";
} else {
orderStatus = "Failure";
}
if (orderStatus === "Success") {
order.status = "SUCCESS";
await order.save();
await User.update({ isPremium: true }, { where: { id: order.userId } });
} else if (orderStatus === "Failure" || (orderStatus === "Pending" && isExpired)) {
// Deliverable: flip PENDING -> FAILED when the transaction fails -
// also treat a still-pending order past its 10-minute window as failed.
order.status = "FAILED";
await order.save();
}
// If still "Pending" and not expired, we leave the order as PENDING
// and let the frontend try verifying again later.
res.status(200).json({ status: order.status });
} catch (error) {
console.error("Verify payment error:", error.response?.data || error);
res.status(500).json({ error: "Failed to verify payment." });
}
},
};
export default paymentController;
