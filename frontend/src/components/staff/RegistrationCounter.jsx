import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { departments } from '../../data/departments';
import { UserCheck, Printer, Check, PlusCircle, ArrowRight } from 'lucide-react';

export default function RegistrationCounter() {
  const { registerPatient } = useSocket();
  const { language, t } = useAccessibility();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');
  const [departmentId, setDepartmentId] = useState('ortho');
  const [avoidStairs, setAvoidStairs] = useState(true);
  const [lastIssuedSlip, setLastIssuedSlip] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = await registerPatient({
        patientName: name.trim() || 'Walk-in Patient',
        age: parseInt(age, 10) || 50,
        gender,
        departmentId,
        avoidStairs,
        assistedMode: true,
        language
      });
      setLastIssuedSlip(token);
      setName('');
      setAge('');
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-emerald-800">
          <UserCheck size={24} />
          <h3 className="text-lg font-black text-slate-900 m-0">
            {t('staff.regCounterTitle')}
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {language === 'ta' ? 'தொலைபேசி இல்லாத நோயாளிகளுக்கு (3 தட்டுகள்)' : language === 'hi' ? 'बिना फोन वाले मरीजों के लिए (3 टैप)' : 'For walk-in patients without phones (3 Taps)'}
        </span>
      </div>

      <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
            {language === 'ta' ? 'நோயாளி பெயர்' : language === 'hi' ? 'मरीज का नाम' : 'Patient Name'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'ta' ? 'எ.கா. கமலா / ரமேஷ்' : language === 'hi' ? 'उदा. रमेश शर्मा / कमला देवी' : 'e.g. Ramesh / Kamala / Priya'}
            className="w-full text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
            {language === 'ta' ? 'வயது & பாலினம்' : language === 'hi' ? 'उम्र और लिंग' : 'Age & Gender'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              required
              min={1}
              max={120}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={language === 'ta' ? 'வயது' : language === 'hi' ? 'उम्र' : 'Age'}
              className="w-20 text-sm font-bold px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 outline-none"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="flex-1 text-xs font-bold px-2 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="Female">{language === 'ta' ? 'பெண்' : language === 'hi' ? 'महिला' : 'Female'}</option>
              <option value="Male">{language === 'ta' ? 'ஆண்' : language === 'hi' ? 'पुरुष' : 'Male'}</option>
              <option value="Other">{language === 'ta' ? 'மற்றவை' : language === 'hi' ? 'अन्य' : 'Other'}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
            {language === 'ta' ? 'மருத்துவ துறை' : language === 'hi' ? 'विभाग चुनें' : 'Select Department'}
          </label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-white"
          >
            {departments.map(d => (
              <option key={d.id} value={d.id}>
                {language === 'ta' ? d.name_ta : language === 'hi' ? d.name_hi : d.name} ({d.room})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full tap-target-large py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <PlusCircle size={16} />
            <span>{t('staff.quickPrint')}</span>
          </button>
        </div>
      </form>

      {/* Last Issued Slip Quick Print Preview */}
      {lastIssuedSlip && (
        <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-xs font-black uppercase text-emerald-800">
              Slip Issued Successfully:
            </span>
            <p className="text-xl font-mono font-black text-slate-900 m-0">
              Token {lastIssuedSlip.tokenId} — {lastIssuedSlip.patientName} ({lastIssuedSlip.departmentName})
            </p>
            <p className="text-xs text-slate-600 font-bold m-0 mt-0.5">
              Assigned to {lastIssuedSlip.assignedRoomNumber ? `Room ${lastIssuedSlip.assignedRoomNumber}` : lastIssuedSlip.assignedRoomId} (Floor {lastIssuedSlip.assignedFloor}) • {lastIssuedSlip.assignedDoctorName}
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrintSlip}
            className="tap-target-large px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Printer size={16} />
            <span>Print Physical Slip</span>
          </button>
        </div>
      )}
    </div>
  );
}
