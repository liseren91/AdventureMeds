import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Favorites from "@/pages/Favorites";
import Compare from "@/pages/Compare";
import History from "@/pages/History";
import Notifications from "@/pages/Notifications";
import ServiceDetail from "@/pages/ServiceDetail";
import CostCalculator from "@/pages/CostCalculator";
import UseCases from "@/pages/UseCases";
import JobImpact from "@/pages/JobImpact";
import Account from "@/pages/Account";
import Finances from "@/pages/Finances";
import Cart from "@/pages/Cart";
import ClientSurvey from "@/pages/ClientSurvey";
import Checkout from "@/pages/Checkout";
import Help from "@/pages/Help";
import MyServices from "@/pages/MyServices";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import { getCartFromStorage } from "@/lib/cartData";

function Router() {
  const { favorites, comparing, unreadNotificationsCount } = useApp();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartFromStorage().length);
    };
    
    updateCartCount();
    
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener("storage", updateCartCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar
        favoritesCount={favorites.size}
        comparingCount={comparing.size}
        notificationsCount={unreadNotificationsCount}
        cartCount={cartCount}
      />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/favorites" component={Favorites} />
        <Route path="/compare" component={Compare} />
        <Route path="/history" component={History} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/calculator" component={CostCalculator} />
        <Route path="/use-cases" component={UseCases} />
        <Route path="/job-impact" component={JobImpact} />
        <Route path="/help" component={Help} />
        <Route path="/account" component={Account} />
        <Route path="/finances" component={Finances} />
        <Route path="/my-services" component={MyServices} />
        <Route path="/cart" component={Cart} />
        <Route path="/survey" component={ClientSurvey} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/service/:id" component={ServiceDetail} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
