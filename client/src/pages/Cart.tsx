import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Trash2, 
  Building2, 
  User, 
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  Clock
} from "lucide-react";
import { CartItem, getCartFromStorage, removeFromCart, clearCart, updateCartItemCredentials } from "@/lib/cartData";
import { Payer, Transaction } from "@/lib/payersData";
import { getPriceInRub } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"balance" | "card" | "invoice">("balance");
  const [credentialChoices, setCredentialChoices] = useState<Record<string, "use_existing" | "create_new">>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItemsCount, setPurchasedItemsCount] = useState(0);
  const [purchasedTotal, setPurchasedTotal] = useState(0);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setCartItems(getCartFromStorage());
    
    const stored = localStorage.getItem("payers");
    if (stored) {
      const payersData = JSON.parse(stored);
      setPayers(payersData);
      if (payersData.length > 0) {
        setSelectedPayerId(payersData[0].id);
      }
    }
  }, []);

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    setCartItems(getCartFromStorage());
    toast({
      title: "Удалено из корзины",
      description: "Сервис успешно удален из корзины",
    });
  };

  const handleCredentialChoiceChange = (itemId: string, choice: "use_existing" | "create_new") => {
    setCredentialChoices(prev => ({
      ...prev,
      [itemId]: choice
    }));
    
    // If choosing to create new, clear existing credentials
    if (choice === "create_new") {
      updateCartItemCredentials(itemId, {
        login: "",
        password: "",
        paymentUrl: ""
      });
      setCartItems(getCartFromStorage());
    }
  };

  const handleCredentialsUpdate = (
    itemId: string,
    field: "login" | "password" | "paymentUrl",
    value: string
  ) => {
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    const credentials = {
      login: field === "login" ? value : item.login,
      password: field === "password" ? value : item.password,
      paymentUrl: field === "paymentUrl" ? value : item.paymentUrl,
    };

    updateCartItemCredentials(itemId, credentials);
    setCartItems(getCartFromStorage());
  };

  // Convert each item price from USD to RUB and calculate total
  const totalPrice = cartItems.reduce((sum, item) => {
    // item.price is in USD (e.g., 99), convert to RUB
    const priceInRub = getPriceInRub(`$${item.price}`);
    return sum + priceInRub;
  }, 0);
  const selectedPayer = payers.find(p => p.id === selectedPayerId);
  // Only check balance if paying with balance, not for invoice payments
  const hasInsufficientFunds = selectedPaymentMethod === "balance" && selectedPayer 
    ? selectedPayer.balance < totalPrice 
    : false;

  const generateInvoice = () => {
    if (!selectedPayer || selectedPayer.type !== "company") return "";
    
    const invoiceData = `
СЧЕТ НА ОПЛАТУ №${Date.now()}
От: ${new Date().toLocaleDateString('ru-RU')}

Плательщик:
${selectedPayer.companyName}
ИНН: ${selectedPayer.inn}
КПП: ${selectedPayer.kpp}

К оплате:
${cartItems.map(item => `${item.serviceName} - ${item.planName}: ${getPriceInRub(`$${item.price}`).toLocaleString('ru-RU')} ₽`).join('\n')}

Итого к оплате: ${totalPrice.toLocaleString('ru-RU')} ₽

Срок оплаты: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}
    `.trim();

    const blob = new Blob([invoiceData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const handleCheckout = () => {
    if (!selectedPayer) {
      toast({
        title: "Выберите плательщика",
        description: "Необходимо выбрать плательщика для оплаты",
        variant: "destructive",
      });
      return;
    }

    if (hasInsufficientFunds) {
      toast({
        title: "Недостаточно средств",
        description: "У выбранного плательщика недостаточно средств",
        variant: "destructive",
      });
      return;
    }

    // Save purchase info for success screen
    setPurchasedItemsCount(cartItems.length);
    setPurchasedTotal(totalPrice);

    // Generate invoice if payment method is invoice
    let invoiceUrl = "";
    let purchaseStatus: "active" | "pending_payment" = "active";
    
    if (selectedPaymentMethod === "invoice") {
      invoiceUrl = generateInvoice();
      purchaseStatus = "pending_payment";
    }

    // Process all purchases
    cartItems.forEach((item, index) => {
      const itemPrice = getPriceInRub(`$${item.price}`);
      
      const purchase = {
        id: Date.now().toString() + Math.random() + index,
        serviceId: item.serviceId,
        planName: item.planName,
        price: itemPrice,
        purchaseDate: new Date().toISOString(),
        status: purchaseStatus,
        billingCycle: item.billingCycle,
        payerId: selectedPayerId,
        login: item.login,
        password: item.password,
        paymentUrl: item.paymentUrl,
        paymentMethod: selectedPaymentMethod,
        invoiceUrl: invoiceUrl || undefined,
      };

      const existing = localStorage.getItem("userPurchases");
      const purchases = existing ? JSON.parse(existing) : [];
      purchases.push(purchase);
      localStorage.setItem("userPurchases", JSON.stringify(purchases));

      // Add transaction
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random() + index,
        payerId: selectedPayerId,
        date: new Date().toISOString(),
        type: "purchase",
        amount: itemPrice,
        comment: `Покупка ${item.serviceName} - ${item.planName}`,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
      };
      const existingTransactions = localStorage.getItem("transactions");
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
    });

    // Deduct total from payer balance (only if not paying by invoice)
    if (selectedPaymentMethod !== "invoice") {
      const updatedPayers = payers.map(p => 
        p.id === selectedPayerId ? { ...p, balance: p.balance - totalPrice } : p
      );
      setPayers(updatedPayers);
      localStorage.setItem("payers", JSON.stringify(updatedPayers));
    }
    
    // Download invoice if payment method is invoice
    if (selectedPaymentMethod === "invoice" && invoiceUrl) {
      const link = document.createElement('a');
      link.href = invoiceUrl;
      link.download = `invoice_${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Clear cart
    clearCart();
    setCartItems([]);

    // Show success screen
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Корзина</BreadcrumbPage>
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
              onClick={() => setLocation("/")}
              data-testid="button-continue-browsing"
            >
              Продолжить просмотр
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => setLocation("/account")}
              data-testid="button-view-account"
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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Корзина</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="text-center py-16">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Корзина пуста</h2>
          <p className="text-muted-foreground mb-6">
            Добавьте сервисы в корзину чтобы оформить покупку
          </p>
          <Button onClick={() => setLocation("/")} data-testid="button-browse-services">
            Перейти к каталогу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Корзина</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Корзина
          </h1>
          <p className="text-muted-foreground mt-1">
            {cartItems.length} {cartItems.length === 1 ? "сервис" : "сервисов"} в корзине
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            clearCart();
            setCartItems([]);
            toast({ title: "Корзина очищена" });
          }}
          data-testid="button-clear-cart"
        >
          Очистить корзину
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            return (
              <Card key={item.id} className="hover-elevate" data-testid={`cart-item-${item.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
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
                        <h3 className="font-semibold text-lg" data-testid={`text-service-name-${item.id}`}>
                          {item.serviceName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.planName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="capitalize">
                            {item.billingCycle === "monthly" ? "Ежемесячно" : "Ежегодно"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold" data-testid={`text-price-${item.id}`}>
                          {getPriceInRub(`$${item.price}`).toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-semibold text-sm">Информация о доступе</h4>
                      
                      <RadioGroup 
                        value={credentialChoices[item.id] || "use_existing"} 
                        onValueChange={(value) => handleCredentialChoiceChange(item.id, value as "use_existing" | "create_new")}
                        data-testid={`radio-credential-choice-${item.id}`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="use_existing" id={`use-existing-${item.id}`} />
                            <Label htmlFor={`use-existing-${item.id}`} className="cursor-pointer font-normal">
                              У меня есть аккаунт - введу данные
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="create_new" id={`create-new-${item.id}`} />
                            <Label htmlFor={`create-new-${item.id}`} className="cursor-pointer font-normal">
                              Создайте мне новый аккаунт
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {credentialChoices[item.id] === "create_new" ? (
                        <div className="p-4 bg-muted rounded-md">
                          <p className="text-sm text-muted-foreground">
                            Мы создадим для вас новый аккаунт с уникальными учетными данными. После оформления заказа вы получите доступ к аккаунту.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`login-${item.id}`} className="text-xs">
                              Логин в сервисе
                            </Label>
                            <Input
                              id={`login-${item.id}`}
                              type="text"
                              placeholder="username или email"
                              value={item.login || ""}
                              onChange={(e) => handleCredentialsUpdate(item.id, "login", e.target.value)}
                              data-testid={`input-login-${item.id}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`password-${item.id}`} className="text-xs">
                              Пароль от сервиса
                            </Label>
                            <Input
                              id={`password-${item.id}`}
                              type="password"
                              placeholder="Пароль"
                              value={item.password || ""}
                              onChange={(e) => handleCredentialsUpdate(item.id, "password", e.target.value)}
                              data-testid={`input-password-${item.id}`}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`payment-url-${item.id}`} className="text-xs">
                              Ссылка на оплату сервиса
                            </Label>
                            <Input
                              id={`payment-url-${item.id}`}
                              type="url"
                              placeholder="https://..."
                              value={item.paymentUrl || ""}
                              onChange={(e) => handleCredentialsUpdate(item.id, "paymentUrl", e.target.value)}
                              data-testid={`input-payment-url-${item.id}`}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <h3 className="text-xl font-semibold">Оформление заказа</h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товаров:</span>
                  <span className="font-semibold">{cartItems.length}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-semibold">Итого:</span>
                  <span className="text-2xl font-bold" data-testid="text-total-price">
                    {totalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Плательщик</label>
                {payers.length > 0 ? (
                  <>
                    <Select value={selectedPayerId} onValueChange={setSelectedPayerId}>
                      <SelectTrigger data-testid="select-cart-payer">
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
                                {payer.type === "company" ? payer.companyName : `${payer.firstName} ${payer.lastName}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedPayer && (
                      <>
                        {/* Payment method selection for companies */}
                        {selectedPayer.type === "company" && (
                          <div className="space-y-3">
                            <label className="text-sm font-medium">Способ оплаты</label>
                            <RadioGroup value={selectedPaymentMethod} onValueChange={(v) => setSelectedPaymentMethod(v as "balance" | "card" | "invoice")}>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="balance" id="payment-balance" />
                                  <Label htmlFor="payment-balance" className="cursor-pointer">
                                    Списать с баланса
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="card" id="payment-card" />
                                  <Label htmlFor="payment-card" className="cursor-pointer">
                                    Корпоративная карта
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="invoice" id="payment-invoice" />
                                  <Label htmlFor="payment-invoice" className="cursor-pointer">
                                    Оплата по счету
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        <div className="p-4 border border-border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Баланс:</span>
                            <span className="font-semibold">{selectedPayer.balance.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          {selectedPaymentMethod !== "invoice" && (
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-muted-foreground">После оплаты:</span>
                              <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : 'text-green-500'}`}>
                                {(selectedPayer.balance - totalPrice).toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          )}
                          
                          {hasInsufficientFunds && (
                            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-3">
                              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-destructive">Недостаточно средств</p>
                                <p className="text-xs text-destructive/80 mt-1">
                                  Не хватает {(totalPrice - selectedPayer.balance).toLocaleString('ru-RU')} ₽
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-muted rounded-md text-center">
                    <p className="text-sm text-muted-foreground">
                      Нет плательщиков. <a href="/finances" className="text-primary underline">Создать</a>
                    </p>
                  </div>
                )}
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                disabled={hasInsufficientFunds || !selectedPayer}
                onClick={() => setLocation("/survey")}
                data-testid="button-checkout"
              >
                <ShoppingBag className="h-5 w-5" />
                Настроить аккаунты
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
