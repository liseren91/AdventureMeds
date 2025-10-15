import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  CreditCard, 
  Settings, 
  ShoppingBag, 
  Calendar,
  DollarSign,
  ExternalLink,
  Download,
  Clock,
  AlertCircle,
  Upload,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { MOCK_SERVICES } from "@/lib/mockData";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Purchase {
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
  login?: string;
  password?: string;
  paymentUrl?: string;
}

export default function Account() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem("userPurchases");
    if (stored) {
      setPurchases(JSON.parse(stored));
    }
  }, []);

  const activePurchases = purchases.filter(p => p.status === "active" || p.status === "pending_payment");

  const handleUploadReceipt = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const updatedPurchases = purchases.map(p => 
          p.id === purchaseId ? { ...p, status: "active" as const } : p
        );
        setPurchases(updatedPurchases);
        localStorage.setItem("userPurchases", JSON.stringify(updatedPurchases));
        alert('Спасибо! Счет загружен, заказ активирован.');
      }
    };
    input.click();
  };
  const totalSpending = purchases.reduce((sum, p) => sum + p.price, 0);

  const getPurchasedService = (serviceId: string) => {
    return MOCK_SERVICES.find(s => s.id === serviceId);
  };

  const getNextPaymentDate = (purchase: Purchase) => {
    const purchaseDate = new Date(purchase.purchaseDate);
    const now = new Date();
    const nextDate = new Date(purchaseDate);
    
    if (purchase.billingCycle === "monthly") {
      while (nextDate <= now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else {
      while (nextDate <= now) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }
    
    return nextDate;
  };

  const getDaysUntilPayment = (nextPaymentDate: Date) => {
    const now = new Date();
    const diffTime = nextPaymentDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatus = (daysUntil: number) => {
    if (daysUntil <= 3) return "urgent";
    if (daysUntil <= 7) return "warning";
    return "active";
  };

  const upcomingPayments = activePurchases
    .map(purchase => ({
      ...purchase,
      nextPaymentDate: getNextPaymentDate(purchase),
    }))
    .sort((a, b) => a.nextPaymentDate.getTime() - b.nextPaymentDate.getTime());

  const nextPaymentAmount = upcomingPayments.length > 0 ? upcomingPayments[0].price : 0;
  const monthlyTotal = activePurchases
    .filter(p => p.billingCycle === "monthly")
    .reduce((sum, p) => sum + p.price, 0);

  const handleCancelSubscription = (purchaseId: string) => {
    const updated = purchases.map(p => 
      p.id === purchaseId ? { ...p, status: "cancelled" as const } : p
    );
    setPurchases(updated);
    localStorage.setItem("userPurchases", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-home">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold mb-1">John Doe</h1>
            <p className="text-muted-foreground">john.doe@example.com</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="subscriptions" data-testid="tab-subscriptions">
              <ShoppingBag className="h-4 w-4 mr-2" />
              My Services
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              <Calendar className="h-4 w-4 mr-2" />
              Purchase History
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-services-count">
                    {activePurchases.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    AI tools subscribed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-monthly-cost">
                    ${monthlyTotal.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-next-payment">
                    ${nextPaymentAmount.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {upcomingPayments.length > 0 
                      ? upcomingPayments[0].nextPaymentDate.toLocaleDateString()
                      : "No payments scheduled"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">••••</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Visa ending in 4242
                  </p>
                </CardContent>
              </Card>
            </div>

            {upcomingPayments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingPayments.slice(0, 5).map((payment) => {
                    const service = getPurchasedService(payment.serviceId);
                    if (!service) return null;
                    
                    const daysUntil = getDaysUntilPayment(payment.nextPaymentDate);
                    const status = getPaymentStatus(daysUntil);
                    
                    return (
                      <div 
                        key={payment.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-md hover-elevate"
                        data-testid={`card-upcoming-payment-${payment.id}`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {service.logoUrl ? (
                            <img 
                              src={service.logoUrl} 
                              alt={service.name}
                              className="w-12 h-12 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {service.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold">{service.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {payment.planName} • ${payment.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {payment.nextPaymentDate.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                            </p>
                          </div>
                          {status === "urgent" && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Urgent
                            </Badge>
                          )}
                          {status === "warning" && (
                            <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              <Clock className="h-3 w-3" />
                              Soon
                            </Badge>
                          )}
                          {status === "active" && (
                            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
                  <p className="text-muted-foreground mb-4">
                    Start exploring AI services to boost your productivity
                  </p>
                  <Link href="/">
                    <Button data-testid="button-browse-services">Browse Services</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            {activePurchases.length > 0 ? (
              activePurchases.map((purchase) => {
                const service = getPurchasedService(purchase.serviceId);
                if (!service) return null;

                return (
                  <Card key={purchase.id} data-testid={`card-subscription-${purchase.id}`}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {service.logoUrl ? (
                            <img 
                              src={service.logoUrl} 
                              alt={service.name}
                              className="w-16 h-16 object-contain rounded-md"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-md flex items-center justify-center">
                              <span className="text-primary font-bold text-xl">
                                {service.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{service.name}</h3>
                              {purchase.status === "pending_payment" ? (
                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                  Ожидает оплаты
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {service.category} • {service.description.substring(0, 80)}...
                            </p>
                            <div className="flex flex-wrap gap-3 text-sm mb-3">
                              <span className="text-muted-foreground">
                                Plan: <strong className="text-foreground">{purchase.planName}</strong>
                              </span>
                              <span className="text-muted-foreground">
                                Price: <strong className="text-foreground">${purchase.price}/{purchase.billingCycle === "monthly" ? "mo" : "yr"}</strong>
                              </span>
                              <span className="text-muted-foreground">
                                Since: <strong className="text-foreground">{new Date(purchase.purchaseDate).toLocaleDateString()}</strong>
                              </span>
                            </div>
                            {(purchase.login || purchase.password || purchase.paymentUrl) && (
                              <div className="p-3 bg-muted/50 rounded-md space-y-2 text-sm">
                                <h4 className="font-medium text-xs text-muted-foreground uppercase">Доступ к сервису</h4>
                                {purchase.login && (
                                  <div>
                                    <span className="text-muted-foreground">Логин: </span>
                                    <span className="font-mono" data-testid={`text-login-${purchase.id}`}>{purchase.login}</span>
                                  </div>
                                )}
                                {purchase.password && (
                                  <div>
                                    <span className="text-muted-foreground">Пароль: </span>
                                    <span className="font-mono" data-testid={`text-password-${purchase.id}`}>••••••••</span>
                                  </div>
                                )}
                                {purchase.paymentUrl && (
                                  <div>
                                    <span className="text-muted-foreground">Ссылка на оплату: </span>
                                    <a 
                                      href={purchase.paymentUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline font-mono break-all"
                                      data-testid={`link-payment-url-${purchase.id}`}
                                    >
                                      {purchase.paymentUrl}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {purchase.status === "pending_payment" && purchase.paymentMethod === "invoice" && (
                            <>
                              {purchase.invoiceUrl && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    if (purchase.invoiceUrl) {
                                      const link = document.createElement('a');
                                      link.href = purchase.invoiceUrl;
                                      link.download = `Счет_${purchase.id}.txt`;
                                      link.click();
                                    }
                                  }}
                                  data-testid={`button-download-invoice-${purchase.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Скачать счет
                                </Button>
                              )}
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => handleUploadReceipt(purchase.id)}
                                data-testid={`button-upload-receipt-${purchase.id}`}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Загрузить счет
                              </Button>
                            </>
                          )}
                          <Link href={`/service/${service.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-${purchase.id}`}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                          {purchase.status !== "pending_payment" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleCancelSubscription(purchase.id)}
                              data-testid={`button-cancel-${purchase.id}`}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No active subscriptions</h3>
                  <p className="text-muted-foreground mb-4">
                    Discover AI tools that can transform your workflow
                  </p>
                  <Link href="/">
                    <Button data-testid="button-browse-catalog">Browse Catalog</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {purchases.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {purchases.map((purchase) => {
                      const service = getPurchasedService(purchase.serviceId);
                      if (!service) return null;

                      return (
                        <div 
                          key={purchase.id}
                          className="flex items-center justify-between pb-4 border-b border-border last:border-0"
                          data-testid={`row-purchase-${purchase.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(purchase.purchaseDate).toLocaleDateString()} • {purchase.planName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant={purchase.status === "active" ? "default" : "outline"}
                              className={purchase.status === "active" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                            >
                              {purchase.status}
                            </Badge>
                            <span className="font-semibold">${purchase.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full" data-testid="button-download-history">
                      <Download className="h-4 w-4 mr-2" />
                      Download Purchase History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No purchase history</h3>
                  <p className="text-muted-foreground">
                    Your purchases will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Doe" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    type="email" 
                    defaultValue="john.doe@example.com" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                    data-testid="input-email"
                  />
                </div>
                <Button data-testid="button-save-settings">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-md">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                    </div>
                  </div>
                  <Badge>Default</Badge>
                </div>
                <Button variant="outline" className="w-full" data-testid="button-add-payment">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
