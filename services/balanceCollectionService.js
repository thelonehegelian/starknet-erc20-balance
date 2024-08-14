const { provider } = require(".");
async function getTxDetails(txHash) {
  return await provider.getTransactionByHash(txHash);
}

async function getSenderAddress(tx) {
  return tx.sender_address;
}

async function processTransaction(contract, tokenName, tx) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`Processing transaction: ${tx}`);

  const transaction = await getTxDetails(tx);
  const senderAddress = await getSenderAddress(transaction);
  await collectErc20Balances(contract, tokenName, senderAddress);
}

async function collectErc20Balances(contract, tokenName, address) {
  const balance = await contract.balanceOf(address);
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
      const txs = block.transactions;

      for (const addressObj of ADDRESSES) {
        const erc20 = new Contract(abi, addressObj.address, provider);
        for (const tx of txs) {
          await processTransaction(erc20, addressObj.name, tx);
        }
      }
    } catch (error) {
      errors.push(`Error processing block ${blockNumber}: ${error.message}`);
    }
  }
}

module.exports = { processBlocks };
