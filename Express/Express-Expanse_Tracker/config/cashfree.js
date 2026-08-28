import { Cashfree, CFEnvironment } from "cashfree-pg";
// Never hardcode real App ID / Secret Key in source. Put them in a .env
// file (see .env.example) and load it with a package like dotenv, e.g.
// `import "dotenv/config";` at the very top of index.js.
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
console.warn(
"Warning: CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not set. " +
"Add them to a .env file before trying any payment flow.",
);
}
const cashfree = new Cashfree(CFEnvironment.SANDBOX, CASHFREE_APP_ID, CASHFREE_SECRET_KEY);
export default cashfree;
