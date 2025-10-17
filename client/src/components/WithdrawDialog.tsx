import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building2, User, CheckCircle2, AlertCircle } from "lucide-react";
import { type Payer, PAYMENT_METHODS } from "@/lib/payersData";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface WithdrawDialogProps {
  payers: Payer[];
  onWithdraw: (payerId: string, amount: number, method: string) => void;
  trigger?: React.ReactNode;
}

export default function WithdrawDialog({ payers, onWithdraw, trigger }: WithdrawDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const { toast } = useToast();

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const selectedPayerData = useMemo(() => {
    return payers.find((p) => p.id === selectedPayer);
  }, [payers, selectedPayer]);

  const filteredPaymentMethods = useMemo(() => {
    if (!selectedPayerData) return PAYMENT_METHODS;
    
    if (selectedPayerData.type === "company") {
      return PAYMENT_METHODS.filter(
        (m) => m.legalOnly || (!m.individualOnly && !m.legalOnly)
      );
    } else {
      return PAYMENT_METHODS.filter(
        (m) => m.individualOnly || (!m.individualOnly && !m.legalOnly)
      );
    }
  }, [selectedPayerData]);

  const handleWithdraw = () => {
    const amountNum = parseFloat(amount);
    
    if (!selectedPayer) {
      toast({
        title: "Ошибка",
        description: "Выберите плательщика",
        variant: "destructive",
      });
      return;
    }

    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Ошибка",
        description: "Введите корректную сумму",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Ошибка",
        description: "Выберите способ получения",
        variant: "destructive",
      });
      return;
    }

    const payer = payers.find(p => p.id === selectedPayer);
    if (payer && payer.balance < amountNum) {
      toast({
        title: "Недостаточно средств",
        description: `На балансе ${payer.balance.toLocaleString('ru-RU')} ₽, а требуется ${amountNum.toLocaleString('ru-RU')} ₽`,
        variant: "destructive",
      });
      return;
    }

    const method = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    onWithdraw(selectedPayer, amountNum, method?.name || paymentMethod);
    
    toast({
      title: "Средства списаны",
      description: `Успешно списано ${amountNum.toLocaleString('ru-RU')} ₽`,
    });

    setOpen(false);
    setAmount("");
    setSelectedPayer("");
    setPaymentMethod("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2 bg-orange-600 hover:bg-orange-700" data-testid="button-withdraw">
            <CreditCard className="h-4 w-4" />
            Списать со счета
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Списать со счета</DialogTitle>
          <DialogDescription>
            Выберите плательщика, сумму и способ получения средств
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Плательщики</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {payers.map((payer) => {
                const payerName = payer.type === "company" 
                  ? payer.companyName 
                  : `${payer.firstName} ${payer.lastName}`;
                const hasLowBalance = payer.balance < 1000;
                
                return (
                  <Card
                    key={payer.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPayer === payer.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedPayer(payer.id)}
                    data-testid={`select-withdraw-payer-${payer.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                        payer.type === "company" ? "bg-gray-100" : "bg-blue-50"
                      }`}>
                        {payer.type === "company" ? (
                          <Building2 className="h-4 w-4 text-gray-600" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{payerName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Тип: {payer.type === "company" ? "company" : "individual"}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            Баланс: <span className="font-semibold text-foreground">
                              {payer.balance.toLocaleString('ru-RU')} ₽
                            </span>
                          </p>
                        </div>
                        {hasLowBalance ? (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            <span>Низкий баланс</span>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Достаточно средств</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="withdraw-amount" className="text-base font-semibold">Списать со счета *</Label>
            <div className="relative">
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="2000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12 text-lg"
                data-testid="input-withdraw-amount"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">
                ₽
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Быстрый выбор суммы:</p>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((qa) => (
                  <Button
                    key={qa}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(qa.toString())}
                    className="font-medium"
                    data-testid={`button-withdraw-quick-${qa}`}
                  >
                    {qa.toLocaleString('ru-RU')} ₽
                  </Button>
                ))}
              </div>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Будет списано: <span className="font-semibold text-foreground">
                    {parseFloat(amount).toLocaleString('ru-RU')} ₽
                  </span>
                </p>
              </div>
            )}
            {selectedPayerData && amount && parseFloat(amount) > selectedPayerData.balance && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Недостаточно средств на балансе
                </p>
              </div>
            )}
          </div>

          {selectedPayer && (
            <div className="space-y-3">
              <Label className="text-base font-semibold">Способ получения средств</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredPaymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`p-4 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : method.available
                        ? "hover:border-primary/50"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => method.available && setPaymentMethod(method.id)}
                    data-testid={`withdraw-method-${method.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl flex-shrink-0">{method.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{method.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
                        {method.legalOnly && (
                          <div className="text-xs text-purple-600 mt-1">Только для юр. лиц</div>
                        )}
                        {method.individualOnly && (
                          <div className="text-xs text-blue-600 mt-1">Только для физ. лиц</div>
                        )}
                      </div>
                      {paymentMethod === method.id && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground max-w-xs">
            Средства будут переведены в течение 1-3 рабочих дней
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleWithdraw} 
              disabled={!selectedPayer || !amount || !paymentMethod || (selectedPayerData && parseFloat(amount) > selectedPayerData.balance)}
              className="bg-orange-600 hover:bg-orange-700" 
              data-testid="button-confirm-withdraw"
            >
              Списать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
