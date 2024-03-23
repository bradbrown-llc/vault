let keccak256 = require("@ethersproject/keccak256").keccak256;
let evmJsonRpcRequest = require("../evmJsonRpcRequest.js");
let sig = (selector, short = false) => {
    return keccak256(
        "0x" +
        selector.split('').map(c => {
            return c.charCodeAt(0).toString(16);
        }).join('')
    ).substr(0, short ? 10 : undefined);
};
let fs = require("fs");

let sync = sig("Sync(uint112,uint112)");
let transfer = sig("Transfer(address,address,uint256)");
let reflect = sig("ReflectEvent(address,uint256)");

let rpcUrl = "apis-sj.ankr.com/bb7dd5e19cad4c12b7998cd0ec21e212/56005402d0fccc79892019fcf5c2f05d/binance/full/main";
let address = "0x16a7e5c3c928618d9ff554cf9945f2087bbe8db5";
let topics = [[
    sync,
    transfer
]];
(async () => {
    let logs = [];
    let payload = {
        rpcUrl: rpcUrl,
        whichProtocol: 1,
        port: 443,
        method: "eth_blockNumber",
        params: []
    };
    let response = await evmJsonRpcRequest(payload);
    let lastBlock = BigInt(response.result);
    let firstBlock = BigInt(10517741);
    let chunks = 600n;
    let chunkSize = (lastBlock - firstBlock) / chunks;
    console.log(chunkSize);
    let chunkNumber = 0;
    let processChunk = async chunkNumber => {
        console.log([
            "0x" + (firstBlock + chunkSize * chunkNumber + 1n).toString(16),
            "0x" + (firstBlock + chunkSize * (chunkNumber + 1n)).toString(16),
            chunkNumber + 1n,
            chunks
        ]);
        payload = {
            rpcUrl: rpcUrl,
            whichProtocol: 1,
            port: 443,
            method: "eth_getLogs",
            params: [{
                fromBlock: "0x" + (firstBlock + chunkSize * chunkNumber + 1n).toString(16),
                toBlock: "0x" + (firstBlock + chunkSize * (chunkNumber + 1n)).toString(16),
                address: address,
                topics: topics
            }]
        };
        response = await evmJsonRpcRequest(payload);
        console.log(response);
        if (response.error && response.error.message == 'handle request error') {
            setImmediate(() => { processChunk(chunkNumber) });
            return;
        } else {
            if (response.result.length)
                logs = [...logs, ...response.result];
            //console.log(JSON.stringify(logs));
            if (chunkNumber == chunks - 1n) {
                fs.writeFileSync("logs.txt", JSON.stringify(logs));
                return;
            } else {
                setImmediate(() => { processChunk(chunkNumber + 1n) });
            }
        }
    };
    processChunk(0n);

    /*let logs = response.result;
    if (logs.length)
        fs.writeFileSync("logs.txt", JSON.stringify(logs));*/
})();
