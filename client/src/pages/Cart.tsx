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
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CartItem, getCartFromStorage, removeFromCart, clearCart, updateCartItemCredentials } from "@/lib/cartData";
import { Payer, Transaction } from "@/lib/payersData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
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

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
  const selectedPayer = payers.find(p => p.id === selectedPayerId);
  const hasInsufficientFunds = selectedPayer ? selectedPayer.balance < totalPrice : true;

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

    // Process all purchases
    cartItems.forEach(item => {
      const purchase = {
        id: Date.now().toString() + Math.random(),
        serviceId: item.serviceId,
        planName: item.planName,
        price: item.price,
        purchaseDate: new Date().toISOString(),
        status: "active" as const,
        billingCycle: item.billingCycle,
        payerId: selectedPayerId,
        login: item.login,
        password: item.password,
        paymentUrl: item.paymentUrl,
      };

      const existing = localStorage.getItem("userPurchases");
      const purchases = existing ? JSON.parse(existing) : [];
      purchases.push(purchase);
      localStorage.setItem("userPurchases", JSON.stringify(purchases));

      // Add transaction
      const newTransaction: Transaction = {
        id: Date.now().toString() + Math.random(),
        payerId: selectedPayerId,
        date: new Date().toISOString(),
        type: "purchase",
        amount: item.price,
        comment: `Покупка ${item.serviceName} - ${item.planName}`,
        serviceId: item.serviceId,
        serviceName: item.serviceName,
      };
      const existingTransactions = localStorage.getItem("transactions");
      const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
    });

    // Deduct total from payer balance
    const updatedPayers = payers.map(p => 
      p.id === selectedPayerId ? { ...p, balance: p.balance - totalPrice } : p
    );
    setPayers(updatedPayers);
    localStorage.setItem("payers", JSON.stringify(updatedPayers));

    // Clear cart
    clearCart();
    setCartItems([]);

    toast({
      title: "Оплата успешна!",
      description: `Куплено ${cartItems.length} сервисов на сумму $${totalPrice.toFixed(2)}`,
    });

    setTimeout(() => {
      setLocation("/account");
    }, 1500);
  };

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
            const isExpanded = expandedItems.has(item.id);
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
                      <p className="text-2xl font-bold" data-testid={`text-price-${item.id}`}>
                        ${item.price.toFixed(2)}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleExpanded(item.id)}
                          data-testid={`button-toggle-credentials-${item.id}`}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
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
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      <h4 className="font-semibold text-sm">Информация о доступе</h4>
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
                    </div>
                  )}
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
                    ${totalPrice.toFixed(2)}
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
                      <div className="p-4 border border-border rounded-md space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Баланс:</span>
                          <span className="font-semibold">${selectedPayer.balance.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">После оплаты:</span>
                          <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : 'text-green-500'}`}>
                            ${(selectedPayer.balance - totalPrice).toFixed(2)}
                          </span>
                        </div>
                        
                        {hasInsufficientFunds && (
                          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-3">
                            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-destructive">Недостаточно средств</p>
                              <p className="text-xs text-destructive/80 mt-1">
                                Не хватает ${(totalPrice - selectedPayer.balance).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
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
                onClick={handleCheckout}
                data-testid="button-checkout"
              >
                <ShoppingBag className="h-5 w-5" />
                Оплатить ${totalPrice.toFixed(2)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
