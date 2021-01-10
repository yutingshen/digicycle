/* configure access to our .env */
require("dotenv").config();

/* include express.js & socket.io */
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

/* include other packages */
const inquirer = require("inquirer");
const open = require("open");
const TextDecoder = require("text-encoding").TextDecoder;

/* hedera.js */
const {
    Client,
    ConsensusSubmitMessageTransaction,
    TransferTransaction,
    Hbar,
    AccountBalanceQuery,
    AccountCreateTransaction,
    AccountDeleteTransaction,
    MirrorClient,
    AccountId
} = require("@hashgraph/sdk");
const { contractLogInfoListToSdk } = require("@hashgraph/sdk/lib/contract/ContractLogInfo");

/* utilities */
const questions = require("./utils.js").initQuestions;
const UInt8ToString = require("./utils.js").UInt8ToString;
const secondsToDate = require("./utils.js").secondsToDate;
const log = require("./utils.js").handleLog;
const sleep = require("./utils.js").sleep;

/* init variables */
const mirrorNodeAddress = new MirrorClient(
    "hcs.testnet.mirrornode.hedera.com:5600"
);
const specialChar = "ℏ";
var operatorAccount = "";
var HederaClient = Client.forTestnet();
var logStatus = "Default";
var amount = 0;
var targetAccountId = "";
const client = Client.forTestnet();

async function init() {
    try {
            configureAccount();
            /* run & serve the express app */
            runForm();
        } catch (error) {
            log("ERROR: init() failed", error, logStatus);
            process.exit(1);
        }
}


function runForm() {
    app.use(express.static("public"));
    http.listen(0, function () {
        const randomInstancePort = http.address().port;
        open("http://localhost:" + randomInstancePort);
    });
    io.on("connection", function (client) {
        var a = 0;
        var i = 0;
        io.emit(
            "connect message",
            operatorAccount + specialChar + client.id
        );
        client.on("token amount", function (amt) {
            var a = amt;
            console.log(a);
        });
        client.on("account id", function (id) {
            var i = id;
            console.log(i)
        });
        sendHbars(12, operatorAccount);
    });
    
}


init();

/*transfer tokens to an account*/
async function sendHbars(amount, accountId) {
    try {
        const accId = new AccountId(accountId);
        console.log("starting sendToken() - amount = " + amount + " & accountID = " + accountId);
        console.log("operator id = " + operatorAccount);
        //Create the transfer transaction
        const transaction = await new TransferTransaction()
            .addHbarTransfer(operatorAccount, new Hbar(-amount))
            .addHbarTransfer(accountId, new Hbar(amount));

        //Submit the transaction to a Hedera network
        const txResponse = await transaction.execute(client);

        //Request the receipt of the transaction
        const receipt = await txResponse.getReceipt(client);

        //Get the transaction consensus status
        const transactionStatus = receipt.status;

        console.log("The transaction consensus status is " + transactionStatus.toString());

    }
    finally {
        console.log("Transaction completed.");
    }
}

// function subscribeToMirror() {
//     try {
//         new MirrorConsensusTopicQuery()
//             .setTopicId(topicId)
//             .subscribe(mirrorNodeAddress, res => {
//                 log("Response from MirrorConsensusTopicQuery()", res, logStatus);
//                 const message = new TextDecoder("utf-8").decode(res["message"]);
//                 var runningHash = UInt8ToString(res["runningHash"]);
//                 var timestamp = secondsToDate(res["consensusTimestamp"]);
//                 io.emit(
//                     "chat message",
//                     message +
//                     specialChar +
//                     res.sequenceNumber +
//                     specialChar +
//                     runningHash +
//                     specialChar +
//                     timestamp
//                 );
//             });
//         log("MirrorConsensusTopicQuery()", topicId.toString(), logStatus);
//     } catch (error) {
//         log("ERROR: MirrorConsensusTopicQuery()", error, logStatus);
//         process.exit(1);
//     }
// }

// async function createNewTopic() {
//     try {
//         const txId = await new ConsensusTopicCreateTransaction().execute(
//             HederaClient
//         );
//         log("ConsensusTopicCreateTransaction()", `submitted tx ${txId}`, logStatus);
//         await sleep(3000); // wait until Hedera reaches consensus
//         const receipt = await txId.getReceipt(HederaClient);
//         const newTopicId = receipt.getTopicId();
//         log(
//             "ConsensusTopicCreateTransaction()",
//             `success! new topic ${newTopicId}`,
//             logStatus
//         );
//         return newTopicId;
//     } catch (error) {
//         log("ERROR: ConsensusTopicCreateTransaction()", error, logStatus);
//         process.exit(1);
//     }
// }

// async function configureNewTopic() {
//     log("init()", "creating new topic", logStatus);
//     topicId = await createNewTopic();
//     log(
//         "ConsensusTopicCreateTransaction()",
//         `waiting for new HCS Topic & mirror node (it may take a few seconds)`,
//         logStatus
//     );
//     await sleep(9000);
//     return;
// }

// async function configureExistingTopic(existingTopicId) {
//     log("init()", "connecting to existing topic", logStatus);
//     if (existingTopicId === "") {
//         topicId = ConsensusTopicId.fromString(process.env.TOPIC_ID);
//     } else {
//         topicId = ConsensusTopicId.fromString(existingTopicId);
//     }
// }

/* helper init functions */
function configureAccount() {
    try {
        operatorAccount = process.env.ACCOUNT_ID;
        HederaClient.setOperator(process.env.ACCOUNT_ID, process.env.PRIVATE_KEY);

    } catch (error) {
        log("ERROR: configureAccount()");
        process.exit(1);
    }
}