import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { demographicPersonas } from '../../data/demographicPersonas';
import { 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  CheckSquare, 
  Square,
  ArrowRight,
  Users
} from 'lucide-react';

export default function RegistrationForm() {
  const { registerPatient } = useSocket();
  const { setPatientSlip } = useJourney();
  const { language, setLanguage, assistedMode, setAssistedMode, t } = useAccessibility();

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Female',
    departmentId: 'Orthopedics',
    avoidStairs: true,
    assistedMode: true,
    language: 'hi'
  });

  const [loading, setLoading] = useState(false);

  // 1-Click Pan-India Citizen Persona Selector
  const handleSelectPersona = (p) => {
    setFormData({
      patientName: p.patientName,
      age: p.age,
      gender: p.gender,
      departmentId: p.departmentName,
      avoidStairs: p.avoidStairs,
      assistedMode: p.assistedMode,
      language: p.language
    });
    setLanguage(p.language);
    setAssistedMode(p.assistedMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await registerPatient(formData);
      setPatientSlip(token);
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5 text-emerald-700 mb-1">
          <UserPlus size={24} />
          <h2 className="text-xl md:text-2xl font-black text-slate-900 m-0">
            {t('registration.title')}
          </h2>
        </div>
        <p className="text-sm text-slate-500 m-0">
          {t('registration.desc')}
        </p>
      </div>

      {/* Pan-India Citizen Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
          Demo Citizen Profiles (All Indian States)
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {demographicPersonas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPersona(p)}
              className="tap-target-large flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold text-xs whitespace-nowrap active:scale-95 transition-all shadow-2xs flex-shrink-0"
            >
              <span>{p.icon}</span>
              <span className="font-extrabold">{p.patientName.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-500">({p.age}y • {p.stateCode})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
            {t('registration.fullName')}
          </label>
          <input
            type="text"
            required
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            className="w-full tap-target-large px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none font-bold text-slate-900"
            placeholder="e.g. Ramesh Sharma, Kamla Devi, Priya, Mohammed Rafiq"
          />
        </div>

        {/* Age and Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
              {t('registration.age')}
            </label>
            <input
              type="number"
              required
              min={1}
              max={120}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="w-full tap-target-large px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
              {t('registration.gender')}
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full tap-target-large px-3 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none font-bold text-slate-900 bg-white"
            >
              <option value="Female">{t('registration.female')}</option>
              <option value="Male">{t('registration.male')}</option>
              <option value="Other">{t('registration.other')}</option>
            </select>
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
            {t('registration.department')}
          </label>
          <select
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            className="w-full tap-target-large px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:outline-none font-bold text-slate-900 bg-white"
          >
            <option value="Orthopedics">{t('registration.orthopedics')} (Dr. Verma - Rm 104)</option>
            <option value="General Medicine">{t('registration.generalMedicine')} (Dr. Rajesh - Rm 208)</option>
            <option value="Pediatrics">{t('registration.pediatrics')} (Dr. Priya - Rm 105)</option>
          </select>
        </div>

        {/* Mobility: Strict Avoid Stairs Checkbox */}
        <div 
          onClick={() => setFormData({ ...formData, avoidStairs: !formData.avoidStairs })}
          className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/70 cursor-pointer flex items-start gap-3 select-none"
        >
          <div className="mt-0.5 text-emerald-800">
            {formData.avoidStairs ? (
              <CheckSquare size={24} className="text-emerald-700" />
            ) : (
              <Square size={24} className="text-slate-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-950 m-0">
              {t('registration.avoidStairs')}
            </p>
            <p className="text-xs text-slate-600 font-semibold m-0 mt-0.5">
              {t('registration.avoidStairsHint')}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full tap-target-large py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 disabled:opacity-50"
        >
          <span>{loading ? 'Generating...' : t('registration.submit')}</span>
          <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
}
