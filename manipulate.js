const address = require('./addresses.json');
const fs = require("fs");
const path = require("path");

const updated = address.map((address_obj, index) => ({
    address: address_obj.From.toLowerCase(),
    amountInEth: address_obj["Value_IN(ETH)"],
    amountInTokens: address_obj["Value_IN(ETH)"]/(2*Math.pow(10,-8)),
    claimed: false,
    index: index+1
}));


fs.writeFileSync(path.join(__dirname, "updated.json"),JSON.stringify(updated), {encoding: "utf-8"});

