
import { Switch, Route } from "wouter";
import { AppProvider } from "./contexts/AppContext";
import { Toaster } from "@/components/ui/toaster";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import { useApp } from "./contexts/AppContext";
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <AppRouter />
          <Toaster />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
