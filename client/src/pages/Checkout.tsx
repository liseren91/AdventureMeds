import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  CheckCircle2,
  Clock,
  ArrowLeft
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

export default function Checkout() {
  const [cartItems, setCartItems] = useState(getCartFromStorage());
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItemsCount, setPurchasedItemsCount] = useState(0);
  const [purchasedTotal, setPurchasedTotal] = useState(0);

  useEffect(() => {
    setCartItems(getCartFromStorage());
  }, []);

  const totalPrice = cartItems.reduce((sum, item) => {
    const priceInRub = getPriceInRub(`$${item.price}`);
    return sum + priceInRub;
  }, 0);

  const handleCompletePurchase = () => {
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
        paymentMethod: "balance" as const,
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
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
        <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Вернуться в корзину
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            Оформление заказа
          </h1>
          <p className="text-muted-foreground mt-1">
            Подтвердите ваш заказ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="hover-elevate">
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
                      <h3 className="font-semibold text-lg">
                        {item.serviceName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.planName}
                      </p>
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
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {getPriceInRub(`$${item.price}`).toLocaleString('ru-RU')} ₽
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <div className="flex justify-between pt-3 border-t">
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
                Подтвердить заказ
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
