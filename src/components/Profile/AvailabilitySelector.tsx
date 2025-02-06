import React from 'react';

interface Availability {
  [key: string]: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    overnight: boolean;
  };
}

interface AvailabilitySelectorProps {
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  profession: string;
}

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({ availability, setAvailability, profession }) => {
  const daysOfWeek = [
    { label: 'Segunda-feira', key: 'monday' },
    { label: 'Terça-feira', key: 'tuesday' },
    { label: 'Quarta-feira', key: 'wednesday' },
    { label: 'Quinta-feira', key: 'thursday' },
    { label: 'Sexta-feira', key: 'friday' },
    { label: 'Sábado', key: 'saturday' },
    { label: 'Domingo', key: 'sunday' }
  ];

  const timeSlots = profession === 'caregiver' || profession === 'nurse' ? [
    { label: 'Madrugada (22:00 - 06:00)', key: 'overnight' },
    { label: 'Manhã (08:00 - 12:00)', key: 'morning' },
    { label: 'Tarde (13:00 - 18:00)', key: 'afternoon' },
    { label: 'Noite (18:00 - 22:00)', key: 'evening' }
  ] : [
    { label: 'Manhã (08:00 - 12:00)', key: 'morning' },
    { label: 'Tarde (13:00 - 18:00)', key: 'afternoon' }
  ];

  const handleToggle = (day: string, timeSlot: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [timeSlot]: !prev[day][timeSlot]
      }
    }));
  };

  return (
    <div className="space-y-4">
      {daysOfWeek.map(day => (
        <div key={day.key} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">{day.label}</h4>
          <div className={`grid grid-cols-1 sm:grid-cols-${timeSlots.length} gap-2`}>
            {timeSlots.map(slot => (
              <button
                key={`${day.key}-${slot.key}`}
                type="button"
                onClick={() => handleToggle(day.key, slot.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  availability?.[day.key]?.[slot.key]
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvailabilitySelector;
