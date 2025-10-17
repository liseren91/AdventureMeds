import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  Calendar, 
  CreditCard, 
  Package, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Clock 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { MOCK_SERVICES } from "@/lib/mockData";

interface Subscription {
  id: number;
  serviceId: string;
  serviceName: string;
  login: string;
  password: string;
  nextPaymentDate: string;
  cost: number;
  currency: string;
  costInRub: number;
  period: number; // months
  status: "active" | "expiring" | "payment_required";
  paymentMethod: string;
}

const PAYMENT_PERIODS = [
  { value: 1, label: "1 месяц", multiplier: 1 },
  { value: 3, label: "3 месяца", multiplier: 3 },
  { value: 6, label: "6 месяцев", multiplier: 6 },
  { value: 12, label: "1 год (12 месяцев)", multiplier: 12 },
];

const EXCHANGE_RATE = 95; // USD to RUB

export default function MyServices() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const [formData, setFormData] = useState({
    serviceId: "",
    serviceName: "",
    login: "",
    password: "",
    nextPaymentDate: "",
    monthlyCost: 0,
    totalCost: 0,
    currency: "USD",
    periodMonths: 1,
    paymentMethod: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("activeSubscriptions");
    if (stored) {
      setSubscriptions(JSON.parse(stored));
    }
  }, []);

  const saveSubscriptions = (subs: Subscription[]) => {
    setSubscriptions(subs);
    localStorage.setItem("activeSubscriptions", JSON.stringify(subs));
  };

  const getSubscriptionStatus = (nextPaymentDate: string): "active" | "expiring" | "payment_required" => {
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilPayment < 0) return "payment_required";
    if (daysUntilPayment <= 7) return "expiring";
    return "active";
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      active: {
        className: "bg-green-500/10 text-green-600 border-green-500/20",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Активна",
      },
      expiring: {
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        icon: <Clock className="w-4 h-4" />,
        label: "Истекает",
      },
      payment_required: {
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Требует оплаты",
      },
    };

    const config = configs[status as keyof typeof configs];
    
    return (
      <Badge variant="outline" className={config.className}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </span>
      </Badge>
    );
  };

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddSubscription = () => {
    setEditingId(null);
    setFormData({
      serviceId: "",
      serviceName: "",
      login: "",
      password: "",
      nextPaymentDate: "",
      monthlyCost: 0,
      totalCost: 0,
      currency: "USD",
      periodMonths: 1,
      paymentMethod: "",
    });
    setShowModal(true);
  };

  const handleServiceChange = (serviceId: string) => {
    const service = MOCK_SERVICES.find((s) => s.id === serviceId);
    
    if (service && service.pricingTiers && service.pricingTiers.length > 0) {
      const defaultTier = service.pricingTiers[1] || service.pricingTiers[0];
      const priceValue = parseFloat(defaultTier.price.replace(/[^0-9.]/g, '')) || 0;
      
      const totalCost = priceValue * formData.periodMonths;
      setFormData({
        ...formData,
        serviceId,
        serviceName: service.name,
        monthlyCost: priceValue,
        totalCost,
        currency: "USD",
      });
    } else {
      setFormData({
        ...formData,
        serviceId,
        serviceName: service?.name || "",
        monthlyCost: 0,
        totalCost: 0,
      });
    }
  };

  const handlePeriodChange = (months: number) => {
    const totalCost = formData.monthlyCost * months;
    setFormData({
      ...formData,
      periodMonths: months,
      totalCost,
    });
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setFormData({
      serviceId: subscription.serviceId,
      serviceName: subscription.serviceName,
      login: subscription.login,
      password: subscription.password,
      nextPaymentDate: subscription.nextPaymentDate,
      monthlyCost: subscription.cost,
      totalCost: subscription.cost,
      currency: subscription.currency,
      periodMonths: subscription.period,
      paymentMethod: subscription.paymentMethod,
    });
    setShowModal(true);
  };

  const handleDeleteSubscription = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту подписку?")) {
      saveSubscriptions(subscriptions.filter((sub) => sub.id !== id));
      toast({
        title: "Подписка удалена",
        description: "Подписка была успешно удалена",
      });
    }
  };

  const handleSaveSubscription = () => {
    if (!formData.serviceId || !formData.nextPaymentDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const costInRub = formData.currency === "USD" ? formData.monthlyCost * EXCHANGE_RATE : formData.monthlyCost;

    if (editingId) {
      saveSubscriptions(
        subscriptions.map((sub) =>
          sub.id === editingId
            ? {
                ...sub,
                serviceId: formData.serviceId,
                serviceName: formData.serviceName,
                login: formData.login,
                password: formData.password,
                nextPaymentDate: formData.nextPaymentDate,
                cost: formData.monthlyCost,
                currency: formData.currency,
                costInRub,
                period: formData.periodMonths,
                status: getSubscriptionStatus(formData.nextPaymentDate),
                paymentMethod: formData.paymentMethod,
              }
            : sub
        )
      );
      toast({
        title: "Подписка обновлена",
        description: "Изменения сохранены успешно",
      });
    } else {
      const newSubscription: Subscription = {
        id: Date.now(),
        serviceId: formData.serviceId,
        serviceName: formData.serviceName,
        login: formData.login,
        password: formData.password,
        nextPaymentDate: formData.nextPaymentDate,
        cost: formData.monthlyCost,
        currency: formData.currency,
        costInRub,
        period: formData.periodMonths,
        status: getSubscriptionStatus(formData.nextPaymentDate),
        paymentMethod: formData.paymentMethod,
      };
      saveSubscriptions([...subscriptions, newSubscription]);
      toast({
        title: "Подписка добавлена",
        description: "Новая подписка создана успешно",
      });
    }

    setShowModal(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // Calculate statistics
  const totalSubscriptions = subscriptions.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyPayment = subscriptions
    .filter((sub) => {
      const paymentDate = new Date(sub.nextPaymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    })
    .reduce((sum, sub) => sum + sub.costInRub, 0);

  const upcomingPayments = [...subscriptions]
    .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Мои подписки</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Управление подписками</h1>
            <p className="text-muted-foreground mt-2">Отслеживайте и управляйте вашими активными подписками</p>
          </div>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{totalSubscriptions}</div>
                  <div className="text-sm text-muted-foreground">Активных подписок</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{monthlyPayment.toLocaleString()} ₽</div>
                  <div className="text-sm text-muted-foreground">К оплате в этом месяце</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <CardTitle>Ближайшие платежи</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingPayments.map((payment) => {
                  const service = MOCK_SERVICES.find((s) => s.id === payment.serviceId);
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {service?.logoUrl && (
                          <img src={service.logoUrl} alt={service.name} className="w-8 h-8 object-contain" />
                        )}
                        <div>
                          <div className="font-medium">{payment.serviceName}</div>
                          <div className="text-xs text-muted-foreground">
                            Плательщик: {payment.paymentMethod || "Не указан"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right mr-4">
                        <div className="font-semibold">{payment.costInRub.toLocaleString()} ₽</div>
                        <div className="text-sm text-muted-foreground">{formatDate(payment.nextPaymentDate)}</div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions Management */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Подписки</h2>
            <Button onClick={handleAddSubscription} className="gap-2">
              <Plus className="w-5 h-5" />
              Добавить подписку
            </Button>
          </div>

          {subscriptions.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Сервис
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Доступ
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Дата оплаты
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Стоимость
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {subscriptions.map((sub) => {
                      const service = MOCK_SERVICES.find((s) => s.id === sub.serviceId);
                      return (
                        <tr key={sub.id} className="hover:bg-accent/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {service?.logoUrl && (
                                <img src={service.logoUrl} alt={service.name} className="w-8 h-8 object-contain" />
                              )}
                              <div className="font-medium">{sub.serviceName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium">Логин:</span> {sub.login || "Не указан"}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Пароль:</span>
                                <span className="font-mono">
                                  {visiblePasswords[sub.id] ? sub.password : "••••••••"}
                                </span>
                                {sub.password && (
                                  <button
                                    onClick={() => togglePasswordVisibility(sub.id)}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    {visiblePasswords[sub.id] ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">{formatDate(sub.nextPaymentDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="font-semibold">{sub.costInRub.toLocaleString()} ₽</div>
                              <div className="text-muted-foreground">
                                {sub.cost} {sub.currency}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(sub.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => handleEditSubscription(sub)}
                                variant="ghost"
                                size="icon"
                                title="Редактировать"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteSubscription(sub.id)}
                                variant="ghost"
                                size="icon"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold mb-2">Нет активных подписок</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Добавьте свою первую подписку, чтобы начать отслеживать платежи
                </p>
                <Button onClick={handleAddSubscription} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Добавить подписку
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Subscription Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Редактировать подписку" : "Добавить подписку"}</DialogTitle>
            <DialogDescription>
              Заполните информацию о подписке для отслеживания платежей
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service">Название сервиса *</Label>
              <Select value={formData.serviceId} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сервис" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SERVICES.map((service) => {
                    const defaultPrice = service.pricingTiers?.[1]?.price || service.pricingTiers?.[0]?.price || service.price;
                    return (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} — {defaultPrice}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Базовая стоимость за 1 месяц</p>
            </div>

            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Информация о доступе</p>
                  <p className="text-muted-foreground">
                    Логин и пароль вводятся вручную. Рекомендуем запросить эти данные у сотрудника или создать
                    отдельный аккаунт.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="login">Логин в сервисе</Label>
              <Input
                id="login"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                placeholder="username или email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль от сервиса</Label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Пароль"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Способ оплаты</Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                placeholder="Например: Карта **** 4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextPaymentDate">Дата следующей оплаты *</Label>
              <Input
                id="nextPaymentDate"
                type="date"
                value={formData.nextPaymentDate}
                onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Период оплаты *</Label>
              <Select
                value={formData.periodMonths.toString()}
                onValueChange={(value) => handlePeriodChange(parseInt(value))}
                disabled={!formData.serviceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value.toString()}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Выберите на сколько месяцев хотите оплатить</p>
            </div>

            {formData.serviceId && formData.monthlyCost > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Стоимость за месяц:</span>
                  <span className="font-semibold">
                    {formData.monthlyCost} {formData.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Период оплаты:</span>
                  <span className="font-semibold">
                    {formData.periodMonths}{" "}
                    {formData.periodMonths === 1
                      ? "месяц"
                      : formData.periodMonths < 5
                      ? "месяца"
                      : "месяцев"}
                  </span>
                </div>
                <div className="h-px bg-primary/20 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Итого к оплате:</span>
                  <span className="font-bold text-lg">
                    {formData.totalCost} {formData.currency}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (≈ {(formData.totalCost * EXCHANGE_RATE).toLocaleString()} ₽)
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveSubscription}>
              {editingId ? "Сохранить изменения" : "Добавить подписку"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

