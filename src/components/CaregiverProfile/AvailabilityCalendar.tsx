import React from 'react';

    interface AvailabilityCalendarProps {
      availability?: {
        monday: boolean;
        tuesday: boolean;
        wednesday: boolean;
        thursday: boolean;
        friday: boolean;
        saturday: boolean;
        sunday: boolean;
      };
    }

    const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ availability }) => {
      const days = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ];

      return (
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => (
            <div
              key={day}
              className={`p-2 text-center rounded ${
                availability?.[day as keyof typeof availability]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <div className="text-xs uppercase">{day.slice(0, 3)}</div>
              <div className="mt-1">
                {availability?.[day as keyof typeof availability] ? '✓' : '×'}
              </div>
            </div>
          ))}
        </div>
      );
    };

    export default AvailabilityCalendar;
