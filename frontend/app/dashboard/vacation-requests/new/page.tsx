"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, differenceInBusinessDays, addDays, isBefore, isWeekend } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ArrowLeft, Info, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Schema de validação
const vacationRequestSchema = z.object({
  startDate: z.date({
    required_error: "Data de início é obrigatória",
  }),
  endDate: z.date({
    required_error: "Data de fim é obrigatória",
  }),
  reason: z.string().optional(),
  emergencyContact: z.string().min(1, "Contato de emergência é obrigatório"),
}).refine((data) => {
  return data.endDate >= data.startDate;
}, {
  message: "Data de fim deve ser posterior à data de início",
  path: ["endDate"],
}).refine((data) => {
  const today = new Date();
  const fifteenDaysFromNow = addDays(today, 15);
  return data.startDate >= fifteenDaysFromNow;
}, {
  message: "Solicitação deve ser feita com pelo menos 15 dias de antecedência",
  path: ["startDate"],
}).refine((data) => {
  const businessDays = differenceInBusinessDays(data.endDate, data.startDate) + 1;
  return businessDays >= 5;
}, {
  message: "Período mínimo de 5 dias úteis",
  path: ["endDate"],
});

type VacationRequestForm = z.infer<typeof vacationRequestSchema>;

export default function NewVacationRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<VacationRequestForm>({
    resolver: zodResolver(vacationRequestSchema),
    defaultValues: {
      reason: "",
      emergencyContact: "",
    },
  });

  const { watch } = form;
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Calcular dias úteis
  const calculateBusinessDays = (start?: Date, end?: Date) => {
    if (!start || !end) return 0;
    return differenceInBusinessDays(end, start) + 1;
  };

  const businessDays = calculateBusinessDays(startDate, endDate);

  const onSubmit = async (data: VacationRequestForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Implementar chamada para API
      console.log("Vacation request data:", data);
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
      
    } catch (error) {
      console.error("Error submitting vacation request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveDraft = () => {
    const formData = form.getValues();
    localStorage.setItem("vacationRequestDraft", JSON.stringify({
      ...formData,
      startDate: formData.startDate?.toISOString(),
      endDate: formData.endDate?.toISOString(),
    }));
    alert("Rascunho salvo com sucesso!");
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Solicitação Enviada!
            </h2>
            <p className="text-gray-600 mb-4">
              Sua solicitação de férias foi enviada com sucesso e está aguardando aprovação.
            </p>
            <p className="text-sm text-gray-500">
              Você será redirecionado para o dashboard em alguns segundos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitar Férias</h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para solicitar suas férias
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Solicitação</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Período de Férias */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Período de Férias
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Início</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => 
                                    isBefore(date, addDays(new Date(), 15)) || 
                                    isWeekend(date)
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Fim</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => 
                                    isBefore(date, startDate || new Date()) || 
                                    isWeekend(date)
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Mostrar dias calculados */}
                    {startDate && endDate && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Período selecionado:</strong> {businessDays} dias úteis
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Detalhes da Solicitação
                    </h3>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motivo das Férias (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva brevemente o motivo das férias..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contato de Emergência *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome e telefone para emergências"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveDraft}
                      className="sm:w-auto"
                    >
                      Salvar Rascunho
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="sm:flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Saldo de Férias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seu Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg text-center">
                <div className="text-4xl font-bold text-green-700 mb-2">22</div>
                <div className="text-sm font-medium text-green-600">
                  dias disponíveis
                </div>
              </div>
              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Direito: 30 dias</span>
                <span>Usado: 8 dias</span>
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Dicas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Solicitações com 15 dias de antecedência</li>
                  <li>• Períodos de no mínimo 5 dias úteis</li>
                  <li>• Pode dividir em até 3 períodos</li>
                  <li>• Resposta em até 5 dias úteis</li>
                  <li>• Fins de semana não contam como dias úteis</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}