const fs = require("fs");
const XLSX = require("xlsx");
function writeBalancesToExcel(balances) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = `data/balances_${timestamp}.xlsx`;
  let existingData = [];

  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets["Balances"];
    existingData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  }

  const wb = XLSX.utils.book_new();
  const ws_data =
    existingData.length > 0
      ? existingData
      : [
          [
            "Holder",
            "ETH Balance",
            "USDT Balance",
            "USDC Balance",
            "STRK Balance",
          ],
        ];

  for (const holder in balances) {
    const balance = balances[holder];
    ws_data.push([
      holder,
      balance.ETH,
      balance.USDT,
      balance.USDC,
      balance.STRK,
    ]);
  }

  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb, ws, "Balances");
  XLSX.writeFile(wb, filePath);
}

module.exports = { writeBalancesToExcel };
