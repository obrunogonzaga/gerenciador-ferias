"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // TODO: Fetch actual data from API
  const stats = {
    availableDays: 22,
    usedDays: 8,
    pendingRequests: 1,
    totalDays: 30,
  };

  const recentRequests = [
    {
      id: 1,
      period: "28 Jul - 8 Ago",
      days: 10,
      status: "pending",
      requestedAt: "15/07/2025",
    },
    {
      id: 2,
      period: "10 Mai - 17 Mai",
      days: 8,
      status: "approved",
      requestedAt: "28/04/2025",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprovado";
      case "pending":
        return "Pendente";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Bem-vindo, João Santos!
        </h2>
        <p className="text-gray-600">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-t-purple-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-700">
              Dias Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.availableDays}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              de {stats.totalDays} dias totais
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-700">
              Dias Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.usedDays}
            </div>
            <p className="text-sm text-gray-500 mt-1">neste período</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-yellow-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium text-gray-700">
              Pendente Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.pendingRequests}
            </div>
            <p className="text-sm text-gray-500 mt-1">solicitação</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/dashboard/vacation-requests/new">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <CalendarDays className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="font-semibold">Solicitar Férias</div>
                      <div className="text-xs text-gray-500">
                        Criar nova solicitação
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/history">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <FileText className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="font-semibold">Meu Histórico</div>
                      <div className="text-xs text-gray-500">
                        Ver férias anteriores
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/notifications">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Clock className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="font-semibold">Notificações</div>
                      <div className="text-xs text-gray-500">
                        Ver atualizações
                      </div>
                    </div>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                  disabled
                >
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                  <div>
                    <div className="font-semibold">Configurações</div>
                    <div className="text-xs text-gray-500">
                      Ajustar preferências
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vacation Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Saldo de Férias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">
                  {stats.availableDays}
                </div>
                <div className="text-sm font-medium text-green-600">
                  dias disponíveis
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Direito: {stats.totalDays} dias</span>
                <span>Usado: {stats.usedDays} dias</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minhas Solicitações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {request.period}
                    </div>
                    <div className="text-sm text-gray-500">
                      Solicitado em {request.requestedAt}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {getStatusText(request.status)}
                  </span>
                </div>
              ))}
              <Link href="/dashboard/vacation-requests">
                <Button variant="link" className="w-full text-purple-600">
                  Ver todas →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}