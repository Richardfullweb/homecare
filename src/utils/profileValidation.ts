import { UserProfile } from '../types/user';

interface ValidationErrors {
  [key: string]: string;
}

export const validateProfile = (profile: Partial<UserProfile>): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!profile.fullName?.trim()) {
    errors.fullName = 'Nome completo é obrigatório';
  }

  if (!profile.phoneNumber?.trim()) {
    errors.phoneNumber = 'Número de telefone é obrigatório';
  } else if (!/^\+?[0-9]{10,15}$/.test(profile.phoneNumber)) {
    errors.phoneNumber = 'Número de telefone inválido';
  }

  if (!profile.address?.trim()) {
    errors.address = 'Endereço é obrigatório';
  }

  if (profile.role === 'caregiver') {
    if (!profile.specialty?.trim()) {
      errors.specialty = 'Especialidade é obrigatória';
    }

    const hasAvailability = Object.values(profile.availability || {}).some(Boolean);
    if (!hasAvailability) {
      errors.availability = 'Selecione pelo menos um dia de disponibilidade';
    }
  }

  if (profile.imageUrl && !/^(https?:\/\/).+\.(jpg|jpeg|png|gif)$/i.test(profile.imageUrl)) {
    errors.imageUrl = 'URL da imagem inválida';
  }

  return errors;
};
