import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  User, 
  Plus, 
  Wallet, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  ChevronRight,
  Download,
  Mail,
  Copy,
  Trash2
} from "lucide-react";
import { MOCK_PAYERS, type Payer, type Transaction } from "@/lib/payersData";
import { MOCK_SERVICES } from "@/lib/mockData";
import AddPayerDialog from "@/components/AddPayerDialog";
import TopUpDialog from "@/components/TopUpDialog";
import WithdrawDialog from "@/components/WithdrawDialog";
import { useToast } from "@/hooks/use-toast";

export default function Finances() {
  const { toast } = useToast();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerIndex, setSelectedPayerIndex] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [documentTab, setDocumentTab] = useState<"invoices" | "reports" | "reconciliations" | "contracts">("invoices");
  const [invoiceStatus, setInvoiceStatus] = useState<"all" | "paid" | "unpaid">("all");

  useEffect(() => {
    const storedPayers = localStorage.getItem("payers");
    if (storedPayers) {
      const loadedPayers = JSON.parse(storedPayers);
      // Ensure all payers have paymentMethods array
      const normalizedPayers = loadedPayers.map((payer: Payer) => ({
        ...payer,
        paymentMethods: payer.paymentMethods || [
          {
            name: payer.type === "company" ? "Корпоративная карта" : "Личная карта",
            description: payer.type === "company" ? "Карта компании" : "Банковская карта",
            isDefault: true,
          },
        ],
      }));
      setPayers(normalizedPayers);
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

  const checkBalance = (payerId: string) => {
    const payer = payers.find(p => p.id === payerId);
    if (!payer) return { hasEnough: false, monthlyTotal: 0, difference: 0 };
    const monthlyTotal = getPayerMonthlyExpense(payerId);
    return {
      hasEnough: payer.balance >= monthlyTotal,
      monthlyTotal,
      difference: payer.balance - monthlyTotal
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' ₽';
  };

  const handleMakeDefault = (methodIndex: number) => {
    if (!payers[selectedPayerIndex]) return;
    
    const updated = [...payers];
    const currentPayerMethods = updated[selectedPayerIndex].paymentMethods || [];
    updated[selectedPayerIndex].paymentMethods = currentPayerMethods.map((method, idx) => ({
      ...method,
      isDefault: idx === methodIndex
    }));
    
    setPayers(updated);
    localStorage.setItem("payers", JSON.stringify(updated));
    
    toast({
      title: "Способ оплаты обновлен",
      description: "Способ оплаты установлен как основной",
    });
  };

  const currentPayer = payers[selectedPayerIndex];
  const balanceCheck = currentPayer ? checkBalance(currentPayer.id) : { hasEnough: false, monthlyTotal: 0, difference: 0 };

  if (!currentPayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Нет доступных плательщиков</p>
          <AddPayerDialog onPayerAdded={(payer: Payer) => {
            const updated = [...payers, payer];
            setPayers(updated);
            localStorage.setItem("payers", JSON.stringify(updated));
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-finances-title">
              Финансы — Adventure Meds
            </h1>
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

        {/* Payers Section */}
        <Card>
          <CardHeader>
            <CardTitle>Плательщики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payers.map((payer, index) => {
                const check = checkBalance(payer.id);
                const services = getPayerServices(payer.id);

                return (
                  <div
                    key={payer.id}
                    onClick={() => setSelectedPayerIndex(index)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPayerIndex === index 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    }`}
                    data-testid={`card-payer-${payer.id}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        {payer.type === "company" ? (
                          <Building2 className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold" data-testid={`text-payer-name-${payer.id}`}>
                          {payer.type === "company" ? payer.companyName : `${payer.firstName} ${payer.lastName}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Тип: {payer.type === "company" ? "company" : "individual"}
                        </p>
                      </div>
                      {selectedPayerIndex === index && (
                        <ChevronRight className="text-primary" size={20} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Баланс:</span>{' '}
                        <span className="font-medium" data-testid={`text-balance-${payer.id}`}>
                          {formatCurrency(payer.balance)}
                        </span>
                      </p>
                      {services.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Сервисы: {services.map(s => {
                            const service = MOCK_SERVICES.find(ms => ms.id === s.serviceId);
                            return service?.name || s.planName;
                          }).join(", ")}
                        </p>
                      )}
                      {check.monthlyTotal > 0 && (
                        <div className={`flex items-center gap-2 text-xs mt-2 p-2 rounded ${
                          check.hasEnough 
                            ? "bg-green-500/10 text-green-600" 
                            : "bg-red-500/10 text-red-600"
                        }`}>
                          {check.hasEnough ? (
                            <>
                              <CheckCircle size={14} />
                              <span>Достаточно средств (+{formatCurrency(check.difference)})</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} />
                              <span>Недостаточно средств ({formatCurrency(check.difference)})</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Сервисы плательщика: {currentPayer.type === "company" ? currentPayer.companyName : `${currentPayer.firstName} ${currentPayer.lastName}`}
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить сервис
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {balanceCheck.monthlyTotal > 0 && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                balanceCheck.hasEnough 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                {balanceCheck.hasEnough ? (
                  <CheckCircle className="text-green-600 mt-0.5" size={18} />
                ) : (
                  <AlertCircle className="text-red-600 mt-0.5" size={18} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${balanceCheck.hasEnough ? "text-green-800" : "text-red-800"}`}>
                    {balanceCheck.hasEnough 
                      ? "На балансе достаточно средств для оплаты всех подписок"
                      : "Внимание! Недостаточно средств для оплаты всех подписок"}
                  </p>
                  <p className={`text-xs mt-1 ${balanceCheck.hasEnough ? "text-green-600" : "text-red-600"}`}>
                    Ежемесячная стоимость: {formatCurrency(balanceCheck.monthlyTotal)} | 
                    Текущий баланс: {formatCurrency(currentPayer.balance)} | 
                    {balanceCheck.hasEnough ? " Остаток: " : " Не хватает: "}
                    {formatCurrency(Math.abs(balanceCheck.difference))}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {currentPayer.type === "company" 
                ? "Оплата производится с корпоративной карты или по счету" 
                : "Оплата производится с привязанной карты"}
            </p>

            <div className="space-y-3">
              {getPayerServices(currentPayer.id).map((purchase) => {
                const service = MOCK_SERVICES.find(s => s.id === purchase.serviceId);
                const defaultMethod = currentPayer.paymentMethods.find(m => m.isDefault);
                
                return (
                  <div key={purchase.id} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary/50 transition">
                    <div className="flex-1">
                      <p className="font-medium">
                        {service?.name || purchase.planName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {defaultMethod?.name || "Нет способа оплаты"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(purchase.price)}/мес</p>
                      <Badge variant="outline" className="mt-1 bg-green-500/10 text-green-600 border-green-500/20">
                        Активен
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {getPayerServices(currentPayer.id).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет активных сервисов
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods and Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Способы оплаты: {currentPayer.type === "company" ? currentPayer.companyName : `${currentPayer.firstName} ${currentPayer.lastName}`}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  + Добавить способ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(currentPayer.paymentMethods || []).map((method, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg hover:border-primary/50 transition">
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {method.isDefault ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        по умолчанию
                      </Badge>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleMakeDefault(index)}
                      >
                        Сделать основным
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle>Баланс</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Текущий баланс:</p>
                <p className={`text-2xl font-bold ${balanceCheck.hasEnough ? "text-foreground" : "text-red-600"}`}>
                  {formatCurrency(currentPayer.balance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {formatCurrency(currentPayer.balance)} по текущему курсу
                </p>
                {balanceCheck.monthlyTotal > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Ежемесячные расходы:</p>
                    <p className="text-sm font-semibold">{formatCurrency(balanceCheck.monthlyTotal)}</p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
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
                  trigger={
                    <Button className="w-full" variant="default">
                      <Wallet className="h-4 w-4 mr-2" />
                      Пополнить
                    </Button>
                  }
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
                  trigger={
                    <Button className="w-full" variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Списать
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Транзакции</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ДАТА</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ТИП</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">СУММА</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">КОММЕНТАРИЙ</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .filter(t => t.payerId === currentPayer.id)
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((transaction) => (
                      <tr 
                        key={transaction.id}
                        className="border-b hover:bg-accent/50 cursor-pointer"
                        data-testid={`transaction-${transaction.id}`}
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(transaction.date).toLocaleString('ru-RU')}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {transaction.type === "deposit" ? "Пополнение" : "Списание"}
                        </td>
                        <td className={`py-3 px-4 text-sm font-medium ${
                          transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "deposit" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {transaction.comment}
                        </td>
                      </tr>
                    ))}
                  {transactions.filter(t => t.payerId === currentPayer.id).length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-8">
                        Нет транзакций
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section (for companies only) */}
        {currentPayer.type === "company" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Документы</CardTitle>
                <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Месяц</option>
                  <option>Квартал</option>
                  <option>Год</option>
                  <option>Всё время</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Document Tabs */}
              <div className="flex gap-2 border-b">
                <button 
                  className={`px-4 py-2 text-sm font-medium ${
                    documentTab === "invoices" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDocumentTab("invoices")}
                >
                  Счета
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${
                    documentTab === "reports" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDocumentTab("reports")}
                >
                  Отчётные документы
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${
                    documentTab === "reconciliations" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDocumentTab("reconciliations")}
                >
                  Акты сверки
                </button>
                <button 
                  className={`px-4 py-2 text-sm font-medium ${
                    documentTab === "contracts" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setDocumentTab("contracts")}
                >
                  Договоры
                </button>
              </div>

              {/* Invoice Status Filter */}
              {documentTab === "invoices" && (
                <div>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={invoiceStatus}
                    onChange={(e) => setInvoiceStatus(e.target.value as "all" | "paid" | "unpaid")}
                  >
                    <option value="all">Статус счёта</option>
                    <option value="paid">Оплачен</option>
                    <option value="unpaid">Не оплачен</option>
                  </select>
                </div>
              )}

              {/* Documents Table */}
              {documentTab === "invoices" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-accent/50">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Счёт</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Статус оплаты</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Сумма счёта</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Выставлен</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Сумма платежа</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Оплачен</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Зачислен</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-accent/50">
                        <td className="py-3 px-4 text-sm">1228579/2</td>
                        <td className="py-3 px-4 text-sm">
                          <Badge variant="outline" className="bg-gray-500/10">не оплачен</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">2 000,00 ₽</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">3 октября, 2025</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      <tr className="bg-accent/50">
                        <td className="py-3 px-4 text-sm font-medium">Итого:</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-sm font-semibold">2 000,00 ₽</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4 text-sm font-semibold">0,00 ₽</td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-4"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {documentTab !== "invoices" && (
                <p className="text-center text-muted-foreground py-8">
                  Нет документов в этой категории
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
