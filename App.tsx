
import React, { useState } from 'react';
import { ContactInfo } from './types';
import { Button } from './components/Button';
import { generateVCardString, downloadVCard, shareVCard } from './services/vcardUtils';
import { getGeminiAISuggestion } from './services/geminiService';

const TARGET_WHATSAPP = "5562981457094";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [useShareApi, setUseShareApi] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Nome obrigatório.";
    if (!formData.lastName) newErrors.lastName = "Selecione uma opção.";
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!phoneDigits) {
      newErrors.phone = "Telefone obrigatório.";
    } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      newErrors.phone = "Formato inválido.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsProcessing(true);
    const phoneDigits = formData.phone.replace(/\D/g, '');
    const cleanData = { ...formData, phone: phoneDigits };
    const filename = `${cleanData.firstName}_${cleanData.lastName}`.replace(/\s+/g, '_');
    const vCard = generateVCardString(cleanData);

    try {
      const shared = await shareVCard(vCard, filename);
      
      if (shared) {
        setIsProcessing(false);
        setUseShareApi(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        const message = await getGeminiAISuggestion(cleanData);
        downloadVCard(vCard, filename);
        
        const encodedMessage = encodeURIComponent(`${message}\n\n(O arquivo vCard foi baixado automaticamente. Por favor, anexe-o a esta conversa)`);
        const whatsappUrl = `https://wa.me/${TARGET_WHATSAPP}?text=${encodedMessage}`;
        
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          setIsProcessing(false);
          setUseShareApi(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        }, 800);
      }
    } catch (error) {
      console.error("Erro no processamento:", error);
      setIsProcessing(false);
      alert("Erro ao processar. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-4 px-6 bg-gradient-to-br from-slate-50 to-emerald-50 text-gray-800">
      <header className="w-full max-w-sm mb-4 text-center">
        <div className="w-16 h-16 overflow-hidden rounded-xl flex items-center justify-center mx-auto mb-2 border border-white bg-white shadow-sm">
          <img 
            src="https://lh3.googleusercontent.com/d/1bumWZ888i3G7o60_QyyNnUOg3a8t4UXn=w1000?authuser=0" 
            alt="Contatos VTC Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Contatos VTC</h1>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase">Nome</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Digite o nome"
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm`}
          />
          {errors.firstName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase">Adicto ou Codependente?</label>
          <select
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm appearance-none cursor-pointer`}
          >
            <option value="">Selecione...</option>
            <option value="Adicto">Adicto</option>
            <option value="Codependente">Codependente</option>
          </select>
          {errors.lastName && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.lastName}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 ml-1 uppercase">WhatsApp</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Ex: 62981457094"
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm`}
          />
          {errors.phone && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phone}</p>}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            variant="success" 
            className="w-full py-3 text-base rounded-xl" 
            isLoading={isProcessing}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Enviar Contato
          </Button>
        </div>
      </form>

      {showSuccess && (
        <div className="w-full max-w-sm mt-4 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm">
          <svg className="w-5 h-5 text-emerald-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-xs font-bold text-emerald-800">Pronto!</p>
            <p className="text-[10px] text-emerald-600 leading-tight">
              {useShareApi 
                ? "Selecione o WhatsApp no menu de compartilhamento." 
                : "Arquivo baixado! Agora anexe-o no WhatsApp."}
            </p>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default App;
