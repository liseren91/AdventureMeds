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
import { Check, ShoppingBag, CheckCircle2, CreditCard, Building2, User, AlertTriangle, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Payer, Transaction } from "@/lib/payersData";
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
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("payers");
    if (stored) {
      const payersData = JSON.parse(stored);
      setPayers(payersData);
      if (payersData.length > 0 && !selectedPayerId) {
        setSelectedPayerId(payersData[0].id);
      }
    }
  }, [open]);

  const selectedPayer = payers.find(p => p.id === selectedPayerId);
  const tier = service.pricingTiers[selectedPlan];
  const priceValue = parseFloat(tier.price.replace(/[^0-9.]/g, '')) || 0;
  const hasInsufficientFunds = selectedPayer ? selectedPayer.balance < priceValue : true;

  const handlePurchase = () => {
    if (!selectedPayer || hasInsufficientFunds) {
      toast({
        title: "Insufficient funds",
        description: "Selected payer doesn't have enough balance",
        variant: "destructive",
      });
      return;
    }

    const purchase = {
      id: Date.now().toString(),
      serviceId: service.id,
      planName: tier.name,
      price: priceValue,
      purchaseDate: new Date().toISOString(),
      status: "active" as const,
      billingCycle: billingCycle,
      payerId: selectedPayerId,
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
                <DialogTitle className="text-2xl">Subscribe to {service.name}</DialogTitle>
              </div>
              <DialogDescription>
                Choose your plan and billing cycle to get started
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
                  Monthly
                </Button>
                <Button
                  variant={billingCycle === "yearly" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setBillingCycle("yearly")}
                  data-testid="button-billing-yearly"
                >
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 20%</Badge>
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
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">{tier.price}</span>
                          <span className="text-muted-foreground text-sm">
                            /{billingCycle === "monthly" ? "mo" : "yr"}
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
                  Cancel
                </Button>
                <Button onClick={() => setStep("confirm")} data-testid="button-continue-purchase">
                  Continue
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Confirm Your Purchase</DialogTitle>
              <DialogDescription>
                Review your subscription details before confirming
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
                            <span className="text-sm text-muted-foreground">Текущий баланс:</span>
                            <span className="font-semibold">${selectedPayer.balance.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Стоимость:</span>
                            <span className="font-semibold">${priceValue.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm text-muted-foreground">Остаток после покупки:</span>
                            <span className={`font-semibold ${hasInsufficientFunds ? 'text-destructive' : ''}`}>
                              ${(selectedPayer.balance - priceValue).toFixed(2)}
                            </span>
                          </div>
                          
                          {hasInsufficientFunds && (
                            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md mt-3">
                              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-destructive">Недостаточно средств</p>
                                <p className="text-xs text-destructive/80 mt-1">
                                  Пополните баланс плательщика на ${(priceValue - selectedPayer.balance).toFixed(2)} или выберите другого плательщика
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
                        У вас пока нет плательщиков. Создайте плательщика в разделе <a href="/finances" className="text-primary underline">Финансы</a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("select")} data-testid="button-back-purchase">
                  Back
                </Button>
                <Button 
                  onClick={handlePurchase} 
                  disabled={hasInsufficientFunds || !selectedPayer}
                  data-testid="button-confirm-purchase"
                >
                  Confirm Purchase
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
                <DialogTitle className="text-2xl">Purchase Successful!</DialogTitle>
                <DialogDescription className="text-base">
                  You've successfully subscribed to {service.name} - {selectedTier.name}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span className="font-medium">{selectedTier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Billing:</span>
                      <span className="font-medium capitalize">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-lg">{selectedTier.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={handleClose} data-testid="button-close-success">
                  Continue Browsing
                </Button>
                <Button className="flex-1" onClick={handleViewAccount} data-testid="button-view-account">
                  View My Account
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
