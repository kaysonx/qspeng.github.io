//Testnet Address
// const dappAddress = "n1xYTjdYXZHGhxSsejdZT9HDMV2d4FmEs2q";
// const nebulasNetAddress = "https://testnet.nebulas.io";

//Mainnet Address
const dappAddress = "n1kj3hUaLCmrnquaztNLrUmPwhR6MgnPsNz";
const nebulasNetAddress = "https://mainnet.nebulas.io";


const nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();

const NebPay = require("nebpay"),
    nebPay = new NebPay();

const gas_price = "1000000";

const gas_limit = "2000000";

let serialNumber = '';
let intervalQuery = 0;


neb.setRequest(new nebulas.HttpRequest(nebulasNetAddress));
