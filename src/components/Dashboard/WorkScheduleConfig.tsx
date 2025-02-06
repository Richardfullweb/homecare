import { useState } from 'react';

interface WorkScheduleConfigProps {
  caregiverId: string;
}

export default function WorkScheduleConfig({ caregiverId }: WorkScheduleConfigProps) {
  const [schedule, setSchedule] = useState({
    monday: { start: '08:00', end: '17:00' },
    tuesday: { start: '08:00', end: '17:00' },
    wednesday: { start: '08:00', end: '17:00' },
    thursday: { start: '08:00', end: '17:00' },
    friday: { start: '08:00', end: '17:00' },
    saturday: { start: '08:00', end: '12:00' },
    sunday: { start: '08:00', end: '12:00' },
  });

  const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Configuração de Horário de Trabalho</h2>
      {Object.entries(schedule).map(([day, times]) => (
        <div key={day} className="mb-4">
          <label className="block text-sm font-medium mb-1 capitalize">{day}</label>
          <div className="flex gap-2">
            <input
              type="time"
              value={times.start}
              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="time"
              value={times.end}
              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
              className="border p-2 rounded"
            />
          </div>
        </div>
      ))}
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={() => console.log('Salvar horário:', schedule)}
      >
        Salvar Configurações
      </button>
    </div>
  );
}
