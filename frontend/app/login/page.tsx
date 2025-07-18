"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("maria.gestora@empresa.com");
  const [password, setPassword] = useState("123456");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual login API call
      // For now, simulate login with mock user data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Mock user data based on email for testing
      const mockUser = email === "maria.gestora@empresa.com" 
        ? {
            id: "manager-1",
            name: "Maria Gestora",
            email: "maria.gestora@empresa.com",
            role: "manager" as const,
            department: "Gestão",
            vacationBalance: 30,
          }
        : {
            id: "emp-1",
            name: "João Santos",
            email: "joao.santos@empresa.com",
            role: "employee" as const,
            department: "Desenvolvimento",
            vacationBalance: 22,
          };

      login("mock-token", mockUser);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
              SF
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sistema de Férias
            </h1>
            <p className="text-gray-600">Gerenciamento de Solicitações</p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <p><strong>Gestor:</strong> maria.gestora@empresa.com</p>
              <p><strong>Funcionário:</strong> joao.santos@empresa.com</p>
              <p><strong>Senha:</strong> 123456</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <Link
              href="/forgot-password"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}