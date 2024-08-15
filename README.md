# StarkNet ERC20 Balance

This repository processes Ethereum transactions using StarkNet's tools and writes the extracted data to an Excel file. It provides a set of tools and utilities to interact with a StarkNet provider, fetch transaction details, and extract ERC20 token balances.

## Table of Contents

- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Utilities](#utilities)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Make sure you have the following software installed:

- [Node.js](https://nodejs.org/)
- [npm](https://npmjs.com/)
- A StarkNet endpoint (`VOYAGER_NODE_URL`) and API Key (`VOYAGER_API_KEY`)

### Installing

1. Clone the repository:

```bash
git clone https://github.com/your-username/starknet-transaction-processor.git
cd starknet-transaction-processor
```

2. Install the npm dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your Voyager node URL and API key:

```bash
NODE_URL=your_rpc_node_url
API_KEY=your_rpc_api_key
```

## Configuration

Modify the configuration file `config/config.js` to set up your addresses and network.

```javascript
// config/config.js
module.exports = {
  ADDRESSES: [
    { name: "Token1", address: "0xToken1Address" },
    { name: "Token2", address: "0xToken2Address" }
  ],
  NETWORK: "starknet-mainnet"
};

```

## Usage

To run the script, use the following command:

```bash
npm start <startingBlock> <numberOfBlocksToProcess>
```

The results of the script run are saved in the data folder.

## Algorithm

The algorithm is a bit dumb. It goes through the blocks, then transactions, gets the sender_address and uses that to get the ERC20 tokens balance of the sender. 
A better way would be to use Event logs on the ERC20 tokens.

## Utilities

### `utils/excel.js`

- `writeBalancesToExcel`: Writes balance data to an Excel file.

### `utils/rpc.js`

- `createRequestBody`: Creates the request body for RPC calls.
- `fetchData`: Fetches data from an API endpoint.
- `createHeaders`: Creates headers for the API requests.

### `utils/fetch.js`

- Uncommented functions for fetching block and transaction info are available but currently disabled.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
