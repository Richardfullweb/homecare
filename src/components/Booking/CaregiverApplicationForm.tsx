import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel, Button } from '@mui/material';

interface ElderlyCharacteristics {
  [key: string]: boolean;
  needCompany: boolean;
  completeMobility: boolean;
  reducedMobility: boolean;
  bedridden: boolean;
  degenerativeDiseases: boolean;
  specialNeeds: boolean;
}

interface JobRequirements {
  [key: string]: boolean;
  shopping: boolean;
  cookServe: boolean;
  trackDailyActivities: boolean;
  activityGuide: boolean;
  patientHygiene: boolean;
  takeToDoctor: boolean;
  cleanHouse: boolean;
  workNight: boolean;
  nursery: boolean;
  takePickUp: boolean;
}

interface ProfessionalRequirements {
  [key: string]: boolean;
  reliefWorker: boolean;
  referenceLetter: boolean;
  nonSmoker: boolean;
  tripAvailable: boolean;
  overnight: boolean;
  workDocument: boolean;
  haveCar: boolean;
  residentWorker: boolean;
  famyleTraining: boolean;
}

interface DayAvailability {
  manha: boolean;
  tarde: boolean;
  noite: boolean;
}

interface Availability {
  [key: string]: DayAvailability;
  segunda: DayAvailability;
  terca: DayAvailability;
  quarta: DayAvailability;
  quinta: DayAvailability;
  sexta: DayAvailability;
  sabado: DayAvailability;
  domingo: DayAvailability;
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  bio: string;
  photoUrl: string;
  education: string;
  hourlyRate: string;
  experience: string;
  certifications: string;
  elderlyCharacteristics: ElderlyCharacteristics;
  jobRequirements: JobRequirements;
  professionalRequirements: ProfessionalRequirements;
  professionalType: 'caregiver' | 'nurse' | 'doctor' | 'physiotherapist';
  rate: string;
  rateType: 'daily' | 'hourly';
  availability: Availability;
}

const steps = [
  'Informações Pessoais', 
  'Informações Profissionais', 
  'Características dos Idosos',
  'Requisitos da Vaga',
  'Requisitos do Profissional',
  'Frequência de Trabalho',
  'Disponibilidade'
];

const CaregiverApplicationForm: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    bio: '',
    photoUrl: '',
    education: '',
    hourlyRate: '',
    experience: '',
    certifications: '',
    elderlyCharacteristics: {
      needCompany: false,
      completeMobility: false,
      reducedMobility: false,
      bedridden: false,
      degenerativeDiseases: false,
      specialNeeds: false
    },
    jobRequirements: {
      shopping: false,
      cookServe: false,
      trackDailyActivities: false,
      activityGuide: false,
      patientHygiene: false,
      takeToDoctor: false,
      cleanHouse: false,
      workNight: false,
      nursery: false,
      takePickUp: false
    },
    professionalRequirements: {
      reliefWorker: false,
      referenceLetter: false,
      nonSmoker: false,
      tripAvailable: false,
      overnight: false,
      workDocument: false,
      haveCar: false,
      residentWorker: false,
      famyleTraining: false
    },
    professionalType: 'caregiver',
    rate: '',
    rateType: 'daily',
    availability: {
      segunda: { manha: false, tarde: false, noite: false },
      terca: { manha: false, tarde: false, noite: false },
      quarta: { manha: false, tarde: false, noite: false },
      quinta: { manha: false, tarde: false, noite: false },
      sexta: { manha: false, tarde: false, noite: false },
      sabado: { manha: false, tarde: false, noite: false },
      domingo: { manha: false, tarde: false, noite: false }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData(prev => ({
            ...prev,
            fullName: userData?.fullName || '',
            phone: userData?.phone || '',
            address: userData?.address || '',
            bio: userData?.bio || '',
            photoUrl: userData?.photoUrl || '',
            education: userData?.education || '',
            hourlyRate: userData?.hourlyRate || '',
            experience: userData?.experience || '',
            certifications: userData?.certifications || '',
            availability: userData?.availability || prev.availability,
            elderlyCharacteristics: userData?.elderlyCharacteristics || prev.elderlyCharacteristics,
            jobRequirements: userData?.jobRequirements || prev.jobRequirements,
            professionalRequirements: userData?.professionalRequirements || prev.professionalRequirements,
            rate: userData?.rate || prev.rate,
            rateType: userData?.rateType || prev.rateType,
            professionalType: userData?.professionalType || prev.professionalType
          }));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (day: keyof Availability, period: keyof DayAvailability) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [period]: !prev.availability[day][period]
        }
      }
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Prepare data with consistent field names and values
      const caregiverData = {
        ...formData,
        role: 'caregiver',
        profileComplete: true,
        status: 'pending',
        elderlyCharacteristics: {
          needCompany: formData.elderlyCharacteristics.needCompany,
          reducedMobility: formData.elderlyCharacteristics.reducedMobility,
          degenerativeDiseases: formData.elderlyCharacteristics.degenerativeDiseases
        },
        rate: formData.rate,
        rateType: formData.rateType,
        professionalType: formData.professionalType
      };

      await setDoc(userRef, caregiverData, { merge: true });

      alert('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      alert('Erro ao salvar cadastro. Tente novamente.');
    }
  };

  const getStepContent = (step: number) => {
    if (loading) return <div>Carregando...</div>;

    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Escolaridade</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxa Horária (R$/h)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Características dos Idosos</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.elderlyCharacteristics).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      elderlyCharacteristics: {
                        ...prev.elderlyCharacteristics,
                        [key]: !prev.elderlyCharacteristics[key]
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm"
                  />
                  <span>{{
                    needCompany: 'Precisa de companhia',
                    completeMobility: 'Mobilidade completa',
                    reducedMobility: 'Mobilidade reduzida',
                    bedridden: 'Acamado',
                    degenerativeDiseases: 'Doenças degenerativas',
                    specialNeeds: 'Necessidades especiais'
                  }[key]}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Requisitos da Vaga</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.jobRequirements).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      jobRequirements: {
                        ...prev.jobRequirements,
                        [key]: !prev.jobRequirements[key]
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm"
                  />
                  <span>{{
                    shopping: 'Realizar compras',
                    cookServe: 'Preparar e servir refeições',
                    trackDailyActivities: 'Acompanhar rotina diária',
                    activityGuide: 'Acompanhar em passeios e recreação',
                    patientHygiene: 'Dar banho e trocar fraldas',
                    takeToDoctor: 'Levar ao médico',
                    cleanHouse: 'Ajudar com serviços gerais da casa',
                    workNight: 'Trabalhar no período noturno',
                    nursery: 'Prestar serviço de enfermagem',
                    takePickUp: 'Levar e buscar nos lugares'
                  }[key]}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Requisitos do Profissional</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData.professionalRequirements).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setFormData(prev => ({
                      ...prev,
                      professionalRequirements: {
                        ...prev.professionalRequirements,
                        [key]: !prev.professionalRequirements[key]
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 shadow-sm"
                  />
                  <span>{{
                    reliefWorker: 'Trabalhar como folguista',
                    referenceLetter: 'Ter carta de referência',
                    nonSmoker: 'Não ser fumante',
                    tripAvailable: 'Estar disponível para viagens',
                    overnight: 'Trabalhar no período noturno',
                    workDocument: 'Ter trabalhado com carteira assinada',
                    haveCar: 'Ter condução própria',
                    residentWorker: 'Dormir no local',
                    famyleTraining: 'Possuir treinamento da Famyle'
                  }[key]}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Tipo de Profissional</h3>
            <select
              name="professionalType"
              value={formData.professionalType}
              onChange={(e) => {
                const type = e.target.value as 'caregiver' | 'nurse' | 'doctor' | 'physiotherapist';
                setFormData(prev => ({
                  ...prev,
                  professionalType: type,
                  rateType: type === 'caregiver' || type === 'nurse' ? 'daily' : 'hourly'
                }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
            >
              <option value="caregiver">Cuidador</option>
              <option value="nurse">Enfermeiro</option>
              <option value="doctor">Médico</option>
              <option value="physiotherapist">Fisioterapeuta</option>
            </select>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.rateType === 'daily' ? 'Valor Diário (R$/dia)' : 'Valor Horário (R$/hora)'}
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-7 gap-4">
            {Object.entries(formData.availability).map(([day, periods]) => (
              <div key={day} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                {Object.entries(periods).map(([period, value]) => (
                  <label key={period} className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleAvailabilityChange(day as keyof Availability, period as keyof DayAvailability)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span>{{
                      manha: 'Manhã',
                      tarde: 'Tarde', 
                      noite: 'Noite'
                    }[period]}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-16">
      <Stepper activeStep={activeStep}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <div className="mt-6">
        {getStepContent(activeStep)}
      </div>

      <div className="mt-6 flex justify-between">
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Voltar
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Finalizar
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
          >
            Próximo
          </Button>
        )}
      </div>
    </div>
  );
};

export default CaregiverApplicationForm;
