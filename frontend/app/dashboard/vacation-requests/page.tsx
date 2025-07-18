"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Filter, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Dados de exemplo - TODO: buscar da API
const vacationRequests = [
  {
    id: 1,
    startDate: "2025-07-28",
    endDate: "2025-08-08",
    businessDays: 10,
    status: "pending",
    reason: "Viagem em família para a praia",
    emergencyContact: "Maria Santos - (11) 99999-9999",
    requestedAt: "2025-07-15",
    approvedBy: null,
    approvalComment: null,
  },
  {
    id: 2,
    startDate: "2025-05-10", 
    endDate: "2025-05-17",
    businessDays: 8,
    status: "approved",
    reason: "Descanso pessoal",
    emergencyContact: "Maria Santos - (11) 99999-9999",
    requestedAt: "2025-04-28",
    approvedBy: "Maria Silva",
    approvalComment: "Aprovado. Boas férias!",
  },
  {
    id: 3,
    startDate: "2025-03-15",
    endDate: "2025-03-22", 
    businessDays: 8,
    status: "approved",
    reason: "Viagem internacional",
    emergencyContact: "João Santos - (11) 88888-8888",
    requestedAt: "2025-02-28",
    approvedBy: "Maria Silva",
    approvalComment: "Aprovado",
  },
  {
    id: 4,
    startDate: "2025-02-01",
    endDate: "2025-02-05",
    businessDays: 5,
    status: "rejected",
    reason: "Período pessoal",
    emergencyContact: "Maria Santos - (11) 99999-9999",
    requestedAt: "2025-01-15",
    approvedBy: "Maria Silva",
    approvalComment: "Rejeitado - Período de alta demanda na equipe",
  },
];

export default function VacationRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const filteredRequests = vacationRequests.filter((request) => {
    const matchesSearch = 
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.emergencyContact.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Solicitações de Férias</h1>
          <p className="text-gray-600">Gerencie suas solicitações de férias</p>
        </div>
        <Link href="/dashboard/vacation-requests/new">
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
            <Plus className="h-4 w-4 mr-2" />
            Nova Solicitação
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por motivo ou contato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("approved")}
              >
                Aprovados
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("rejected")}
              >
                Rejeitados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Tente ajustar os filtros para encontrar suas solicitações."
                  : "Você ainda não fez nenhuma solicitação de férias."
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Link href="/dashboard/vacation-requests/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira solicitação
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </h3>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dias úteis:</strong> {request.businessDays} dias</p>
                        <p><strong>Solicitado em:</strong> {formatDate(request.requestedAt)}</p>
                      </div>
                      <div>
                        <p><strong>Motivo:</strong> {request.reason || "Não informado"}</p>
                        <p><strong>Contato:</strong> {request.emergencyContact}</p>
                      </div>
                    </div>

                    {/* Detalhes da aprovação/rejeição */}
                    {(request.status === "approved" || request.status === "rejected") && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>
                            {request.status === "approved" ? "Aprovado" : "Rejeitado"} por:
                          </strong> {request.approvedBy}
                        </p>
                        {request.approvalComment && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Comentário:</strong> {request.approvalComment}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {request.status === "pending" && (
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                    {request.status === "pending" && (
                      <Button variant="destructive" size="sm">
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {vacationRequests.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {vacationRequests.filter(r => r.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vacationRequests.filter(r => r.status === "approved").length}
              </div>
              <div className="text-sm text-gray-600">Aprovadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {vacationRequests.filter(r => r.status === "rejected").length}
              </div>
              <div className="text-sm text-gray-600">Rejeitadas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}