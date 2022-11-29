const express = require("express");

const server = express();

server.all("/", (res, req) => {
  res.setEncoding("Result: [OK].");
});

function keepAlive() {
  server.listen(process.env.PORT || 3000, () => {
    console.log("Server is now ready!");
  });
}

module.exports = keepAlive;
