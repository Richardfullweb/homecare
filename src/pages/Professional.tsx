import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Phone,
  Mail,
  ArrowRight,
  Award,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

export default function Professional() {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/auth/ProfessionalRegister');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center flex items-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Conectamos profissionais de saúde a quem precisa de cuidado em casa!
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Seja parte de uma plataforma que valoriza sua profissão e facilita
              a conexão com pacientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full text-base font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Quero me cadastrar
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/plans')}
                className="bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-full text-base font-semibold transition-all transform hover:scale-105"
              >
                Descubra nossos planos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Como funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <UserCheck className="w-8 h-8 text-blue-600" />,
                title: 'Cadastre-se',
                description:
                  'Preencha suas informações profissionais, especialidade e área de atuação',
              },
              {
                icon: <Target className="w-8 h-8 text-blue-600" />,
                title: 'Escolha seu modelo',
                description:
                  'Opte por comissão sobre serviços ou assinatura mensal fixa',
              },
              {
                icon: <Sparkles className="w-8 h-8 text-blue-600" />,
                title: 'Selecione seu plano',
                description:
                  'Escolha entre planos básico, avançado ou premium para maior visibilidade',
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
                title: 'Comece a atender',
                description:
                  'Receba solicitações e gerencie seus atendimentos',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-3">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-1 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios por Profissão */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Benefícios para cada profissional
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '👨‍⚕️',
                title: 'Médicos',
                benefits: [
                  'Divulgue consultas domiciliares',
                  'Atenda casos específicos',
                  'Gerencie sua agenda',
                ],
              },
              {
                icon: '👨‍⚕️',
                title: 'Enfermeiros',
                benefits: [
                  'Cuidados pós-cirúrgicos',
                  'Acompanhamento de idosos',
                  'Procedimentos especializados',
                ],
              },
              {
                icon: '🏥',
                title: 'Fisioterapeutas',
                benefits: [
                  'Reabilitação domiciliar',
                  'Atendimento personalizado',
                  'Flexibilidade de horários',
                ],
              },
              {
                icon: '🤝',
                title: 'Cuidadores',
                benefits: [
                  'Serviços personalizados',
                  'Suporte às famílias',
                  'Gestão de rotinas',
                ],
              },
            ].map((profession, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <div className="text-center mb-4">
                  <span className="text-4xl">{profession.icon}</span>
                  <h3 className="text-lg font-semibold mt-2 mb-4 text-gray-900">
                    {profession.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {profession.benefits.map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-600 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Planos de divulgação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Básico',
                price: 'R$ 0',
                features: [
                  'Inclusão no catálogo',
                  'Perfil profissional',
                  'Agendamento básico',
                ],
              },
              {
                title: 'Avançado',
                price: 'R$ 99/mês',
                features: [
                  'Destaque nas buscas',
                  'Marketing digital',
                  'Suporte prioritário',
                  'Relatórios mensais',
                ],
              },
              {
                title: 'Premium',
                price: 'R$ 199/mês',
                features: [
                  'Publicidade personalizada',
                  'Campanhas em redes sociais',
                  'Relatórios detalhados',
                  'Suporte 24/7',
                  'Prioridade máxima',
                ],
              },
            ].map((plan, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {plan.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-gray-600 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Começar agora
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Nossos diferenciais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-10 h-10 text-blue-600" />,
                title: 'Zero burocracia',
                description:
                  'Comece a atender imediatamente após seu cadastro ser aprovado',
              },
              {
                icon: <Users className="w-10 h-10 text-blue-600" />,
                title: 'Suporte completo',
                description: 'Assistência em todas as etapas do atendimento',
              },
              {
                icon: <Award className="w-10 h-10 text-blue-600" />,
                title: 'Flexibilidade',
                description:
                  'Escolha entre comissão por serviço ou assinatura mensal',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Comece agora mesmo
          </h2>
          <p className="text-lg text-white opacity-90 mb-10 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já estão transformando vidas
            através de nossa plataforma
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-full text-base font-semibold transition-all transform hover:scale-105"
          >
            Cadastrar-se gratuitamente
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Dúvidas? Fale conosco
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Nossa equipe está pronta para ajudar você em sua jornada
              profissional
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 text-sm">(11) 99999-9999</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-900 text-sm">
                  contato@cuidadores.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Schedule Config Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Configuração de Horário de Trabalho
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-5xl mx-auto">
            <div
              key={1}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Configure seu horário de trabalho
                </h3>
              </div>
              {/* WorkScheduleConfig removed as it requires authentication */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
