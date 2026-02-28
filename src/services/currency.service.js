const axios = require("axios");

const FALLBACK_RATES = {
  USD: 1,
  MXN: 17.0,
  COP: 4000,
  ARS: 900,
  EUR: 0.92,
};

const getRates = async () => {
  try {
    console.log("💱 ➡️ Obteniendo tasas de cambio...");
    
    const { data } = await axios.get(
      "https://open.er-api.com/v6/latest/USD",
      { timeout: 5000 }
    );

    if (!data?.rates) {
      throw new Error("Invalid rates response");
    }

    const rates = {
      USD: 1,
      MXN: data.rates.MXN,
      COP: data.rates.COP,
      ARS: data.rates.ARS,
      EUR: data.rates.EUR,
    };

    console.log("✅ Tasas de cambio obtenidas:");
    console.log("   🇺🇸 USD:", rates.USD);
    console.log("   🇲🇽 MXN:", rates.MXN);
    console.log("   🇨🇴 COP:", rates.COP);
    console.log("   🇦🇷 ARS:", rates.ARS);
    console.log("   🇪🇺 EUR:", rates.EUR);

    return rates;
  } catch (error) {
    console.error("💱 ⚠️ Error obteniendo tasas, usando valores por defecto:", error.message);
    return FALLBACK_RATES; 
  }
};

module.exports = { getRates };
