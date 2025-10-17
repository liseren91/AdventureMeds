export interface PayerPaymentMethod {
  name: string;
  description: string;
  isDefault: boolean;
}

export interface Payer {
  id: string;
  type: "company" | "individual";
  balance: number;
  services?: string[]; // service IDs
  paymentMethods: PayerPaymentMethod[];
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
  status: "active" | "cancelled" | "pending_payment";
  billingCycle: "monthly" | "yearly";
  payerId?: string;
  paymentMethod?: "card" | "invoice" | "balance" | "yumoney" | "sbp" | "sberpay";
  invoiceUrl?: string;
  // Service access credentials
  login?: string;
  password?: string;
  paymentUrl?: string;
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
    paymentMethods: [
      {
        name: "Корпоративная карта VISA •• 8899",
        description: "ЮKassa — corporate card",
        isDefault: true,
      },
      {
        name: "Р/счёт 40702...",
        description: "Bank — bank account",
        isDefault: false,
      },
    ],
  },
  {
    id: "payer-2",
    type: "individual",
    firstName: "Иван",
    lastName: "Иванов",
    passportNumber: "1234 567890",
    balance: 1200,
    services: ["chatgpt"],
    paymentMethods: [
      {
        name: "VISA •• 4242",
        description: "ЮKassa — personal card",
        isDefault: true,
      },
    ],
  },
];

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  individualOnly?: boolean;
  legalOnly?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cards",
    name: "Банковские карты",
    icon: "💳",
    description: "Мир, Visa, Mastercard",
    available: true,
    individualOnly: true,
  },
  {
    id: "corporate_card",
    name: "Корпоративная карта",
    icon: "💳",
    description: "Карта компании",
    available: true,
    legalOnly: true,
  },
  {
    id: "invoice",
    name: "Оплата по счету",
    icon: "📄",
    description: "Банковский счет организации",
    available: true,
    legalOnly: true,
  },
  {
    id: "yumoney",
    name: "ЮMoney",
    icon: "🟣",
    description: "Электронный кошелек",
    available: true,
    individualOnly: true,
  },
  {
    id: "sbp",
    name: "СБП (Система быстрых платежей)",
    icon: "💠",
    description: "Перевод по номеру телефона",
    available: true,
    individualOnly: true,
  },
  {
    id: "sberpay",
    name: "SberPay",
    icon: "🟢",
    description: "Оплата через Сбербанк",
    available: true,
    individualOnly: true,
  },
  {
    id: "custom",
    name: "Предложить свой способ",
    icon: "➕",
    description: "Другой способ пополнения",
    available: true,
  },
];
