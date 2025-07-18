"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Search, Download, Filter } from "lucide-react";

// Dados de exemplo - TODO: buscar da API
const vacationHistory = [
  {
    id: 1,
    startDate: "2025-08-15",
    endDate: "2025-08-25",
    businessDays: 10,
    status: "approved",
    reason: "Viagem internacional",
    approvedBy: "Maria Silva",
    requestedAt: "2025-07-30",
    approvedAt: "2025-08-01",
    year: 2025,
  },
  {
    id: 2,
    startDate: "2025-05-10",
    endDate: "2025-05-17",
    businessDays: 8,
    status: "approved",
    reason: "Descanso pessoal",
    approvedBy: "Maria Silva",
    requestedAt: "2025-04-28",
    approvedAt: "2025-04-30",
    year: 2025,
  },
  {
    id: 3,
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    businessDays: 8,
    status: "approved",
    reason: "Viagem familiar",
    approvedBy: "Maria Silva",
    requestedAt: "2025-02-28",
    approvedAt: "2025-03-01",
    year: 2025,
  },
  {
    id: 4,
    startDate: "2025-02-01",
    endDate: "2025-02-05",
    businessDays: 5,
    status: "rejected",
    reason: "Período pessoal",
    approvedBy: "Maria Silva",
    requestedAt: "2025-01-15",
    approvedAt: "2025-01-20",
    year: 2025,
  },
  {
    id: 5,
    startDate: "2024-12-20",
    endDate: "2024-12-31",
    businessDays: 10,
    status: "approved",
    reason: "Férias de final de ano",
    approvedBy: "Carlos Oliveira",
    requestedAt: "2024-11-15",
    approvedAt: "2024-11-18",
    year: 2024,
  },
  {
    id: 6,
    startDate: "2024-07-10",
    endDate: "2024-07-20",
    businessDays: 10,
    status: "approved",
    reason: "Viagem de verão",
    approvedBy: "Carlos Oliveira",
    requestedAt: "2024-06-15",
    approvedAt: "2024-06-18",
    year: 2024,
  },
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

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

  const getUniqueYears = () => {
    return [...new Set(vacationHistory.map(item => item.year))].sort((a, b) => b - a);
  };

  const filteredHistory = vacationHistory.filter((item) => {
    const matchesSearch = 
      item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.approvedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesYear = yearFilter === "all" || item.year.toString() === yearFilter;
    
    return matchesSearch && matchesStatus && matchesYear;
  });

  // Estatísticas
  const currentYear = new Date().getFullYear();
  const currentYearHistory = vacationHistory.filter(item => item.year === currentYear);
  const approvedCurrentYear = currentYearHistory.filter(item => item.status === "approved");
  const totalDaysUsed = approvedCurrentYear.reduce((sum, item) => sum + item.businessDays, 0);

  const exportToCSV = () => {
    const headers = ["Data Início", "Data Fim", "Dias Úteis", "Status", "Motivo", "Aprovado Por", "Solicitado Em"];
    const csvContent = [
      headers.join(","),
      ...filteredHistory.map(item => [
        formatDate(item.startDate),
        formatDate(item.endDate),
        item.businessDays,
        getStatusText(item.status),
        `"${item.reason}"`,
        item.approvedBy,
        formatDate(item.requestedAt)
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico-ferias-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-6 w-6 mr-2" />
            Histórico de Férias
          </h1>
          <p className="text-gray-600">Visualize todo seu histórico de solicitações</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Estatísticas do Ano Atual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{currentYear}</div>
              <div className="text-sm text-gray-600">Ano Atual</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalDaysUsed}</div>
              <div className="text-sm text-gray-600">Dias Utilizados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{approvedCurrentYear.length}</div>
              <div className="text-sm text-gray-600">Férias Aprovadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{30 - totalDaysUsed}</div>
              <div className="text-sm text-gray-600">Dias Restantes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por motivo ou aprovador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {getUniqueYears().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Histórico */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros para encontrar registros de férias.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </h3>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                      <Badge variant="outline">
                        {item.year}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Dias úteis:</strong> {item.businessDays} dias</p>
                        <p><strong>Motivo:</strong> {item.reason}</p>
                      </div>
                      <div>
                        <p><strong>Solicitado em:</strong> {formatDate(item.requestedAt)}</p>
                        <p><strong>Processado em:</strong> {formatDate(item.approvedAt)}</p>
                      </div>
                      <div>
                        <p><strong>Aprovado por:</strong> {item.approvedBy}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo por Ano */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Ano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getUniqueYears().map(year => {
              const yearData = vacationHistory.filter(item => item.year === year);
              const approved = yearData.filter(item => item.status === "approved");
              const totalDays = approved.reduce((sum, item) => sum + item.businessDays, 0);
              
              return (
                <div key={year} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-900">{year}</h4>
                    <p className="text-sm text-gray-600">
                      {approved.length} período{approved.length !== 1 ? "s" : ""} aprovado{approved.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{totalDays}</div>
                    <div className="text-sm text-gray-600">dias utilizados</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}