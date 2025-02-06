import React from 'react';
import { Button as ChakraButton, ButtonProps, Spinner } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon to display on the left */
  leftIcon?: IconType;
  /** Icon to display on the right */
  rightIcon?: IconType;
  /** Custom color scheme */
  colorScheme?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  /** Button variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'link' | 'subtle' | 'surface' | 'plain';
}

export const Button: React.FC<CustomButtonProps> = ({
  children,
  isLoading,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  colorScheme = 'primary',
  variant = 'solid',
  ...props
}) => {
  return (
    <ChakraButton
      colorScheme={colorScheme}
      size="md"
      variant={variant}
      isLoading={isLoading}
      loadingText={isLoading ? 'Loading...' : undefined}
      spinner={<Spinner size="sm" />}
      leftIcon={LeftIcon ? <LeftIcon /> : undefined}
      rightIcon={RightIcon ? <RightIcon /> : undefined}
      _focus={{
        boxShadow: 'outline',
      }}
      _disabled={{
        opacity: 0.5,
        cursor: 'not-allowed',
      }}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};
