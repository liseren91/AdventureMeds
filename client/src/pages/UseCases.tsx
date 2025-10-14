import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, ShoppingCart, Briefcase, Users } from "lucide-react";

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
    industry: "Marketing",
    title: "Content Marketing Team",
    description: "A digital marketing agency uses AI tools to streamline content creation, social media management, and campaign optimization.",
    tools: ["Jasper AI", "Canva AI", "Copy.ai", "Buffer AI"],
    icon: <Building2 className="h-6 w-6" />,
    benefits: [
      "50% faster content creation",
      "Consistent brand voice across platforms",
      "Data-driven content strategy",
      "Reduced design costs"
    ]
  },
  {
    industry: "E-commerce",
    title: "Online Retail Store",
    description: "An e-commerce business leverages AI to create product descriptions, marketing materials, and customer support content.",
    tools: ["Copy.ai", "ChatGPT Plus", "Grammarly", "Canva AI"],
    icon: <ShoppingCart className="h-6 w-6" />,
    benefits: [
      "Automated product descriptions",
      "Improved SEO performance",
      "Higher conversion rates",
      "24/7 customer support content"
    ]
  },
  {
    industry: "Tech Startup",
    title: "SaaS Company",
    description: "A software startup uses AI tools for documentation, blog posts, social media, and customer communications.",
    tools: ["ChatGPT Plus", "Jasper AI", "Grammarly", "Buffer AI"],
    icon: <Briefcase className="h-6 w-6" />,
    benefits: [
      "Professional documentation",
      "Consistent messaging",
      "Faster time to market",
      "Better user engagement"
    ]
  },
  {
    industry: "Professional Services",
    title: "Consulting Firm",
    description: "A consulting firm utilizes AI for proposal writing, client presentations, and research synthesis.",
    tools: ["ChatGPT Plus", "Grammarly", "Canva AI", "Jasper AI"],
    icon: <Users className="h-6 w-6" />,
    benefits: [
      "Winning proposals faster",
      "Professional presentations",
      "Better client insights",
      "Competitive advantage"
    ]
  }
];

export default function UseCases() {
  const [selectedIndustry, setSelectedIndustry] = useState("Marketing");

  const currentUseCase = USE_CASES.find(uc => uc.industry === selectedIndustry);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-usecases-title">
            Use Cases by Industry
          </h1>
          <p className="text-muted-foreground mt-2">
            See how different industries leverage AI tools for success
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
                      <h3 className="text-xl font-semibold">Key Benefits</h3>
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
                      <h3 className="text-xl font-semibold">Recommended Tools</h3>
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
                          This stack provides a complete solution for {useCase.industry.toLowerCase()}
                        </p>
                        <Badge className="w-full justify-center py-2">
                          {useCase.tools.length} Tools
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
