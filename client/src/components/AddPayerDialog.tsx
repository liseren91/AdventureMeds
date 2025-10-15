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
import { Plus } from "lucide-react";
import { type Payer } from "@/lib/payersData";
import { useToast } from "@/hooks/use-toast";

interface AddPayerDialogProps {
  onPayerAdded: (payer: Payer) => void;
}

export default function AddPayerDialog({ onPayerAdded }: AddPayerDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"company" | "individual">("company");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("0");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название плательщика",
        variant: "destructive",
      });
      return;
    }

    let newPayer: Payer;
    
    if (type === "company") {
      newPayer = {
        id: `payer-${Date.now()}`,
        type: "company",
        companyName: name.trim(),
        balance: parseFloat(balance) || 0,
        services: [],
      };
    } else {
      // Split full name into first and last name
      const nameParts = name.trim().split(" ");
      const lastName = nameParts[0] || "";
      const firstName = nameParts.slice(1).join(" ") || "";
      
      newPayer = {
        id: `payer-${Date.now()}`,
        type: "individual",
        firstName,
        lastName,
        balance: parseFloat(balance) || 0,
        services: [],
      };
    }

    onPayerAdded(newPayer);
    toast({
      title: "Плательщик добавлен",
      description: `${name.trim()} успешно создан`,
    });

    setOpen(false);
    setName("");
    setBalance("0");
    setType("company");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" data-testid="button-add-payer">
          <Plus className="h-4 w-4" />
          Добавить плательщика
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить плательщика</DialogTitle>
          <DialogDescription>
            Создайте нового плательщика для управления подписками
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Тип плательщика</Label>
            <RadioGroup value={type} onValueChange={(v) => setType(v as "company" | "individual")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company">Юридическое лицо</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual">Физическое лицо</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              {type === "company" ? "Название организации" : "ФИО"}
            </Label>
            <Input
              id="name"
              placeholder={type === "company" ? 'ООО "Компания"' : "Иванов Иван Иванович"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-payer-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="balance">Начальный баланс (₽)</Label>
            <Input
              id="balance"
              type="number"
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              data-testid="input-initial-balance"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} data-testid="button-create-payer">
            Создать
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
