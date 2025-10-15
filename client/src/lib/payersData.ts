export interface Payer {
  id: string;
  type: "company" | "individual";
  balance: number;
  services?: string[]; // service IDs
  // Company fields
  companyName?: string;
  inn?: string;
  kpp?: string;
  // Individual fields
  firstName?: string;
  lastName?: string;
  passportNumber?: string;
}

export interface Transaction {
  id: string;
  payerId: string;
  date: string;
  type: "deposit" | "withdrawal" | "purchase";
  amount: number;
  comment: string;
  serviceId?: string;
  serviceName?: string;
}

export interface Purchase {
  id: string;
  serviceId: string;
  planName: string;
  price: number;
  purchaseDate: string;
  status: "active" | "cancelled";
  billingCycle: "monthly" | "yearly";
  payerId?: string;
}

export const MOCK_PAYERS: Payer[] = [
  {
    id: "payer-1",
    type: "company",
    companyName: 'ООО "Ай Хант"',
    inn: "7707083893",
    kpp: "770701001",
    balance: 150000,
    services: ["chatgpt", "midjourney", "claude"],
  },
  {
    id: "payer-2",
    type: "individual",
    firstName: "Иван",
    lastName: "Иванов",
    passportNumber: "1234 567890",
    balance: 1200,
    services: ["chatgpt"],
  },
];

export const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Корпоративная карта",
    description: "Карта компании",
    icon: "💳",
  },
  {
    id: "invoice",
    name: "Оплата по счету",
    description: "Банковский счет организации",
    icon: "🏦",
  },
  {
    id: "yumoney",
    name: "ЮMoney",
    description: "Электронный кошелек",
    icon: "🟣",
  },
  {
    id: "sbp",
    name: "СБП (Система быстрых платежей)",
    description: "Перевод по номеру телефона",
    icon: "💎",
  },
  {
    id: "sber",
    name: "SberPay",
    description: "Оплата через СберБанк",
    icon: "🟢",
  },
];
