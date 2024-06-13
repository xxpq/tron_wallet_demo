var os = require('os');
var request = require('request');
var bitchain = require('bitchain');

const TRON_API_KEY = ""; // 如果请求频次较高，建议前往trongrid.io申请KEY。

function main() {
    console.warn("tips:", ':: test script!')
    // 创建一个新钱包 - 实际使用时，替换为实际的钱包地址和私钥，这里新建只为测试。
    let wallet = bitchain.wallet.new();

    console.info("wallet:", wallet)

    // 创建未签名的交易 - TRX 或 USDT 到 TV66AztDBgarSMLGFjRjDd8i6t69999999
    let transaction = createTransaction("TRX", wallet.trxAddress, "TV66AztDBgarSMLGFjRjDd8i6t69999999", 1)

    // 使用私钥签名交易
    let signedTxn = bitchain.wallet.sign(transaction, wallet.privateKey)

    // 广播已签名的交易
    let result = broadcastTransaction(signedTxn)

    // 查询交易区块信息
    let transactionBlock

    // 因为交易发起要过一会儿才会有区块信息，所以这里循环检测(每3秒)
    while (!transactionBlock.block) {
        transactionBlock = getTransaction(result.txid)
        os.sleep(3000)
    }

    // 取得交易区块信息
    let block = getBlockInfo(transactionBlock.block)
    console.warn(JSON.stringify(block))

    os.exit(0)
}

// 创建未签名的交易
function createTransaction(assetName, fromAddress, toAddress, amount) {
    let req = {
        url: `https://api.trongrid.io/wallet/createtransaction`,
        method: 'POST',
        headers: {
            "TRON-PRO-API-KEY": TRON_API_KEY,
        },
        content_type: 'application/json',
        data: JSON.stringify({
            "owner_address": fromAddress,
            "to_address": toAddress,
            "asset_name": assetName, // 值应当为 USDT 或 TRX
            "amount": amount,
            "visible": true
        }),
    }
    return request.parse(req).body.toObject()
}

// 广播已签名的交易
function broadcastTransaction(signedTxn) {
    let req = {
        url: `https://api.trongrid.io/wallet/broadcasttransaction`,
        method: 'POST',
        headers: {
            'TRON-PRO-API-KEY': TRON_API_KEY,
        },
        content_type: 'application/json',
        data: JSON.stringify(signedTxn),
    }
    return request.parse(req).body.toObject()
}

// 查询交易所属区块
function getTransactionBlock(txHash) {
    let req = {
        url: `https://api.trongrid.io/walletsolidity/gettransactioninfobyid`,
        method: 'POST',
        headers: {
            'TRON-PRO-API-KEY': TRON_API_KEY,
        },
        content_type: 'application/json',
        data: JSON.stringify({
            "value": txHash,
        }),
    }
    return request.parse(req).body.toObject()
}

// 查询交易区块信息 - 相比下面tronscan的更慢，因为他需要交易被确认才能查询到，处于安全性和可靠性应当用这个api
// function getBlockInfo(blockNumber) {
//     let req = {
//         url: `https://api.trongrid.io/walletsolidity/getblock`,
//         method: 'POST',
//         headers: {
//             'TRON-PRO-API-KEY': TRON_API_KEY,
//         },
//         content_type: 'application/json',
//         data: JSON.stringify({
//             "detail": false,
//             "id_or_num": blockNumber,
//         }),
//     }
//     return request.parse(req).body.toObject()
// }

// 查询钱包地址状态
function getTransactionBlock(trxAddress) {
    let req = {
        url: `https://api.shasta.trongrid.io/walletsolidity/getaccount`,
        method: 'POST',
        headers: {
            'TRON-PRO-API-KEY': TRON_API_KEY,
        },
        content_type: 'application/json',
        data: JSON.stringify({
            "address": trxAddress,
            "visible": true
        }),
    }
    return request.parse(req).body.toObject()
}

// 查询钱包地址近期交易
function getTransactionBlock(trxAddress) {
    let req = {
        url: `https://api.trongrid.io/v1/accounts/TV66AztDBgarSMLGFjRjDd8i6t69999999/transactions?only_confirmed=false&only_unconfirmed=false&only_to=false&only_from=false&limit=3`, // 根据实际情况调整参数
        method: 'GET',
        headers: {
            'TRON-PRO-API-KEY': TRON_API_KEY,
        },
    }
    return request.parse(req).body.toObject()
}

// 查询交易信息
function getTransaction(txHash) {
    let req = {
        url: `https://apilist.tronscanapi.com/api/transaction-info?hash=${txHash}`,
    }
    return request.parse(req).body.toObject()
}

// 查询交易区块信息 - 相比上面trongrid的更快，在交易中便能查询到，出于及时性可使用这个api
function getBlockInfo(blockNumber) {
    let req = {
        url: `https://apilist.tronscanapi.com/api/block?number=${blockNumber}`,
    }
    return request.parse(req).body.toObject()
}