import { useState } from "react";
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
import { Check, ShoppingBag, CheckCircle2, CreditCard } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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
}

export default function PurchaseDialog({ service }: PurchaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number>(1); // Default to middle tier
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [step, setStep] = useState<"select" | "confirm" | "success">("select");
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handlePurchase = () => {
    const tier = service.pricingTiers[selectedPlan];
    const priceValue = parseFloat(tier.price.replace(/[^0-9.]/g, '')) || 0;
    
    const purchase = {
      id: Date.now().toString(),
      serviceId: service.id,
      planName: tier.name,
      price: priceValue,
      purchaseDate: new Date().toISOString(),
      status: "active" as const,
      billingCycle: billingCycle,
    };

    const existing = localStorage.getItem("userPurchases");
    const purchases = existing ? JSON.parse(existing) : [];
    purchases.push(purchase);
    localStorage.setItem("userPurchases", JSON.stringify(purchases));

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
    }, 200);
  };

  const handleViewAccount = () => {
    handleClose();
    setLocation("/account");
  };

  const selectedTier = service.pricingTiers[selectedPlan];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    <CreditCard className="h-5 w-5" />
                    <h3 className="font-semibold">Payment Method</h3>
                  </div>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setStep("select")} data-testid="button-back-purchase">
                  Back
                </Button>
                <Button onClick={handlePurchase} data-testid="button-confirm-purchase">
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
