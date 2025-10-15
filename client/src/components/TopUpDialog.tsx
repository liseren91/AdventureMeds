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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wallet, Building2, User } from "lucide-react";
import { type Payer, PAYMENT_METHODS } from "@/lib/payersData";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface TopUpDialogProps {
  payers: Payer[];
  onTopUp: (payerId: string, amount: number, method: string) => void;
}

export default function TopUpDialog({ payers, onTopUp }: TopUpDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPayer, setSelectedPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { toast } = useToast();

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleTopUp = () => {
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

    const method = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    onTopUp(selectedPayer, amountNum, method?.name || paymentMethod);
    
    toast({
      title: "Баланс пополнен",
      description: `Успешно пополнено на ${amountNum} ₽`,
    });

    setOpen(false);
    setAmount("");
    setSelectedPayer("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700" data-testid="button-top-up">
          <Wallet className="h-4 w-4" />
          Пополнить баланс
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Пополнить баланс</DialogTitle>
          <DialogDescription>
            Выберите плательщика и сумму для пополнения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Плательщики</Label>
            <div className="space-y-2">
              {payers.map((payer) => (
                <Card
                  key={payer.id}
                  className={`p-4 cursor-pointer hover-elevate transition-all ${
                    selectedPayer === payer.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedPayer(payer.id)}
                  data-testid={`select-payer-${payer.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                      {payer.type === "company" ? (
                        <Building2 className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{payer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Тип: {payer.type === "company" ? "company" : "individual"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Баланс:</p>
                      <p className="font-semibold">
                        {payer.balance.toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Пополнить счет на *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="2000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-top-up-amount"
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {quickAmounts.map((qa) => (
                <Button
                  key={qa}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(qa.toString())}
                  data-testid={`button-quick-amount-${qa}`}
                >
                  {qa} ₽
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Выберите способ оплаты</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {PAYMENT_METHODS.map((method) => (
                <div 
                  key={method.id}
                  className="flex items-center space-x-2 p-3 border border-border rounded-md hover-elevate cursor-pointer"
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleTopUp} data-testid="button-confirm-top-up">
            Пополнить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
