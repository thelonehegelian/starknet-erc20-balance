const fetch = require("node-fetch");

async function fetchData(url, headers, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = { fetchData };
