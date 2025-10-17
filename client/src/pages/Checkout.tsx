import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  CheckCircle2,
  Clock,
  ArrowLeft,
  CreditCard,
  Wallet,
  Bitcoin,
  Building2,
  Check,
  User,
  AlertCircle,
  Plus
} from "lucide-react";
import { getCartFromStorage, clearCart } from "@/lib/cartData";
import { getPriceInRub } from "@/lib/currency";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type Payer, type Transaction, MOCK_PAYERS } from "@/lib/payersData";
import TopUpDialog from "@/components/TopUpDialog";

type PaymentMethod = "card" | "balance" | "crypto" | "invoice";
type CheckoutStep = "payment" | "confirm" | "success";

export default function Checkout() {
  const [cartItems, setCartItems] = useState(getCartFromStorage());
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("payment");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("balance");
  const [selectedPayer, setSelectedPayer] = useState<string>("");
  const [payers, setPayers] = useState<Payer[]>([]);
  const [purchasedItemsCount, setPurchasedItemsCount] = useState(0);
  const [purchasedTotal, setPurchasedTotal] = useState(0);

  useEffect(() => {
    setCartItems(getCartFromStorage());
    
    // Load payers from localStorage (same as Finances page)
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
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => {
    const priceInRub = getPriceInRub(`$${item.price}`);
    return sum + priceInRub;
  }, 0);

  const selectedPayerData = payers.find(p => p.id === selectedPayer);
  const payerBalance = selectedPayerData?.balance || 0;
  const hasInsufficientBalance = selectedPayment === "balance" && payerBalance < totalPrice;

  const handleTopUp = (payerId: string, amount: number, method: string) => {
    // Update payers balance (same as Finances page)
    const updated = payers.map(p => 
      p.id === payerId ? { ...p, balance: p.balance + amount } : p
    );
    setPayers(updated);
    localStorage.setItem("payers", JSON.stringify(updated));

    // Create transaction record (same as Finances page)
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      payerId,
      date: new Date().toISOString(),
      type: "deposit",
      amount,
      comment: `Пополнение через ${method}`,
    };
    
    const storedTransactions = localStorage.getItem("transactions");
    const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    const updatedTransactions = [...transactions, newTransaction];
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
  };

  const handleProceedToConfirm = () => {
    if (!selectedPayer) {
      return; // Validation will show error
    }
    if (hasInsufficientBalance) {
      return; // Show top-up dialog
    }
    setCurrentStep("confirm");
  };

  const handleBackToPayment = () => {
    setCurrentStep("payment");
  };

  const handleCompletePurchase = () => {
    // Deduct balance if paying with balance (same as Finances page logic)
    if (selectedPayment === "balance" && selectedPayer) {
      const updated = payers.map(p => 
        p.id === selectedPayer 
          ? { ...p, balance: p.balance - totalPrice }
          : p
      );
      setPayers(updated);
      localStorage.setItem("payers", JSON.stringify(updated));

      // Create transaction for purchase (same as Finances page)
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        payerId: selectedPayer,
        date: new Date().toISOString(),
        type: "purchase",
        amount: totalPrice,
        comment: `Покупка сервисов (${cartItems.length} шт.)`,
      };
      
      const storedTransactions = localStorage.getItem("transactions");
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      const updatedTransactions = [...transactions, newTransaction];
      localStorage.setItem("transactions", JSON.stringify(updatedTransactions));
    }

    // Save purchase info for success screen
    setPurchasedItemsCount(cartItems.length);
    setPurchasedTotal(totalPrice);

    // Process all purchases
    cartItems.forEach((item, index) => {
      const itemPrice = getPriceInRub(`$${item.price}`);
      
      const purchase = {
        id: Date.now().toString() + Math.random() + index,
        serviceId: item.serviceId,
        planName: item.planName,
        price: itemPrice,
        purchaseDate: new Date().toISOString(),
        status: "active" as const,
        billingCycle: item.billingCycle,
        login: item.login,
        password: item.password,
        paymentUrl: item.paymentUrl,
        paymentMethod: selectedPayment as const,
        payerId: selectedPayer,
      };

      const existing = localStorage.getItem("userPurchases");
      const purchases = existing ? JSON.parse(existing) : [];
      purchases.push(purchase);
      localStorage.setItem("userPurchases", JSON.stringify(purchases));
    });

    // Clear cart
    clearCart();
    setCartItems([]);

    // Show success screen
    setCurrentStep("success");
  };

  const paymentMethods = [
    {
      id: "balance" as PaymentMethod,
      name: "Баланс плательщика",
      icon: Wallet,
      description: selectedPayer 
        ? `Доступно: ${payerBalance.toLocaleString('ru-RU')} ₽`
        : "Выберите плательщика",
      disabled: !selectedPayer || hasInsufficientBalance
    },
    {
      id: "card" as PaymentMethod,
      name: "Банковская карта",
      icon: CreditCard,
      description: "Visa, Mastercard, МИР",
      disabled: !selectedPayer
    },
    {
      id: "crypto" as PaymentMethod,
      name: "Криптовалюта",
      icon: Bitcoin,
      description: "Bitcoin, Ethereum, USDT",
      disabled: !selectedPayer
    },
    {
      id: "invoice" as PaymentMethod,
      name: "Выставить счёт",
      icon: Building2,
      description: "Для юридических лиц",
      disabled: !selectedPayer
    }
  ];

  // Success Screen
  if (currentStep === "success") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Оформление заказа</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col items-center text-center space-y-6 py-8">
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Спасибо за ваш заказ!</h1>
            <p className="text-muted-foreground max-w-md">
              Ваш заказ принят и находится в обработке. Вы можете проверить статус заказа в личном кабинете.
            </p>
          </div>

          <Card className="bg-muted/50 w-full max-w-md">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Количество сервисов:</span>
                  <span className="font-medium">{purchasedItemsCount}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-muted-foreground">Общая сумма:</span>
                  <span className="font-bold text-lg">{purchasedTotal.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20 w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 text-left">
                  <h4 className="font-semibold text-blue-500">Срок обработки заказа</h4>
                  <p className="text-sm text-muted-foreground">
                    Обработка вашего заказа занимает от 1 до 7 дней. После активации сервисов вы получите уведомление, и они отобразятся в вашем личном кабинете.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4 w-full max-w-md">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => window.location.href = "/"}
            >
              Продолжить просмотр
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => window.location.href = "/account"}
            >
              Личный кабинет
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Оформление заказа</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
          <p className="text-muted-foreground mb-6">
            Добавьте сервисы в корзину чтобы оформить покупку
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Перейти к каталогу
          </Button>
        </div>
      </div>
    );
  }

  // Step Progress Indicator
  const steps = [
    { id: "payment", name: "Способ оплаты" },
    { id: "confirm", name: "Подтверждение" },
    { id: "success", name: "Завершено" }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/cart">Корзина</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Оформление заказа</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4 mb-8">
        {currentStep === "payment" && (
          <Link href="/survey" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Вернуться назад
          </Link>
        )}
        {currentStep === "confirm" && (
          <button onClick={handleBackToPayment} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Вернуться назад
          </button>
        )}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Оформление заказа
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentStep === "payment" && "Выберите способ оплаты"}
            {currentStep === "confirm" && "Подтвердите ваш заказ"}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.slice(0, -1).map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index <= currentStepIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{step.name}</span>
            </div>
            {index < steps.length - 2 && (
              <div className={`w-24 h-0.5 mx-2 ${
                index < currentStepIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Payment Method Selection */}
      {currentStep === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Payer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Выберите плательщика</span>
                  <Badge variant="destructive">Обязательно</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {payers.map((payer) => {
                    const payerName = payer.type === "company" 
                      ? payer.companyName 
                      : `${payer.firstName} ${payer.lastName}`;
                    const isSelected = selectedPayer === payer.id;
                    const hasLowBalance = payer.balance < totalPrice;
                    
                    return (
                      <Card
                        key={payer.id}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPayer(payer.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            payer.type === "company" ? "bg-purple-100" : "bg-blue-100"
                          }`}>
                            {payer.type === "company" ? (
                              <Building2 className="h-5 w-5 text-purple-600" />
                            ) : (
                              <User className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm truncate">{payerName}</p>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {payer.type === "company" ? "Юридическое лицо" : "Физическое лицо"}
                            </p>
                            {payer.type === "company" && payer.inn && (
                              <p className="text-xs text-muted-foreground">
                                ИНН: {payer.inn}
                              </p>
                            )}
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Баланс: </span>
                                <span className="font-semibold">
                                  {payer.balance.toLocaleString('ru-RU')} ₽
                                </span>
                              </p>
                            </div>
                            {hasLowBalance && (
                              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>Недостаточно средств</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Выберите способ оплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={(value) => setSelectedPayment(value as PaymentMethod)}>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <div
                          key={method.id}
                          className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                            selectedPayment === method.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          } ${method.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          onClick={() => !method.disabled && setSelectedPayment(method.id)}
                        >
                          <RadioGroupItem value={method.id} id={method.id} disabled={method.disabled} />
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${
                              selectedPayment === method.id ? 'bg-primary/10' : 'bg-muted'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="text-base font-semibold cursor-pointer">
                                {method.name}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {method.description}
                              </p>
                              {method.id === "balance" && !selectedPayer && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Сначала выберите плательщика
                                </p>
                              )}
                              {method.id === "balance" && selectedPayer && hasInsufficientBalance && (
                                <p className="text-sm text-destructive mt-1">
                                  Недостаточно средств (не хватает {(totalPrice - payerBalance).toLocaleString('ru-RU')} ₽)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>

                {selectedPayment === "card" && selectedPayer && (
                  <div className="mt-6 space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold">Данные карты</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="cardNumber">Номер карты</Label>
                        <Input id="cardNumber" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="expiry">Срок действия</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" type="password" maxLength={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insufficient Balance Alert */}
                {selectedPayment === "balance" && hasInsufficientBalance && selectedPayer && (
                  <Alert className="mt-6 border-amber-500 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="ml-2">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-amber-900">Недостаточно средств на балансе</p>
                          <p className="text-sm text-amber-700 mt-1">
                            Для оплаты заказа необходимо пополнить баланс на {(totalPrice - payerBalance).toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                        <TopUpDialog 
                          payers={payers.filter(p => p.id === selectedPayer)} 
                          onTopUp={handleTopUp}
                          trigger={
                            <Button variant="default" size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                              <Plus className="h-4 w-4" />
                              Пополнить баланс
                            </Button>
                          }
                        />
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* No Payer Selected Alert */}
                {!selectedPayer && (
                  <Alert className="mt-6 border-blue-500 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="ml-2">
                      <p className="text-sm text-blue-900">
                        Сначала выберите плательщика выше
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-xl font-semibold">Сводка заказа</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Товаров:</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Итого:</span>
                    <span className="text-2xl font-bold">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleProceedToConfirm}
                  disabled={!selectedPayer || hasInsufficientBalance}
                >
                  Продолжить
                </Button>
                
                {!selectedPayer && (
                  <p className="text-xs text-muted-foreground text-center">
                    Выберите плательщика для продолжения
                  </p>
                )}
                
                {selectedPayer && hasInsufficientBalance && (
                  <p className="text-xs text-amber-600 text-center">
                    Пополните баланс для продолжения
                  </p>
                )}

                <div className="space-y-2">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <div className="w-8 h-8 rounded flex items-center justify-center text-xs" style={{ backgroundColor: item.serviceColor }}>
                        <span className="text-white font-bold">{item.serviceName.charAt(0)}</span>
                      </div>
                      <span className="text-muted-foreground truncate flex-1">{item.serviceName}</span>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-10">
                      И ещё {cartItems.length - 3}...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Confirmation Step */}
      {currentStep === "confirm" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Проверьте ваш заказ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                    {item.serviceLogoUrl ? (
                      <img 
                        src={item.serviceLogoUrl} 
                        alt={item.serviceName}
                        className="w-16 h-16 object-contain rounded-md"
                      />
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-md flex items-center justify-center"
                        style={{ backgroundColor: item.serviceColor }}
                      >
                        <span className="text-white font-bold text-xl">
                          {item.serviceName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.serviceName}</h3>
                      <p className="text-sm text-muted-foreground">{item.planName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {item.billingCycle === "monthly" ? "Ежемесячно" : "Ежегодно"}
                        </Badge>
                        {item.login && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Аккаунт настроен
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {getPriceInRub(`$${item.price}`).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Плательщик</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedPayerData && (
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedPayerData.type === "company" ? "bg-purple-100" : "bg-blue-100"
                    }`}>
                      {selectedPayerData.type === "company" ? (
                        <Building2 className="h-6 w-6 text-purple-600" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {selectedPayerData.type === "company" 
                          ? selectedPayerData.companyName 
                          : `${selectedPayerData.firstName} ${selectedPayerData.lastName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayerData.type === "company" ? "Юридическое лицо" : "Физическое лицо"}
                      </p>
                      {selectedPayerData.type === "company" && selectedPayerData.inn && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ИНН: {selectedPayerData.inn}
                        </p>
                      )}
                      <p className="text-sm mt-2">
                        <span className="text-muted-foreground">Баланс: </span>
                        <span className="font-semibold">
                          {selectedPayerData.balance.toLocaleString('ru-RU')} ₽
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Способ оплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  {(() => {
                    const method = paymentMethods.find(m => m.id === selectedPayment);
                    if (!method) return null;
                    const Icon = method.icon;
                    return (
                      <>
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <h3 className="text-xl font-semibold">Итоги заказа</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Товаров:</span>
                    <span className="font-semibold">{cartItems.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Итого:</span>
                    <span className="text-2xl font-bold">
                      {totalPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={handleCompletePurchase}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Оплатить заказ
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Нажимая кнопку "Оплатить заказ", вы соглашаетесь с условиями использования сервиса
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
