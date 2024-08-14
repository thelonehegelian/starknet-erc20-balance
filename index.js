require("dotenv").config();
const { Provider, Contract } = require("starknet");
const { ADDRESSES, NETWORK } = require("./config/config");
const { writeBalancesToExcel } = require("./utils/excel");
const { createRequestBody, fetchData } = require("./utils/rpc");
const { createHeaders } = require("./utils/rpc");
// const { getBlock, getBlockInfo } = require("./utils/fetch");
const fs = require("fs");
const NODE_URL = process.env.VOYAGER_NODE_URL;
const API_KEY = process.env.VOYAGER_API_KEY;

/**
 * @typedef {Object} BlockData
 * @property {string} status - The status of the block.
 * @property {string} block_hash - The hash of the block.
 * @property {string} parent_hash - The hash of the parent block.
 * @property {number} block_number - The number of the block.
 * @property {string} new_root - The new root hash.
 * @property {number} timestamp - The timestamp of the block.
 * @property {string} sequencer_address - The address of the sequencer.
 * @property {Object} l1_gas_price - The L1 gas price.
 * @property {string} l1_gas_price.price_in_fri - The gas price in FRI.
 * @property {string} l1_gas_price.price_in_wei - The gas price in WEI.
 * @property {Object} l1_data_gas_price - The L1 data gas price.
 * @property {string} l1_data_gas_price.price_in_fri - The data gas price in FRI.
 * @property {string} l1_data_gas_price.price_in_wei - The data gas price in WEI.
 * @property {string} l1_da_mode - The L1 data availability mode.
 * @property {string} starknet_version - The version of StarkNet.
 * @property {Array<Object>} transactions - The transactions in the block.
 */

// Starknet.js
const providerOptions = {
  network: NETWORK,
  nodeUrl: NODE_URL,
  headers: {
    "X-APIKEY": API_KEY,
  },
};

const provider = new Provider(providerOptions);
let balances = {};
let errors = [];
let requestCount = 0;
let transactionsParsed = 0;

const headers = createHeaders(API_KEY);

async function getTransactionByHash(txHash) {
  const body = createRequestBody("getTransactionByHash", [txHash]);
  try {
    const data = await fetchData(VOYAGER_NODE_URL, headers, body);
    return data;
  } catch (error) {
    console.error("Error fetching block data:", error);
  }
}
async function processTransactions(txs) {
  // for (const tx of txs) {
  //   const transaction = await provider.getTransactionByHash(tx);
  //   console.log(transaction);
  // }
  for (let i = 0; i < Math.min(txs.length, 10); i++) {
    const tx = txs[i];
    const transaction = await getTransactionByHash(tx);
    console.log(transaction);
  }
}

async function getTxDetails(txHash) {
  return await provider.getTransactionByHash(txHash);
}

async function processTransaction(contract, tokenName, tx) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Processing transaction: ${tx}`);

  const transaction = await getTxDetails(tx);
  requestCount++;
  const senderAddress = transaction.sender_address;
  await collectErc20Balances(contract, tokenName, senderAddress);
}

async function collectErc20Balances(contract, tokenName, address) {
  const balance = await contract.balanceOf(address);
  requestCount++;
  if (!balances[address]) {
    balances[address] = {};
  }
  balances[address][tokenName] = balance.toString();
  return balances;
}

async function processBlocks(startBlockNumber, numBlocks) {
  const { abi } = await provider.getClassAt(ADDRESSES[0].address);

  for (
    let blockNumber = startBlockNumber;
    blockNumber > startBlockNumber - numBlocks;
    blockNumber--
  ) {
    try {
      const block = await provider.getBlock(blockNumber);
      requestCount++;
      const txs = block.transactions;

      for (const addressObj of ADDRESSES) {
        const erc20 = new Contract(abi, addressObj.address, provider);
        for (const tx of txs) {
          await processTransaction(erc20, addressObj.name, tx);
          transactionsParsed++;
        }
      }
    } catch (error) {
      errors.push(`Error processing block ${blockNumber}: ${error.message}`);
    }
  }
}

async function createLogs(startTime, endTime, requestCount) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFilename = `log_${timestamp}.txt`;
  const logContent = `
Started at: ${new Date(startTime).toISOString()}
Received response at: ${new Date(endTime).toISOString()}
RPC call duration: ${endTime - startTime} ms
Request count: ${requestCount}
Transactions parsed: ${transactionsParsed}
  `;

  fs.writeFileSync(logFilename, logContent.trim());
}

async function main() {
  const startTime = Date.now();
  console.log(`Sending RPC call at: ${new Date(startTime).toISOString()}`);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  const startBlockNumber = 668345; // starting 668345
  const numBlocks = 1; // 345 blocks
  await processBlocks(startBlockNumber, numBlocks);

  if (errors.length > 0) {
    fs.writeFileSync(`data/errors_${timestamp}.log`, errors.join("\n"), {
      flag: "a",
    });
  }

  const filteredBalances = Object.fromEntries(
    Object.entries(balances).filter(([address, tokens]) =>
      Object.values(tokens).some((value) => value !== "0")
    )
  );
  writeBalancesToExcel(filteredBalances);

  const filename = `data/balances_${timestamp}.json`;

  fs.appendFileSync(filename, JSON.stringify(filteredBalances, null, 2) + "\n");
  console.log("\nBalances have been written to balances.json");

  const endTime = Date.now();
  console.log(`Started at: ${new Date(startTime).toISOString()}`);
  console.log(`Received response at: ${new Date(endTime).toISOString()}`);
  console.log(`RPC call duration: ${endTime - startTime} ms`);
  console.log(`Request count: ${requestCount}`);
  await createLogs(startTime, endTime, requestCount);

  // 33421ms Alchemy - 271 calls
  // 13711ms Voyager - 271 calls
  // 29214ms Infura - 271 calls
}

main();
