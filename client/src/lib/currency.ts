// Курс ЦБ на сегодня (примерно) + 5% комиссия
const USD_TO_RUB_RATE = 95; // Базовый курс ЦБ
const COMMISSION = 0.05; // 5% комиссия
const EFFECTIVE_RATE = USD_TO_RUB_RATE * (1 + COMMISSION); // ~99.75

export function convertUsdToRub(usdAmount: number): number {
  return Math.round(usdAmount * EFFECTIVE_RATE);
}

export function extractUsdPrice(priceString: string): number | null {
  // Extract number from strings like "$49", "$49/mo", "$99/year"
  const match = priceString.match(/\$(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

export function formatPriceWithRub(priceString: string): string {
  const usdPrice = extractUsdPrice(priceString);
  
  if (usdPrice === null) {
    return priceString; // Return as-is if not a USD price
  }
  
  const rubPrice = convertUsdToRub(usdPrice);
  return `${priceString} (≈${rubPrice.toLocaleString('ru-RU')} ₽)`;
}

export function getPriceInRub(priceString: string): number {
  const usdPrice = extractUsdPrice(priceString);
  return usdPrice ? convertUsdToRub(usdPrice) : 0;
}

// For displaying just the RUB amount
export function formatRubOnly(priceString: string): string {
  const rubPrice = getPriceInRub(priceString);
  return `${rubPrice.toLocaleString('ru-RU')} ₽`;
}
