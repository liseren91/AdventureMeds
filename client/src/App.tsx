import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Favorites from "@/pages/Favorites";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Notifications from "@/pages/Notifications";
import ServiceDetail from "@/pages/ServiceDetail";
import CostCalculator from "@/pages/CostCalculator";
import UseCases from "@/pages/UseCases";
import NotFound from "@/pages/not-found";

function Router() {
  //todo: remove mock functionality - use state management or API
  const [favoritesCount] = useState(3);
  const [comparingCount] = useState(2);
  const [notificationsCount] = useState(2);

  return (
    <div className="min-h-screen">
      <Navbar
        favoritesCount={favoritesCount}
        comparingCount={comparingCount}
        notificationsCount={notificationsCount}
      />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/compare" component={Compare} />
        <Route path="/history" component={History} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/calculator" component={CostCalculator} />
        <Route path="/use-cases" component={UseCases} />
        <Route path="/service/:id" component={ServiceDetail} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
