const { Provider, Contract } = require("starknet");
const fs = require("fs");
const XLSX = require("xlsx");
const {
  createRequestBody,
  fetchData,
  createHeaders,
  getBlock,
  getTransactionByHash,
  processTransactions,
  getBlockInfo,
  getTxDetails,
  getSenderAddress,
  processTransaction,
  collectErc20Balances,
  writeBalancesToExcel,
} = require("../index");

jest.mock("starknet", () => {
  const originalModule = jest.requireActual("starknet");
  return {
    ...originalModule,
    Provider: jest.fn().mockImplementation(() => ({
      getTransactionByHash: jest.fn(),
      getBlock: jest.fn(),
      getClassAt: jest.fn(),
    })),
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn(),
    })),
  };
});

jest.mock("fs");
jest.mock("xlsx");

describe("createRequestBody", () => {
  it("should create a valid JSON-RPC request body", () => {
    const method = "getBlockWithTxs";
    const params = ["latest"];
    const expectedBody = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "starknet_getBlockWithTxs",
      params: [],
    });
    expect(createRequestBody(method, params)).toBe(expectedBody);
  });
});

describe("fetchData", () => {
  it("should fetch data from a URL", async () => {
    const url = "https://example.com";
    const headers = { "Content-Type": "application/json" };
    const body = JSON.stringify({});

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: "test" }),
      })
    );

    const data = await fetchData(url, headers, body);
    expect(data).toEqual({ data: "test" });
  });
});

describe("createHeaders", () => {
  it("should create headers with the given API key", () => {
    const apiKey = "test-api-key";
    const expectedHeaders = {
      "Content-Type": "application/json",
      "X-APIKEY": "test-api-key",
    };
    expect(createHeaders(apiKey)).toEqual(expectedHeaders);
  });
});

describe("getBlock", () => {
  it("should fetch block data", async () => {
    const blockNumber = 123;
    const _blockHash = "0x123";
    const mockData = { block_number: 123 };

    fetchData.mockResolvedValue(mockData);

    const data = await getBlock(blockNumber, _blockHash);
    expect(data).toEqual(mockData);
  });
});

describe("getTransactionByHash", () => {
  it("should fetch transaction data by hash", async () => {
    const txHash = "0x123";
    const mockData = { transaction_hash: "0x123" };

    fetchData.mockResolvedValue(mockData);

    const data = await getTransactionByHash(txHash);
    expect(data).toEqual(mockData);
  });
});

describe("processTransactions", () => {
  it("should process transactions", async () => {
    const txs = ["0x123", "0x456"];
    const mockData = { transaction_hash: "0x123" };

    fetchData.mockResolvedValue(mockData);

    console.log = jest.fn();

    await processTransactions(txs);
    expect(console.log).toHaveBeenCalledWith(mockData);
  });
});

describe("getBlockInfo", () => {
  it("should extract block info", () => {
    const block = {
      status: "accepted",
      block_hash: "0x123",
      parent_hash: "0x456",
      block_number: 123,
      timestamp: 1234567890,
      sequencer_address: "0x789",
    };
    const expectedBlockInfo = {
      status: "accepted",
      block_hash: "0x123",
      parent_hash: "0x456",
      block_number: 123,
      timestamp: 1234567890,
      sequencer_address: "0x789",
    };
    expect(getBlockInfo(block)).toEqual(expectedBlockInfo);
  });
});

describe("getTxDetails", () => {
  it("should fetch transaction details", async () => {
    const txHash = "0x123";
    const mockData = { transaction_hash: "0x123" };

    Provider.prototype.getTransactionByHash.mockResolvedValue(mockData);

    const data = await getTxDetails(txHash);
    expect(data).toEqual(mockData);
  });
});

describe("getSenderAddress", () => {
  it("should return the sender address from a transaction", async () => {
    const tx = { sender_address: "0x123" };
    expect(await getSenderAddress(tx)).toBe("0x123");
  });
});

describe("processTransaction", () => {
  it("should process a transaction", async () => {
    const contract = new Contract();
    const tokenName = "ETH";
    const tx = "0x123";
    const mockData = { sender_address: "0x123" };

    Provider.prototype.getTransactionByHash.mockResolvedValue(mockData);
    Contract.prototype.balanceOf.mockResolvedValue("1000");

    process.stdout.clearLine = jest.fn();
    process.stdout.cursorTo = jest.fn();
    process.stdout.write = jest.fn();

    await processTransaction(contract, tokenName, tx);
    expect(Contract.prototype.balanceOf).toHaveBeenCalledWith("0x123");
  });
});

describe("collectErc20Balances", () => {
  it("should collect ERC20 balances", async () => {
    const contract = new Contract();
    const tokenName = "ETH";
    const address = "0x123";
    const mockBalance = "1000";

    Contract.prototype.balanceOf.mockResolvedValue(mockBalance);

    const balances = await collectErc20Balances(contract, tokenName, address);
    expect(balances[address][tokenName]).toBe(mockBalance);
  });
});

describe("writeBalancesToExcel", () => {
  it("should write balances to an Excel file", () => {
    const balances = {
      "0x123": { ETH: "1000", USDT: "2000", USDC: "3000", STRK: "4000" },
    };
    const filePath = "balances.xlsx";

    fs.existsSync.mockReturnValue(false);
    XLSX.utils.book_new.mockReturnValue({});
    XLSX.utils.aoa_to_sheet.mockReturnValue({});
    XLSX.utils.book_append_sheet.mockReturnValue({});
    XLSX.writeFile.mockReturnValue({});

    writeBalancesToExcel(balances);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), filePath);
  });
});
