import { Link, useLocation } from "wouter";
import { Heart, Home, GitCompare, History, Bell, Calculator, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  favoritesCount?: number;
  comparingCount?: number;
  notificationsCount?: number;
}

export default function Navbar({ 
  favoritesCount = 0, 
  comparingCount = 0,
  notificationsCount = 0
}: NavbarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <a className="text-2xl font-bold hover-elevate px-3 py-2 rounded-md transition-colors" data-testid="link-home-logo">
              AI<span className="text-primary">for</span>Business
            </a>
          </Link>

          <div className="flex items-center gap-1">
            <Button
              asChild
              variant={isActive("/") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-home"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/favorites") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-favorites"
            >
              <Link href="/favorites">
                <Heart className="h-4 w-4" />
                Favorites
                {favoritesCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {favoritesCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/compare") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-compare"
            >
              <Link href="/compare">
                <GitCompare className="h-4 w-4" />
                Compare
                {comparingCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {comparingCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/history") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-history"
            >
              <Link href="/history">
                <History className="h-4 w-4" />
                History
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/notifications") ? "secondary" : "ghost"}
              className="gap-2 relative"
              data-testid="button-nav-notifications"
            >
              <Link href="/notifications">
                <Bell className="h-4 w-4" />
                Notifications
                {notificationsCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {notificationsCount}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/calculator") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-calculator"
            >
              <Link href="/calculator">
                <Calculator className="h-4 w-4" />
                Calculator
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive("/use-cases") ? "secondary" : "ghost"}
              className="gap-2"
              data-testid="button-nav-usecases"
            >
              <Link href="/use-cases">
                <Briefcase className="h-4 w-4" />
                Use Cases
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
