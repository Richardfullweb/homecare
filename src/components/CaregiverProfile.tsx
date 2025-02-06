import { UserProfile } from '../types/user';
import Avatar from './common/Avatar';
import CaregiverRating from './ratings/CaregiverRating';

interface CaregiverProfileProps {
  caregiver: UserProfile;
  showDetails?: boolean;
}

export default function CaregiverProfile({ caregiver, showDetails = false }: CaregiverProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start space-x-4">
        <Avatar
          src={caregiver.photoURL}
          alt={caregiver.name || 'Caregiver profile'}
          className="w-16 h-16 rounded-full"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{caregiver.name}</h2>
          <div className="mt-1">
            <CaregiverRating caregiverId={caregiver.id} showDetails={showDetails} />
          </div>
          {caregiver.specialties && caregiver.specialties.length > 0 && (
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-700">Especialidades</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {caregiver.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
          {showDetails && (
            <>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Sobre</h3>
                <p className="mt-1 text-sm text-gray-600">{caregiver.bio || 'Nenhuma descrição fornecida.'}</p>
              </div>
              {caregiver.experience && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Experiência</h3>
                  <p className="mt-1 text-sm text-gray-600">{caregiver.experience}</p>
                </div>
              )}
              {caregiver.education && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Formação</h3>
                  <p className="mt-1 text-sm text-gray-600">{caregiver.education}</p>
                </div>
              )}
              {caregiver.languages && caregiver.languages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Idiomas</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {caregiver.languages.map((language) => (
                      <span
                        key={language}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {caregiver.certifications && caregiver.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">Certificações</h3>
                  <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                    {caregiver.certifications.map((certification, index) => (
                      <li key={index}>{certification}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
