const { Provider, Contract } = require("starknet");
const {
  NETWORK,
  VOYAGER_API_KEY,
  VOYAGER_NODE_URL,
} = require("../config/config");

const providerOptions = {
  network: NETWORK,
  nodeUrl: VOYAGER_NODE_URL,
  headers: {
    "X-APIKEY": `${VOYAGER_API_KEY}`,
  },
};

const provider = new Provider(providerOptions);

module.exports = provider;
