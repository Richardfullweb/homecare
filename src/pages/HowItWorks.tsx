import React from 'react';
import { Search, UserCheck, Calendar, Heart, Shield, Clock, Award, Users } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
    
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Como o CareConnect Funciona
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Conectamos famílias a cuidadores profissionais de forma simples, segura e eficiente
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. Busque Cuidadores</h3>
              <p className="text-gray-600">
                Pesquise cuidadores qualificados com base em suas necessidades específicas, localização e disponibilidade
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. Escolha o Ideal</h3>
              <p className="text-gray-600">
                Compare perfis, avaliações e experiências para encontrar o cuidador perfeito para sua família
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. Agende o Serviço</h3>
              <p className="text-gray-600">
                Marque o atendimento diretamente pela plataforma, escolhendo data, horário e duração
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o CareConnect?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Segurança Garantida</h3>
              <p className="text-gray-600">
                Todos os cuidadores passam por verificação de antecedentes e validação de documentos
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Award className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profissionais Qualificados</h3>
              <p className="text-gray-600">
                Cuidadores com experiência comprovada e certificações na área de saúde
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Clock className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Disponibilidade 24/7</h3>
              <p className="text-gray-600">
                Atendimento disponível a qualquer hora, incluindo feriados e fins de semana
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Matching Inteligente</h3>
              <p className="text-gray-600">
                Sistema que encontra o profissional ideal com base nas suas necessidades
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>

          <div className="space-y-6">
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="text-lg font-semibold cursor-pointer">
                Como são selecionados os cuidadores?
              </summary>
              <p className="mt-4 text-gray-600">
                Todos os cuidadores passam por um rigoroso processo de seleção que inclui verificação de antecedentes, 
                validação de documentos, entrevistas e avaliação de experiência profissional.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="text-lg font-semibold cursor-pointer">
                Qual é o custo do serviço?
              </summary>
              <p className="mt-4 text-gray-600">
                Os valores variam de acordo com o cuidador e o tipo de serviço. Cada profissional define suas próprias 
                taxas, que são claramente exibidas em seus perfis.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="text-lg font-semibold cursor-pointer">
                Como funciona o pagamento?
              </summary>
              <p className="mt-4 text-gray-600">
                Os pagamentos são processados de forma segura através da nossa plataforma. Aceitamos diversos métodos 
                de pagamento e fornecemos nota fiscal para todos os serviços.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="text-lg font-semibold cursor-pointer">
                E se eu precisar cancelar um agendamento?
              </summary>
              <p className="mt-4 text-gray-600">
                Você pode cancelar ou reagendar um serviço com até 24 horas de antecedência sem custo adicional. 
                Cancelamentos com menos de 24 horas podem estar sujeitos a taxa.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="h-12 w-12 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Encontre o cuidador ideal para sua família hoje mesmo
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors duration-300">
              Buscar Cuidadores
            </button>
            <button className="px-8 py-3 border-2 border-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-300">
              Cadastrar como Cuidador
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
