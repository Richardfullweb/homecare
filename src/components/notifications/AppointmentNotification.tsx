import { formatCurrency } from '../../utils/format';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

export type NotificationType = 'appointment_request' | 'appointment_accepted' | 'appointment_rejected' | 'appointment_completed' | 'evaluation_request';

interface AppointmentNotificationProps {
  type: NotificationType;
  date: Date;
  duration?: number;
  address?: string;
  price?: number;
  patientName: string;
  description?: string;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onEvaluate?: () => void;
}

export function AppointmentNotification({ 
  type, 
  date, 
  duration, 
  address, 
  price,
  patientName,
  description,
  onAccept,
  onReject,
  onEvaluate
}: AppointmentNotificationProps) {
  const getStatusInfo = () => {
    switch (type) {
      case 'appointment_request':
        return {
          title: 'Nova Solicitação',
          description: 'Aguardando sua confirmação',
          buttonText: 'Ver detalhes',
          buttonClass: 'bg-indigo-600 hover:bg-indigo-700'
        };
      case 'appointment_accepted':
        return {
          title: 'Agendamento Confirmado',
          description: 'O atendimento foi confirmado',
          buttonText: 'Ver detalhes',
          buttonClass: 'bg-green-600 hover:bg-green-700'
        };
      case 'appointment_completed':
        return {
          title: 'Atendimento Concluído',
          description: 'O atendimento foi finalizado',
          buttonText: 'Ver detalhes',
          buttonClass: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'appointment_rejected':
        return {
          title: 'Agendamento Recusado',
          description: 'O agendamento foi recusado',
          buttonText: 'Ver detalhes',
          buttonClass: 'bg-red-600 hover:bg-red-700'
        };
      case 'evaluation_request':
        return {
          title: 'Avaliação Pendente',
          description: 'Por favor, avalie o atendimento',
          buttonText: 'Avaliar',
          buttonClass: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          title: 'Status Desconhecido',
          description: 'Status não reconhecido',
          buttonText: 'Ver detalhes',
          buttonClass: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-semibold">{statusInfo.title}</h3>
          <p className="text-gray-600">{statusInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <span>{date.toLocaleDateString('pt-BR')}</span>
          </div>
          {duration && (
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <span>{duration} horas</span>
            </div>
          )}
          {address && (
            <div className="flex items-center space-x-2 col-span-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="truncate">{address}</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-900">Paciente</p>
          <p className="text-sm text-gray-600">{patientName}</p>
          {description && (
            <>
              <p className="text-sm font-medium text-gray-900 mt-2">Descrição</p>
              <p className="text-sm text-gray-600">{description}</p>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          {price && (
            <span className="text-lg font-semibold">
              {formatCurrency(price)}
            </span>
          )}
          <div className="space-x-2">
            {type === 'appointment_request' && (
              <>
                <Button
                  onClick={onReject}
                  variant="solid"
                  size="sm"
                >
                  Recusar
                </Button>
                <Button
                  onClick={onAccept}
                  variant="solid"
                  size="sm"
                >
                  Aceitar
                </Button>
              </>
            )}
            {type === 'appointment_completed' && (
              <Button
                onClick={onEvaluate}
                variant="solid"
                size="sm"
              >
                Avaliar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
