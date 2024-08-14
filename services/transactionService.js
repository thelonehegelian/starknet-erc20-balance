const { fetchData } = require("../utils/fetch");
const { createRequestBody, createHeaders } = require("../utils/rpc");
const { VOYAGER_NODE_URL, VOYAGER_API_KEY } = require("../config/config");

const headers = createHeaders(VOYAGER_API_KEY);

async function getTransactionByHash(txHash) {
  const body = createRequestBody("getTransactionByHash", [txHash]);
  try {
    const data = await fetchData(VOYAGER_NODE_URL, headers, body);
    return data;
  } catch (error) {
    console.error("Error fetching transaction data:", error);
  }
}

module.exports = { getTransactionByHash };
