import { Switch, Route } from "wouter";
import { AppProvider } from "./contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";

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
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
        <Toaster />
      </div>
    </AppProvider>
  );
}

export default App;
