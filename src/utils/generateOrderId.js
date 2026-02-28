const crypto = require("crypto");

const generateOrderId = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `JANDROGEN-${y}${m}${d}-${rand}`;
};

module.exports = generateOrderId;
