"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";

// Dados de exemplo - TODO: buscar da API
const notifications = [
  {
    id: 1,
    type: "approval",
    title: "Férias Aprovadas",
    message: "Suas férias de 15/08 a 25/08 foram aprovadas por Maria Silva (RH). Lembre-se de finalizar suas tarefas pendentes.",
    read: false,
    createdAt: "2025-07-17T10:00:00Z",
  },
  {
    id: 2,
    type: "reminder",
    title: "Lembrete: Saldo de Férias",
    message: "Você ainda tem 22 dias de férias disponíveis este ano. Lembre-se de usar até 31/12/2025.",
    read: false,
    createdAt: "2025-07-16T09:00:00Z",
  },
  {
    id: 3,
    type: "request",
    title: "Solicitação Enviada",
    message: "Sua solicitação de férias para 28/07 a 08/08 foi enviada para aprovação. Aguarde a resposta do seu supervisor.",
    read: true,
    createdAt: "2025-07-15T14:30:00Z",
  },
  {
    id: 4,
    type: "system",
    title: "Sistema Atualizado",
    message: "O sistema de férias foi atualizado com novas funcionalidades. Confira as novidades no painel principal.",
    read: true,
    createdAt: "2025-07-14T08:00:00Z",
  },
  {
    id: 5,
    type: "rejection",
    title: "Solicitação Rejeitada",
    message: "Sua solicitação de férias para 01/02 a 05/02 foi rejeitada. Motivo: Período de alta demanda na equipe.",
    read: true,
    createdAt: "2025-07-10T16:20:00Z",
  },
];

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case "rejection":
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case "request":
        return <Clock className="h-6 w-6 text-blue-600" />;
      case "reminder":
        return <Bell className="h-6 w-6 text-yellow-600" />;
      case "system":
        return <Info className="h-6 w-6 text-purple-600" />;
      default:
        return <Bell className="h-6 w-6 text-gray-600" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "approval":
        return "Aprovação";
      case "rejection":
        return "Rejeição";
      case "request":
        return "Solicitação";
      case "reminder":
        return "Lembrete";
      case "system":
        return "Sistema";
      default:
        return "Notificação";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "há poucos minutos";
    } else if (diffInHours < 24) {
      return `há ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `há ${diffInDays} dia${diffInDays > 1 ? "s" : ""}`;
    }
  };

  const markAsRead = (id: number) => {
    setNotificationList(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notificationList.filter(notif => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notificationList.filter(notif => !notif.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="h-6 w-6 mr-2" />
            Notificações
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-600">Acompanhe suas atualizações e alertas</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              Todas ({notificationList.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Não lidas ({unreadCount})
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Lidas ({notificationList.length - unreadCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-600">
                {filter === "unread" 
                  ? "Você não tem notificações não lidas."
                  : filter === "read"
                  ? "Você não tem notificações lidas."
                  : "Você ainda não recebeu nenhuma notificação."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                !notification.read 
                  ? "border-purple-200 bg-purple-50/30" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-sm font-medium ${
                          !notification.read ? "text-gray-900" : "text-gray-700"
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {getNotificationTypeText(notification.type)}
                      </Badge>
                    </div>
                    
                    <p className={`text-sm ${
                      !notification.read ? "text-gray-900" : "text-gray-600"
                    } leading-relaxed`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Notificações por Email</h4>
                <p className="text-sm text-gray-600">
                  Receba notificações importantes por email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Lembretes de Saldo</h4>
                <p className="text-sm text-gray-600">
                  Receba lembretes sobre seu saldo de férias
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}