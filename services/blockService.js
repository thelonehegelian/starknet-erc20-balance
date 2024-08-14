const { fetchData } = require("../utils/fetch");
const { createRequestBody, createHeaders } = require("../utils/rpc");
const { VOYAGER_NODE_URL, VOYAGER_API_KEY } = require("../config/config");

const headers = createHeaders(VOYAGER_API_KEY);

async function getBlock(blockNumber) {
  const body = createRequestBody("getBlockWithTxs", [blockNumber]);
  try {
    const data = await fetchData(VOYAGER_NODE_URL, headers, body);
    return data;
  } catch (error) {
    console.error("Error fetching block data:", error);
  }
}

module.exports = { getBlock };
