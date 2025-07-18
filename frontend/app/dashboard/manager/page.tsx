"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Clock, CheckCircle, XCircle, Eye, MessageSquare } from "lucide-react";

// Dados de exemplo - TODO: buscar da API
const managerStats = {
  teamMembersCount: 3,
  pendingRequestsCount: 2,
  approvedRequestsCount: 8,
  totalVacationDays: 42,
  currentYear: 2025,
};

const pendingRequests = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "João Santos",
      email: "joao.santos@empresa.com",
      department: "Desenvolvimento",
    },
    startDate: "2025-07-28",
    endDate: "2025-08-08",
    businessDays: 10,
    reason: "Viagem em família para a praia",
    emergencyContact: "Maria Santos - (11) 99999-9999",
    createdAt: "2025-07-15T10:00:00Z",
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Ana Oliveira",
      email: "ana.oliveira@empresa.com",
      department: "Design",
    },
    startDate: "2025-08-01",
    endDate: "2025-08-10",
    businessDays: 8,
    reason: "Descanso pessoal",
    emergencyContact: "Carlos Oliveira - (11) 88888-8888",
    createdAt: "2025-07-16T14:30:00Z",
  },
];

const teamMembers = [
  {
    id: "u1",
    name: "João Santos",
    email: "joao.santos@empresa.com",
    vacationBalance: 22,
    department: "Desenvolvimento",
  },
  {
    id: "u2",
    name: "Ana Oliveira",
    email: "ana.oliveira@empresa.com",
    vacationBalance: 28,
    department: "Design",
  },
  {
    id: "u3",
    name: "Carlos Pereira",
    email: "carlos.pereira@empresa.com",
    vacationBalance: 15,
    department: "Marketing",
  },
];

const teamCalendar = [
  {
    id: "c1",
    userId: "u1",
    userName: "João Santos",
    startDate: "2025-05-10",
    endDate: "2025-05-17",
    businessDays: 8,
    reason: "Descanso pessoal",
  },
  {
    id: "c2",
    userId: "u2",
    userName: "Ana Oliveira",
    startDate: "2025-06-15",
    endDate: "2025-06-22",
    businessDays: 8,
    reason: "Viagem internacional",
  },
];

export default function ManagerDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
    }
  };

  const handleApprove = (request: any) => {
    // TODO: Implementar chamada para API
    console.log("Approving request:", request.id, "with comment:", approvalComment);
    setApprovalComment("");
    alert("Solicitação aprovada com sucesso!");
  };

  const handleReject = (request: any) => {
    if (!rejectionComment.trim()) {
      alert("Comentário é obrigatório para rejeição");
      return;
    }
    // TODO: Implementar chamada para API
    console.log("Rejecting request:", request.id, "with comment:", rejectionComment);
    setRejectionComment("");
    alert("Solicitação rejeitada com sucesso!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Dashboard do Gestor
        </h1>
        <p className="text-gray-600">Gerencie as solicitações de férias da sua equipe</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{managerStats.teamMembersCount}</div>
              <div className="text-sm text-gray-600">Membros da Equipe</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{managerStats.pendingRequestsCount}</div>
              <div className="text-sm text-gray-600">Pendentes Aprovação</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{managerStats.approvedRequestsCount}</div>
              <div className="text-sm text-gray-600">Aprovadas este Ano</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{managerStats.totalVacationDays}</div>
              <div className="text-sm text-gray-600">Dias Aprovados</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({managerStats.pendingRequestsCount})
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário da Equipe
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Minha Equipe
          </TabsTrigger>
        </TabsList>

        {/* Solicitações Pendentes */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma solicitação pendente
                </h3>
                <p className="text-gray-600">
                  Sua equipe não possui solicitações aguardando aprovação.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {request.user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.user.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.user.department} • {request.user.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Período:</strong> {formatDate(request.startDate)} - {formatDate(request.endDate)}</p>
                          <p><strong>Dias úteis:</strong> {request.businessDays} dias</p>
                        </div>
                        <div>
                          <p><strong>Solicitado:</strong> {formatTimeAgo(request.createdAt)}</p>
                          <p><strong>Contato emergência:</strong> {request.emergencyContact}</p>
                        </div>
                      </div>

                      {request.reason && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm">
                            <strong>Motivo:</strong> {request.reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 lg:w-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Solicitação</DialogTitle>
                            <DialogDescription>
                              Revise todos os detalhes antes de tomar uma decisão
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRequest && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Funcionário</h4>
                                  <p>{selectedRequest.user.name}</p>
                                  <p className="text-sm text-gray-600">{selectedRequest.user.email}</p>
                                  <p className="text-sm text-gray-600">{selectedRequest.user.department}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">Período Solicitado</h4>
                                  <p>{formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}</p>
                                  <p className="text-sm text-gray-600">{selectedRequest.businessDays} dias úteis</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Motivo</h4>
                                <p className="text-gray-700">{selectedRequest.reason || "Não informado"}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">Contato de Emergência</h4>
                                <p className="text-gray-700">{selectedRequest.emergencyContact}</p>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aprovar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aprovar Solicitação</DialogTitle>
                            <DialogDescription>
                              Confirme a aprovação das férias de {selectedRequest?.user.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Comentário (Opcional)
                              </label>
                              <Textarea
                                placeholder="Adicione um comentário sobre a aprovação..."
                                value={approvalComment}
                                onChange={(e) => setApprovalComment(e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline">Cancelar</Button>
                              <Button 
                                onClick={() => handleApprove(selectedRequest)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar Aprovação
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeitar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeitar Solicitação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação irá rejeitar as férias de {selectedRequest?.user.name}. 
                              Um comentário explicando o motivo é obrigatório.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                Motivo da Rejeição *
                              </label>
                              <Textarea
                                placeholder="Explique o motivo da rejeição..."
                                value={rejectionComment}
                                onChange={(e) => setRejectionComment(e.target.value)}
                                className="mt-1"
                                required
                              />
                            </div>
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleReject(selectedRequest)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Confirmar Rejeição
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Calendário da Equipe */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Férias da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              {teamCalendar.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma férias agendada
                  </h3>
                  <p className="text-gray-600">
                    Sua equipe não possui férias aprovadas para os próximos meses.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamCalendar.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <div>
                        <h4 className="font-semibold text-gray-900">{entry.userName}</h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(entry.startDate)} - {formatDate(entry.endDate)} ({entry.businessDays} dias)
                        </p>
                        <p className="text-sm text-purple-700">{entry.reason}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        Aprovado
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipe */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Membros da Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                          <span className="text-purple-600 font-semibold text-xl">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{member.department}</p>
                        <p className="text-xs text-gray-500 mb-3">{member.email}</p>
                        
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-2xl font-bold text-green-700">
                            {member.vacationBalance}
                          </div>
                          <div className="text-sm text-green-600">
                            dias disponíveis
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}