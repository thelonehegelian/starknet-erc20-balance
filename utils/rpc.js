function createRequestBody(method, params = []) {
  const methodPrefix = "starknet_";
  return JSON.stringify({
    id: 1,
    jsonrpc: "2.0",
    method: methodPrefix + method,
    params: params,
  });
}

function createHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "X-APIKEY": `${apiKey}`,
  };
}

module.exports = { createRequestBody, createHeaders };
