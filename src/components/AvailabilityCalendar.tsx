import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { UserProfile } from '../types/user';

interface AvailabilityCalendarProps {
  availability: UserProfile['availability'];
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ availability }) => {
  if (!availability) {
    return <Text>Nenhuma disponibilidade cadastrada</Text>;
  }

  return (
    <Box>
      {Object.entries(availability).map(([day, isAvailable]) => (
        <Box key={day} display="flex" alignItems="center" mb={2}>
          <Text fontWeight="bold" width="100px">
            {day}:
          </Text>
          <Text color={isAvailable ? 'green.500' : 'red.500'}>
            {isAvailable ? 'Disponível' : 'Indisponível'}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
