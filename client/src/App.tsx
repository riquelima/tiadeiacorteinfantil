import { Switch, Route } from "wouter";
import { AppProvider } from "./contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import { useApp } from "./contexts/AppContext";

function AppRouter() {
  const { isAuthenticated } = useApp();

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin/:page*">
        {isAuthenticated ? <AdminLayout /> : <LoginPage />}
      </Route>
      <Route>
        <LandingPage />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </AppProvider>
  );
}

export default App;
