import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  BookOpen, 
  CreditCard, 
  Settings, 
  Sparkles,
  Search,
  DollarSign,
  Users,
  ShoppingCart
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function Help() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <Breadcrumb data-testid="breadcrumb-help">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" data-testid="link-breadcrumb-home">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="text-breadcrumb-help">Помощь</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-help-title">
            Центр помощи
          </h1>
          <p className="text-muted-foreground text-lg">
            Ответы на частые вопросы о платформе AI for Business
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover-elevate cursor-pointer" onClick={() => document.getElementById('getting-started')?.scrollIntoView({ behavior: 'smooth' })}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Начало работы</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth' })}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Оплата и тарифы</CardTitle>
              </div>
            </CardHeader>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => document.getElementById('glossary')?.scrollIntoView({ behavior: 'smooth' })}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">Глоссарий терминов</CardTitle>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Getting Started */}
        <Card id="getting-started">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Начало работы</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-is">
                <AccordionTrigger className="text-left">
                  Что такое AI for Business?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  AI for Business — это платформа-каталог AI-инструментов для автоматизации бизнес-процессов. 
                  Мы помогаем находить, сравнивать и подключать лучшие AI-сервисы для вашего бизнеса: 
                  от генерации текстов до создания дизайна и аналитики.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-start">
                <AccordionTrigger className="text-left">
                  Как начать пользоваться платформой?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Шаг 1:</strong> Изучите каталог сервисов на главной странице</p>
                  <p><strong>Шаг 2:</strong> Используйте фильтры для поиска нужных инструментов</p>
                  <p><strong>Шаг 3:</strong> Добавьте интересные сервисы в Избранное или Сравнение</p>
                  <p><strong>Шаг 4:</strong> Создайте плательщика (источник средств)</p>
                  <p><strong>Шаг 5:</strong> Оформите подписку на выбранный сервис</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="choosing-service">
                <AccordionTrigger className="text-left">
                  Как выбрать подходящий сервис?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>Воспользуйтесь нашими инструментами:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Фильтры:</strong> отберите по категории, цене, рейтингу</li>
                    <li><strong>Сравнение:</strong> сопоставьте до 4 сервисов одновременно</li>
                    <li><strong>Примеры использования:</strong> посмотрите кейсы по отраслям</li>
                    <li><strong>Калькулятор:</strong> рассчитайте стоимость для вашего бизнеса</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Payment & Billing */}
        <Card id="payment">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Оплата и тарифы</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="payers">
                <AccordionTrigger className="text-left">
                  Что такое "плательщик"?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>
                    <strong>Плательщик</strong> — это источник средств для оплаты AI-сервисов. 
                    Вы можете создать несколько плательщиков для разных целей.
                  </p>
                  <p><strong>Два типа плательщиков:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Юридическое лицо:</strong> для бизнеса, с возможностью оплаты по счёту, корпоративной картой или с баланса компании</li>
                    <li><strong>Физическое лицо:</strong> для личного использования с оплатой банковской картой</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="payment-methods">
                <AccordionTrigger className="text-left">
                  Какие способы оплаты доступны?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p><strong>Для физических лиц:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Банковские карты (Visa, Mastercard, МИР)</li>
                    <li>ЮMoney</li>
                    <li>СБП (Система быстрых платежей)</li>
                    <li>SberPay</li>
                  </ul>
                  <p className="mt-3"><strong>Для юридических лиц:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Списание с баланса компании</li>
                    <li>Корпоративная карта</li>
                    <li>Оплата по счёту (с выставлением счёта на email)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="currency">
                <AccordionTrigger className="text-left">
                  Почему цены в долларах, а оплата в рублях?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Большинство AI-сервисов — зарубежные, поэтому их официальные цены указаны в USD. 
                  Мы показываем цену в долларах и автоматически конвертируем в рубли по курсу ЦБ + 5% 
                  (текущий курс: 1 USD = 99.75 ₽). Оплата всегда происходит в рублях.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="subscription">
                <AccordionTrigger className="text-left">
                  Как работает подписка?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-2">
                  <p>После оформления подписки:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Заказ обрабатывается 1-7 дней</li>
                    <li>Вы получаете доступы на email</li>
                    <li>Подписка активируется автоматически</li>
                    <li>Списание средств происходит ежемесячно/ежегодно</li>
                    <li>Вы можете отменить в любой момент в разделе "Аккаунт"</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Glossary */}
        <Card id="glossary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Глоссарий терминов</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ai">
                <AccordionTrigger className="text-left">
                  AI (Искусственный интеллект)
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Технология, позволяющая компьютерам выполнять задачи, которые обычно требуют человеческого интеллекта: 
                  генерация текстов, создание изображений, анализ данных, перевод языков и многое другое.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="agent">
                <AccordionTrigger className="text-left">
                  AI-агент
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  AI-система, способная самостоятельно выполнять задачи: писать тексты, создавать дизайн, 
                  анализировать данные. Примеры: ChatGPT, Midjourney, Jasper AI.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="prompt">
                <AccordionTrigger className="text-left">
                  Промпт (Prompt)
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Текстовый запрос к AI-сервису. Например: "Напиши пост в Instagram про новое меню кафе" — это промпт.
                  Качество результата зависит от качества промпта.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="tokens">
                <AccordionTrigger className="text-left">
                  Токены
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Единица измерения текста в AI. 1 токен ≈ 4 символа на русском или 1 слово на английском. 
                  Тарифы часто ограничивают количество токенов в месяц.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="api">
                <AccordionTrigger className="text-left">
                  API (Application Programming Interface)
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Способ интеграции AI-сервиса с вашими системами. Например, встроить ChatGPT в ваш сайт 
                  или CRM-систему через API.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="freemium">
                <AccordionTrigger className="text-left">
                  Freemium
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Модель, где есть бесплатная версия с ограничениями и платная с расширенными возможностями. 
                  Позволяет попробовать сервис перед покупкой.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Дополнительная помощь</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Не нашли ответ?</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Воспользуйтесь поиском по сайту или посмотрите раздел "Примеры использования"
                </p>
              </div>

              <div className="p-4 border border-border rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Нужна консультация?</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Свяжитесь с нашей поддержкой: support@aiforbusiness.ru или чат в правом нижнем углу
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
