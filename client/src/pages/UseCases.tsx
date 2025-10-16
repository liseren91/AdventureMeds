import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ShoppingCart, Briefcase, Users } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface UseCase {
  industry: string;
  title: string;
  description: string;
  tools: string[];
  icon: React.ReactNode;
  benefits: string[];
}

//todo: remove mock functionality - get from API
const USE_CASES: UseCase[] = [
  {
    industry: "Маркетинг",
    title: "Команда контент-маркетинга",
    description: "Агентство цифрового маркетинга использует AI-инструменты для создания контента, управления соцсетями и оптимизации кампаний.",
    tools: ["Jasper AI", "Canva AI", "Copy.ai", "Buffer AI"],
    icon: <Building2 className="h-6 w-6" />,
    benefits: [
      "На 50% быстрее создание контента",
      "Единый голос бренда на всех платформах",
      "Контент-стратегия на основе данных",
      "Снижение затрат на дизайн"
    ]
  },
  {
    industry: "E-commerce",
    title: "Интернет-магазин",
    description: "Онлайн-бизнес использует AI для создания описаний товаров, маркетинговых материалов и контента для поддержки клиентов.",
    tools: ["Copy.ai", "ChatGPT Plus", "Grammarly", "Canva AI"],
    icon: <ShoppingCart className="h-6 w-6" />,
    benefits: [
      "Автоматические описания товаров",
      "Улучшенное SEO",
      "Выше конверсия в продажу",
      "Контент для поддержки 24/7"
    ]
  },
  {
    industry: "Технологии",
    title: "SaaS компания",
    description: "Технологический стартап использует AI для документации, статей в блог, соцсетей и коммуникации с клиентами.",
    tools: ["ChatGPT Plus", "Jasper AI", "Grammarly", "Buffer AI"],
    icon: <Briefcase className="h-6 w-6" />,
    benefits: [
      "Профессиональная документация",
      "Последовательная коммуникация",
      "Быстрый выход на рынок",
      "Лучшее вовлечение пользователей"
    ]
  },
  {
    industry: "Консалтинг",
    title: "Консалтинговая компания",
    description: "Консалтинговая фирма использует AI для написания предложений, презентаций клиентам и синтеза исследований.",
    tools: ["ChatGPT Plus", "Grammarly", "Canva AI", "Jasper AI"],
    icon: <Users className="h-6 w-6" />,
    benefits: [
      "Быстрее побеждающие предложения",
      "Профессиональные презентации",
      "Лучшее понимание клиентов",
      "Конкурентное преимущество"
    ]
  }
];

export default function UseCases() {
  const [selectedIndustry, setSelectedIndustry] = useState("Маркетинг");

  const currentUseCase = USE_CASES.find(uc => uc.industry === selectedIndustry);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb data-testid="breadcrumb-usecases">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-breadcrumb-home">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="text-breadcrumb-usecases">Примеры использования</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-usecases-title">
            Примеры использования по отраслям
          </h1>
          <p className="text-muted-foreground mt-2">
            Узнайте, как разные отрасли используют AI-инструменты для успеха
          </p>
        </div>

        <Tabs value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <TabsList className="grid w-full grid-cols-4">
            {USE_CASES.map(useCase => (
              <TabsTrigger
                key={useCase.industry}
                value={useCase.industry}
                data-testid={`tab-${useCase.industry.toLowerCase()}`}
              >
                {useCase.industry}
              </TabsTrigger>
            ))}
          </TabsList>

          {USE_CASES.map(useCase => (
            <TabsContent key={useCase.industry} value={useCase.industry} className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-md">
                          {useCase.icon}
                        </div>
                        <h2 className="text-2xl font-bold">{useCase.title}</h2>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {useCase.description}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Ключевые преимущества</h3>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {useCase.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-muted-foreground pt-0.5">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="sticky top-24">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">Рекомендуемые инструменты</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {useCase.tools.map((tool, index) => (
                        <div
                          key={index}
                          className="p-3 border border-border rounded-md hover-elevate transition-colors"
                        >
                          <p className="font-medium">{tool}</p>
                        </div>
                      ))}
                      
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-3">
                          Этот набор инструментов — полное решение для отрасли "{useCase.industry}"
                        </p>
                        <Badge className="w-full justify-center py-2">
                          {useCase.tools.length} инструментов
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
