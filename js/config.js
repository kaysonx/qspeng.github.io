const dappAddress = "n1JDBqzz9TTPyX37KneqhwqD3yyqbwiHbJ7";
const nebulasNetAddress = "https://testnet.nebulas.io";


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
