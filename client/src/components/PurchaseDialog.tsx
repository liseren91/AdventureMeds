import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ShoppingBag, CheckCircle2, CreditCard, Building2, User, AlertTriangle, Info, Clock, Smartphone, Wallet, FileText, Download, HelpCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Payer, Transaction } from "@/lib/payersData";
import { getPriceInRub, formatPriceWithRub } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

interface PurchaseDialogProps {
  service: {
    id: string;
    name: string;
    logoUrl?: string;
    color: string;
    pricingTiers: PricingTier[];
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export default function PurchaseDialog({ service, open: externalOpen, onOpenChange: externalOnOpenChange, trigger }: PurchaseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [selectedPlan, setSelectedPlan] = useState<number>(1); // Default to middle tier
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [step, setStep] = useState<"select" | "confirm" | "payment" | "success">("select");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("card");

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("payers");
      if (stored) {
        const payersData = JSON.parse(stored);
        setPayers(payersData);
        if (payersData.length > 0 && !selectedPayerId) {
          setSelectedPayerId(payersData[0].id);
        }
      }
    }
  }, [open]);

  const selectedPayer = payers.find(p => p.id === selectedPayerId);
  const tier = service.pricingTiers[selectedPlan];
  const priceValue = getPriceInRub(tier.price); // Convert USD to RUB with 5% commission
  // Only check balance if not paying by invoice
  const hasInsufficientFunds = selectedPaymentMethod !== "invoice" && selectedPayer 
    ? selectedPayer.balance < priceValue 
    : selectedPaymentMethod === "invoice" ? false : true;

  const handleConfirmPurchase = () => {
    if (!selectedPayer) {
      toast({
        title: "Выберите плательщика",
        variant: "destructive",
      });
      return;
    }

    // All payers go to payment screen
    setStep("payment");
  };

  const generateInvoice = () => {
    if (!selectedPayer || selectedPayer.type !== "company") return "";
    
    const invoiceData = `
СЧЕТ НА ОПЛАТУ №${Date.now()}
от ${new Date().toLocaleDateString('ru-RU')}

Плательщик: ${selectedPayer.companyName}
ИНН: ${selectedPayer.inn || ""}
КПП: ${selectedPayer.kpp || ""}

Услуга: ${service.name} - ${tier.name}
Период оплаты: ${billingCycle === "monthly" ? "Ежемесячно" : "Ежегодно"}
Стоимость: ${priceValue} ₽

Всего к оплате: ${priceValue} ₽
    `.trim();
    
    const blob = new Blob([invoiceData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const completePurchase = () => {
    if (!selectedPayer) return;

    let invoiceUrl = undefined;
    let purchaseStatus: "active" | "pending_payment" = "active";
    
    if (selectedPaymentMethod === "invoice") {
      invoiceUrl = generateInvoice();
      purchaseStatus = "pending_payment";
    }

    const purchase = {
      id: Date.now().toString(),
      serviceId: service.id,
      planName: tier.name,
      price: priceValue,
      purchaseDate: new Date().toISOString(),
      status: purchaseStatus,
      billingCycle: billingCycle,
      payerId: selectedPayerId,
      paymentMethod: selectedPaymentMethod,
      invoiceUrl,
      login: login || undefined,
      password: password || undefined,
      paymentUrl: paymentUrl || undefined,
    };

    const existing = localStorage.getItem("userPurchases");
    const purchases = existing ? JSON.parse(existing) : [];
    purchases.push(purchase);
    localStorage.setItem("userPurchases", JSON.stringify(purchases));

    // Deduct from payer balance
    const updatedPayers = payers.map(p => 
      p.id === selectedPayerId ? { ...p, balance: p.balance - priceValue } : p
    );
    setPayers(updatedPayers);
    localStorage.setItem("payers", JSON.stringify(updatedPayers));

    // Add transaction
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      payerId: selectedPayerId,
      date: new Date().toISOString(),
      type: "purchase",
      amount: priceValue,
      comment: `Покупка ${service.name} - ${tier.name}`,
      serviceId: service.id,
      serviceName: service.name,
    };
    const existingTransactions = localStorage.getItem("transactions");
    const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
    transactions.push(newTransaction);
    localStorage.setItem("transactions", JSON.stringify(transactions));

    setStep("success");
    
    toast({
      title: "Purchase successful!",
      description: `You've subscribed to ${service.name} - ${tier.name}`,
    });
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("select");
      setSelectedPlan(1);
      setBillingCycle("monthly");
      setLogin("");
      setPassword("");
      setPaymentUrl("");
    }, 200);
  };

  const handleViewAccount = () => {
    handleClose();
    setLocation("/account");
  };

  const selectedTier = service.pricingTiers[selectedPlan];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : externalOpen === undefined ? (
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="gap-2"
            data-testid="button-purchase-service"
          >
            <ShoppingBag className="h-5 w-5" />
            Subscribe Now
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === "select" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                {service.logoUrl ? (
                  <img 
                    src={service.logoUrl} 
                    alt={service.name}
                    className="w-12 h-12 object-contain rounded-md"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: service.color }}
                  >
                    <span className="text-white font-bold text-xl">
                      {service.name.charAt(0)}
                    </span>
                  </div>
                )}
                <DialogTitle className="text-2xl">Подписка на {service.name}</DialogTitle>
              </div>
              <DialogDescription>
                Выберите тарифный план и период оплаты
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-md w-fit mx-auto">
                <Button
                  variant={billingCycle === "monthly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("monthly")}
                  data-testid="button-billing-monthly"
                >
                  Ежемесячно
                </Button>
                <Button
                  variant={billingCycle === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("yearly")}
                  data-testid="button-billing-yearly"
                >
                  Ежегодно
                  <Badge variant="secondary" className="ml-2">Скидка 20%</Badge>
                </Button>
              </div>

              <RadioGroup value={selectedPlan.toString()} onValueChange={(v) => setSelectedPlan(parseInt(v))}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {service.pricingTiers.map((tier, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${
                        selectedPlan === index ? 'border-primary ring-2 ring-primary/20' : 'hover-elevate'
                      }`}
                      onClick={() => setSelectedPlan(index)}
                      data-testid={`card-plan-${index}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{tier.name}</h3>
                          <RadioGroupItem value={index.toString()} id={`plan-${index}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{tier.price}</span>
                            <span className="text-muted-foreground text-sm">
                              /{billingCycle === "monthly" ? "mo" : "yr"}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            ≈{getPriceInRub(tier.price).toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {tier.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose} data-testid="button-cancel-purchase">
                  Отменить
                </Button>
                <Button onClick={() => setStep("confirm")} data-testid="button-continue-purchase">
                  Продолжить
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Подтверждение покупки</DialogTitle>
              <DialogDescription>
                Проверьте детали подписки перед подтверждением
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {service.logoUrl ? (
                        <img 
                          src={service.logoUrl} 
                          alt={service.name}
                          className="w-16 h-16 object-contain rounded-md"
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: service.color }}
                        >
                          <span className="text-white font-bold text-2xl">
                            {service.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTier.name} Plan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{selectedTier.price}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        Billed {billingCycle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">Included Features:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedTier.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    <h3 className="font-semibold">Информация о доступе</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Логин и пароль вводятся вручную. Рекомендуем запросить это у данного сервиса, или создать отдельный аккаунт для него.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-login">Логин в сервисе</Label>
                    <Input
                      id="service-login"
                      type="text"
                      placeholder="username или email"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      data-testid="input-service-login"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-password">Пароль от сервиса</Label>
                    <Input
                      id="service-password"
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      data-testid="input-service-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment-url">Ссылка на оплату сервиса</Label>
                    <Input
                      id="payment-url"
                      type="url"
                      placeholder="https://..."
                      value={paymentUrl}
                      onChange={(e) => setPaymentUrl(e.target.value)}
                      data-testid="input-payment-url"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <h3 className="font-semibold">Плательщик</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">
                            Выберите источник оплаты — юрлицо для бизнеса (с оплатой по счёту) или физлицо для личных нужд.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {payers.length > 0 ? (
                    <>
                      <Select value={selectedPayerId} onValueChange={setSelectedPayerId}>
                        <SelectTrigger data-testid="select-payer">
                          <SelectValue placeholder="Выберите плательщика" />
                        </SelectTrigger>
                        <SelectContent>
                          {payers.map((payer) => (
                            <SelectItem key={payer.id} value={payer.id}>
                              <div className="flex items-center gap-2">
                                {payer.type === "company" ? (
                                  <Building2 className="h-4 w-4" />
                                ) : (
                                  <User className="h-4 w-4" />
                                )}
                                <span>
                                  {payer.type === "company" ? payer.companyName : `${payer.lastName} ${payer.firstName}`}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Payment method selection for companies */}
                      {selectedPayer && selectedPayer.type === "company" && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Способ оплаты</label>
                          <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="balance" id="payment-balance-confirm" />
                                <Label htmlFor="payment-balance-confirm" className="cursor-pointer">
                                  Списать с баланса
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="card" id="payment-card-confirm" />
                                <Label htmlFor="payment-card-confirm" className="cursor-pointer">
                                  Корпоративная карта
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="invoice" id="payment-invoice-confirm" />
                                <Label htmlFor="payment-invoice-confirm" className="cursor-pointer">
                                  Оплата по счету
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      
                      {/* Only show balance info when NOT paying by invoice */}
                      {selectedPayer && selectedPaymentMethod !== "invoice" && (
                        <div className="p-4 border border-border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Текущий баланс:</span>
                            <span className="font-semibold">{selectedPayer.balance.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Стоимость:</span>
                            <span className="font-semibold">{priceValue.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Остаток после покупки:</span>
                            <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : ''}`}>
                              {(selectedPayer.balance - priceValue).toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          
                          {hasInsufficientFunds && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-3 space-y-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-destructive">Недостаточно средств</p>
                                  <p className="text-xs text-destructive/80 mt-1">
                                    Пополните баланс плательщика на {(priceValue - selectedPayer.balance).toLocaleString('ru-RU')} ₽
                                  </p>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => window.location.href = `/finances?payerId=${selectedPayerId}`}
                                data-testid="button-topup-balance"
                              >
                                Пополнить баланс
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-muted rounded-md text-center">
                      <p className="text-sm text-muted-foreground">
                        У вас пока нет плательщиков. Создайте плательщика в разделе <a href="/finances" className="text-primary underline">Финансы</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("select")} data-testid="button-back-purchase">
                  Назад
                </Button>
                <Button 
                  onClick={handleConfirmPurchase} 
                  disabled={!selectedPayer}
                  data-testid="button-confirm-purchase"
                >
                  Подтвердить покупку
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "payment" && selectedPayer && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Пополнить счет</DialogTitle>
              <DialogDescription>
                Выберите способ пополнения баланса для оплаты
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Payer Info */}
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedPayer.type === "individual" 
                          ? `${selectedPayer.lastName} ${selectedPayer.firstName}`
                          : selectedPayer.companyName
                        }
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayer.type === "individual" ? "Физическое лицо" : "Юридическое лицо"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Текущий баланс:</span>
                      <span className="font-semibold">{selectedPayer.balance.toFixed(2)} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top-up Amount - Only for Individual */}
              {selectedPayer.type === "individual" && (
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold">Пополнить счет на:</h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      type="number"
                      placeholder="2000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="text-lg"
                      data-testid="input-topup-amount"
                    />
                    
                    <div className="text-sm text-muted-foreground">Быстрый выбор суммы:</div>
                    <div className="flex flex-wrap gap-2">
                      {[500, 1000, 2000, 5000, 10000].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setTopUpAmount(amount.toString())}
                          data-testid={`button-amount-${amount}`}
                        >
                          {amount} ₽
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">Выберите способ оплаты</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPayer.type === "company" ? (
                    <>
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "card" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("card")}
                        data-testid="payment-method-card"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">Корпоративная карта</h4>
                            <p className="text-sm text-muted-foreground">Карта компании</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "invoice" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("invoice")}
                        data-testid="payment-method-invoice"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">Оплата по счету</h4>
                            <p className="text-sm text-muted-foreground">Банковский счет организации</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "card" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("card")}
                        data-testid="payment-method-card"
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">Банковские карты</h4>
                            <p className="text-sm text-muted-foreground">Mir, Visa, Mastercard</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "yumoney" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("yumoney")}
                        data-testid="payment-method-yumoney"
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">ЮMoney</h4>
                            <p className="text-sm text-muted-foreground">Электронный кошелек</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "sbp" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("sbp")}
                        data-testid="payment-method-sbp"
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">СБП (Система быстрых платежей)</h4>
                            <p className="text-sm text-muted-foreground">Перевод по номеру телефона</p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPaymentMethod === "sberpay" ? "border-primary bg-primary/5" : "hover-elevate"
                        }`}
                        onClick={() => setSelectedPaymentMethod("sberpay")}
                        data-testid="payment-method-sberpay"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">SberPay</h4>
                            <p className="text-sm text-muted-foreground">Оплата через Сбербанк</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t">
                {selectedPaymentMethod === "invoice" && selectedPayer.type === "company" ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      completePurchase();
                      const invoiceUrl = generateInvoice();
                      if (invoiceUrl) {
                        const link = document.createElement('a');
                        link.href = invoiceUrl;
                        link.download = `Счет_${Date.now()}.txt`;
                        link.click();
                      }
                    }}
                    data-testid="button-download-invoice"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Скачать счет и оформить заказ
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={completePurchase}
                    disabled={hasInsufficientFunds}
                    data-testid="button-pay-from-balance"
                  >
                    Списать с баланса
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep("confirm")}
                  data-testid="button-back-to-confirm"
                >
                  Назад
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4 py-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <DialogTitle className="text-2xl">Спасибо за ваш заказ!</DialogTitle>
                <DialogDescription className="text-base max-w-md">
                  Ваш заказ принят и находится в обработке. Вы можете проверить статус заказа в личном кабинете.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Сервис:</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Тариф:</span>
                      <span className="font-medium">{selectedTier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Период оплаты:</span>
                      <span className="font-medium capitalize">{billingCycle === "monthly" ? "Ежемесячно" : "Ежегодно"}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-muted-foreground">Сумма:</span>
                      <span className="font-bold text-lg">{selectedTier.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-blue-500">Срок обработки заказа</h4>
                      <p className="text-sm text-muted-foreground">
                        Обработка вашего заказа занимает от 1 до 7 дней. После активации сервиса вы получите уведомление, и сервис отобразится в вашем личном кабинете.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleClose} data-testid="button-close-success">
                  Продолжить просмотр
                </Button>
                <Button className="flex-1" onClick={handleViewAccount} data-testid="button-view-account">
                  Личный кабинет
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
