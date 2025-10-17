import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
}

interface ServiceAccount {
  serviceId: string;
  serviceName: string;
  hasAccount: boolean;
  login?: string;
  password?: string;
  nextPaymentDate?: Date;
  paymentPeriod?: string;
  monthlyPrice?: number;
  currency?: string;
  paymentLink?: string;
}

export default function ClientSurvey() {
  const [services] = useState<Service[]>([
    { id: "1", name: "ChatGPT Pro", price: 20, currency: "USD", period: "месяц" },
    { id: "2", name: "Midjourney", price: 30, currency: "USD", period: "месяц" },
    { id: "3", name: "Notion AI", price: 8, currency: "USD", period: "месяц" }
  ]);

  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  const handleAccountChoice = (serviceId: string, hasAccount: boolean) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const existingAccount = serviceAccounts.find(sa => sa.serviceId === serviceId);
    
    if (hasAccount) {
      setCurrentService(service);
      setShowAccountDialog(true);
    } else {
      // Если нет аккаунта, создаем запись с hasAccount: false
      const updatedAccounts = serviceAccounts.filter(sa => sa.serviceId !== serviceId);
      updatedAccounts.push({
        serviceId,
        serviceName: service.name,
        hasAccount: false
      });
      setServiceAccounts(updatedAccounts);
    }
  };

  const handleAccountSubmit = (accountData: Omit<ServiceAccount, 'serviceId' | 'serviceName' | 'hasAccount'>) => {
    if (!currentService) return;

    const updatedAccounts = serviceAccounts.filter(sa => sa.serviceId !== currentService.id);
    updatedAccounts.push({
      serviceId: currentService.id,
      serviceName: currentService.name,
      hasAccount: true,
      ...accountData
    });
    setServiceAccounts(updatedAccounts);
    setShowAccountDialog(false);
    setCurrentService(null);
  };

  const getServiceStatus = (serviceId: string) => {
    const account = serviceAccounts.find(sa => sa.serviceId === serviceId);
    if (!account) return "pending";
    return account.hasAccount ? "has-account" : "no-account";
  };

  const isAllServicesProcessed = () => {
    return services.every(service => 
      serviceAccounts.some(sa => sa.serviceId === service.id)
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Вернуться в корзину
          </Link>
          <h1 className="text-3xl font-bold">Настройка аккаунтов</h1>
          <p className="text-muted-foreground mt-2">
            Для каждого сервиса укажите, есть ли у вас уже аккаунт или нужно создать новый
          </p>
        </div>

        {/* Список сервисов */}
        <div className="space-y-4 mb-8">
          {services.map((service) => {
            const status = getServiceStatus(service.id);
            return (
              <Card key={service.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>
                        {service.price} {service.currency} / {service.period}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {status === "has-account" && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Есть аккаунт
                        </Badge>
                      )}
                      {status === "no-account" && (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Создадим новый
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccountChoice(service.id, true)}
                        variant="outline"
                        className="flex-1"
                      >
                        У меня есть аккаунт
                      </Button>
                      <Button
                        onClick={() => handleAccountChoice(service.id, false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Создать новый аккаунт
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {status === "has-account" 
                        ? "Данные аккаунта сохранены" 
                        : "Будет создан новый аккаунт"
                      }
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Кнопка продолжения */}
        {isAllServicesProcessed() && (
          <div className="flex justify-end">
            <Button asChild size="lg">
              <Link href="/checkout">
                Продолжить к оплате
              </Link>
            </Button>
          </div>
        )}

        {/* Диалог ввода данных аккаунта */}
        <AccountDetailsDialog
          service={currentService}
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
          onSubmit={handleAccountSubmit}
        />
      </div>
    </div>
  );
}

interface AccountDetailsDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<ServiceAccount, 'serviceId' | 'serviceName' | 'hasAccount'>) => void;
}

function AccountDetailsDialog({ service, open, onOpenChange, onSubmit }: AccountDetailsDialogProps) {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    nextPaymentDate: undefined as Date | undefined,
    paymentPeriod: "1 месяц",
    monthlyPrice: "",
    currency: "USD",
    paymentLink: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      login: formData.login,
      password: formData.password,
      nextPaymentDate: formData.nextPaymentDate,
      paymentPeriod: formData.paymentPeriod,
      monthlyPrice: parseFloat(formData.monthlyPrice) || 0,
      currency: formData.currency,
      paymentLink: formData.paymentLink
    });
    
    // Сброс формы
    setFormData({
      login: "",
      password: "",
      nextPaymentDate: undefined,
      paymentPeriod: "1 месяц",
      monthlyPrice: "",
      currency: "USD",
      paymentLink: ""
    });
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Информация о доступе</DialogTitle>
          <DialogDescription>
            Логин и пароль вводятся вручную. Рекомендуем запросить эти данные у сотрудника или создать отдельный аккаунт для него.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин в сервисе</Label>
              <Input
                id="login"
                placeholder="username или email"
                value={formData.login}
                onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль от сервиса</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Дата следующей оплаты</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.nextPaymentDate ? format(formData.nextPaymentDate, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.nextPaymentDate}
                  onSelect={(date) => setFormData({ ...formData, nextPaymentDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Период оплаты *</Label>
            <Select value={formData.paymentPeriod} onValueChange={(value) => setFormData({ ...formData, paymentPeriod: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 месяц">1 месяц</SelectItem>
                <SelectItem value="3 месяца">3 месяца</SelectItem>
                <SelectItem value="6 месяцев">6 месяцев</SelectItem>
                <SelectItem value="1 год">1 год</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Выберите на сколько месяцев хотите оплатить</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена за месяц</Label>
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentLink">Ссылка на оплату сервиса</Label>
            <Input
              id="paymentLink"
              placeholder="https://..."
              value={formData.paymentLink}
              onChange={(e) => setFormData({ ...formData, paymentLink: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить подписку
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
