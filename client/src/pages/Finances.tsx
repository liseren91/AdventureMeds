import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Plus, Wallet, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import { MOCK_PAYERS, type Payer, type Transaction } from "@/lib/payersData";
import { MOCK_SERVICES } from "@/lib/mockData";
import AddPayerDialog from "@/components/AddPayerDialog";
import TopUpDialog from "@/components/TopUpDialog";
import WithdrawDialog from "@/components/WithdrawDialog";

export default function Finances() {
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayer, setSelectedPayer] = useState<Payer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    const storedPayers = localStorage.getItem("payers");
    if (storedPayers) {
      setPayers(JSON.parse(storedPayers));
    } else {
      setPayers(MOCK_PAYERS);
      localStorage.setItem("payers", JSON.stringify(MOCK_PAYERS));
    }

    const storedTransactions = localStorage.getItem("transactions");
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }

    const storedPurchases = localStorage.getItem("userPurchases");
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

  const getPayerServices = (payerId: string) => {
    return purchases.filter(p => p.payerId === payerId && p.status === "active");
  };

  const getPayerMonthlyExpense = (payerId: string) => {
    const payerPurchases = getPayerServices(payerId);
    return payerPurchases
      .filter(p => p.billingCycle === "monthly")
      .reduce((sum, p) => sum + p.price, 0);
  };

  const hasSufficientFunds = (payerId: string) => {
    const payer = payers.find(p => p.id === payerId);
    if (!payer) return false;
    const monthlyExpense = getPayerMonthlyExpense(payerId);
    return payer.balance >= monthlyExpense;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ₽';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-finances-title">
              Финансы — AI Hunt
            </h1>
            <p className="text-muted-foreground mt-1">
              Управление плательщиками и балансами
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AddPayerDialog onPayerAdded={(payer: Payer) => {
              const updated = [...payers, payer];
              setPayers(updated);
              localStorage.setItem("payers", JSON.stringify(updated));
            }} />
            <TopUpDialog 
              payers={payers}
              onTopUp={(payerId: string, amount: number, method: string) => {
                const updated = payers.map(p => 
                  p.id === payerId ? { ...p, balance: p.balance + amount } : p
                );
                setPayers(updated);
                localStorage.setItem("payers", JSON.stringify(updated));

                const newTransaction: Transaction = {
                  id: Date.now().toString(),
                  payerId,
                  date: new Date().toISOString(),
                  type: "deposit",
                  amount,
                  comment: `Пополнение через ${method}`,
                };
                const updatedTransactions = [...transactions, newTransaction];
                setTransactions(updatedTransactions);
                localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
              }}
            />
            <WithdrawDialog
              payers={payers}
              onWithdraw={(payerId: string, amount: number, method: string) => {
                const updated = payers.map(p => 
                  p.id === payerId ? { ...p, balance: p.balance - amount } : p
                );
                setPayers(updated);
                localStorage.setItem("payers", JSON.stringify(updated));

                const newTransaction: Transaction = {
                  id: Date.now().toString(),
                  payerId,
                  date: new Date().toISOString(),
                  type: "withdrawal",
                  amount,
                  comment: `Списание через ${method}`,
                };
                const updatedTransactions = [...transactions, newTransaction];
                setTransactions(updatedTransactions);
                localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
              }}
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Плательщики</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payers.map((payer) => {
              const monthlyExpense = getPayerMonthlyExpense(payer.id);
              const sufficient = hasSufficientFunds(payer.id);
              const services = getPayerServices(payer.id);

              return (
                <Card
                  key={payer.id}
                  className={`hover-elevate cursor-pointer transition-all ${
                    selectedPayer?.id === payer.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPayer(payer)}
                  data-testid={`card-payer-${payer.id}`}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                          {payer.type === "company" ? (
                            <Building2 className="h-5 w-5 text-primary" />
                          ) : (
                            <User className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold" data-testid={`text-payer-name-${payer.id}`}>
                            {payer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {payer.type === "company" ? "Тип: company" : "Тип: individual"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Баланс:</p>
                      <p className="text-2xl font-bold" data-testid={`text-balance-${payer.id}`}>
                        {formatCurrency(payer.balance)}
                      </p>
                    </div>
                    {services.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Сервисы: {services.map(s => {
                            const service = MOCK_SERVICES.find(ms => ms.id === s.serviceId);
                            return service?.name || s.planName;
                          }).join(", ")}
                        </p>
                      </div>
                    )}
                    {monthlyExpense > 0 && (
                      <div className={`flex items-center gap-2 p-3 rounded-md ${
                        sufficient 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-red-500/10 text-red-500"
                      }`}>
                        {sufficient ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm">
                          {sufficient 
                            ? `Достаточно средств (+${formatCurrency(payer.balance - monthlyExpense)})`
                            : `Недостаточно средств (-${formatCurrency(Math.abs(payer.balance - monthlyExpense))})`
                          }
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {selectedPayer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Сервисы плательщика: {selectedPayer.name}
              </h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPayer(null)}
              >
                Скрыть
              </Button>
            </div>

            <div className="space-y-3">
              {getPayerServices(selectedPayer.id).map((purchase) => {
                const service = MOCK_SERVICES.find(s => s.id === purchase.serviceId);
                return (
                  <Card key={purchase.id} className="hover-elevate">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {service?.logoUrl ? (
                          <img 
                            src={service.logoUrl} 
                            alt={service.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {purchase.planName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {service?.name || purchase.planName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {purchase.planName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(purchase.price)}/мес
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Активен
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {getPayerServices(selectedPayer.id).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет активных сервисов
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Транзакции</h3>
              <div className="space-y-2">
                {transactions
                  .filter(t => t.payerId === selectedPayer.id)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-border rounded-md"
                      data-testid={`transaction-${transaction.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === "deposit" 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {transaction.type === "deposit" ? "+" : "-"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {transaction.type === "deposit" ? "Пополнение" : "Списание"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === "deposit" 
                            ? "text-green-500" 
                            : "text-red-500"
                        }`}>
                          {transaction.type === "deposit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                {transactions.filter(t => t.payerId === selectedPayer.id).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Нет транзакций
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
