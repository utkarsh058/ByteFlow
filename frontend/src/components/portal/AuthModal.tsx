import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Lock, 
  UserCheck, 
  HeartPulse, 
  Stethoscope, 
  Building2, 
  X, 
  ArrowRight,
  ShieldCheck,
  Radio,
  CreditCard,
  CheckCircle2,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { UserRole } from '../../types';
import { AshokaEmblem } from '../common/GovEmblem';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const { setRole } = useAuthStore();
  const [step, setStep] = useState<'login' | 'role_select'>('login');
  const [authMethod, setAuthMethod] = useState<'abha' | 'rfid'>('abha');
  const [nationalId, setNationalId] = useState('ABHA-NER-986401');
  const [pin, setPin] = useState('1234');
  const [rfidScanning, setRfidScanning] = useState(false);
  const [rfidScanned, setRfidScanned] = useState(false);
  const [authenticatedAccount, setAuthenticatedAccount] = useState<{
    type: string;
    id: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticatedAccount({
      type: 'ABHA Health ID',
      id: nationalId || 'ABHA-NER-986401',
    });
    setStep('role_select');
  };

  const handleRfidScan = () => {
    setRfidScanning(true);
    setTimeout(() => {
      setRfidScanning(false);
      setRfidScanned(true);
      setAuthenticatedAccount({
        type: 'RFID RC522 Reader Card',
        id: 'UID: 84:9A:2B:3D',
      });
      setTimeout(() => {
        setStep('role_select');
      }, 600);
    }, 1000);
  };

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    onLoginSuccess(role);
    onClose();
    setStep('login');
  };

  const handleResetAuth = () => {
    setStep('login');
    setAuthenticatedAccount(null);
    setRfidScanned(false);
  };

  const roleProfiles = [
    {
      id: 'patient' as UserRole,
      title: t('auth.patientRole', 'Patient Access'),
      name: 'Ranjit Borthakur (72 Yrs)',
      description: t('auth.patientRoleDesc', 'Simplified cognitive schedule, voice assistance & daily memory activities.'),
      icon: <HeartPulse className="w-6 h-6 text-red-600" />,
      color: 'border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-400',
    },
    {
      id: 'caregiver' as UserRole,
      title: t('auth.caregiverRole', 'Caregiver Portal'),
      name: 'Ananya Borthakur',
      description: t('auth.caregiverRoleDesc', 'Patient monitoring, Memory Garden timeline, and daily reminders management.'),
      icon: <UserCheck className="w-6 h-6 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400',
    },
    {
      id: 'clinician' as UserRole,
      title: t('auth.clinicianRole', 'Clinician Analytics'),
      name: 'Dr. Devashish Phukan',
      description: t('auth.clinicianRoleDesc', 'Session history, response time trends, and AI-assisted observations.'),
      icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-400',
    },
    {
      id: 'facility_admin' as UserRole,
      title: t('auth.facilityRole', 'Facility Administrator'),
      name: 'Guwahati Care Center Node',
      description: t('auth.facilityRoleDesc', 'Stationary ESP32 gateway telemetry, LED status, and event stream logs.'),
      icon: <Building2 className="w-6 h-6 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-banner border border-slate-300 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-govNavy-dark text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AshokaEmblem className="w-8 h-10 filter invert shrink-0" />
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                {t('auth.gatewayBadge', 'Official Government Access Gateway')}
              </span>
              <h3 className="font-serif font-bold text-xl text-white">
                {t('auth.loginTitle', 'Smriti-Setu Platform Login')}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-govNavy-light transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* STEP 1: AUTHENTICATION */}
          {step === 'login' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="space-y-1">
                <h4 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5 text-govNavy" />
                  <span>{t('auth.step1Title', 'Step 1: Authenticate Account Credentials')}</span>
                </h4>
                <p className="text-xs text-slate-600">
                  {t('auth.step1Subtitle', 'Please log in using your ABHA Health ID or scan your RFID RC522 Reader Smart Card:')}
                </p>
              </div>

              {/* Login Method Toggle Tabs */}
              <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAuthMethod('abha')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'abha'
                      ? 'bg-govNavy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-govYellow" />
                  <span>{t('auth.abhaTab', 'ABHA Health ID & PIN')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMethod('rfid')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    authMethod === 'rfid'
                      ? 'bg-govNavy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{t('auth.rfidTab', 'RFID RC522 Reader Card')}</span>
                </button>
              </div>

              {/* AUTH METHOD 1: ABHA ID & PASSCODE */}
              {authMethod === 'abha' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('auth.abhaLabel', 'ABHA Health ID / Username')}
                      </label>
                      <input
                        type="text"
                        required
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        placeholder="e.g. ABHA-NER-986401"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {t('auth.pinLabel', 'Passcode / PIN')}
                      </label>
                      <input
                        type="password"
                        required
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      {t('auth.encryptedNotice', 'Encrypted Session · ABHA Verified')}
                    </span>
                    <button
                      type="submit"
                      className="bg-govNavy text-white hover:bg-govNavy-light px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>{t('auth.loginProceed', 'Login & Proceed')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* AUTH METHOD 2: RFID CARD READER */}
              {authMethod === 'rfid' && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-700 space-y-5 text-center relative overflow-hidden">
                  
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                    <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
                      <Cpu className="w-4 h-4" />
                      ESP32 RFID RC522 Hardware Gateway
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">
                      13.56 MHz Active
                    </span>
                  </div>

                  <div className="py-4 flex flex-col items-center justify-center space-y-3">
                    <div 
                      onClick={handleRfidScan}
                      className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        rfidScanned 
                          ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/30 scale-105'
                          : rfidScanning 
                            ? 'border-amber-400 bg-amber-500/20 animate-pulse' 
                            : 'border-slate-600 bg-slate-800 hover:border-emerald-400 hover:bg-slate-750'
                      }`}
                    >
                      {rfidScanned ? (
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-in zoom-in" />
                      ) : rfidScanning ? (
                        <RefreshCw className="w-10 h-10 text-amber-400 animate-spin" />
                      ) : (
                        <CreditCard className="w-10 h-10 text-slate-300" />
                      )}
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-white">
                        {rfidScanned 
                          ? t('auth.rfidSuccess', 'RFID Card Authenticated!') 
                          : rfidScanning 
                            ? t('auth.rfidScanning', 'Scanning ESP32 RC522 Reader...') 
                            : t('auth.rfidPrompt', 'Tap / Scan RFID RC522 Smart Card')}
                      </h5>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {rfidScanned 
                          ? 'Card UID: 84:9A:2B:3D (Ranjit Borthakur)' 
                          : t('auth.rfidHold', 'Hold RFID Card near RC522 Reader')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRfidScan}
                    disabled={rfidScanning}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Radio className="w-4 h-4" />
                    <span>{rfidScanning ? t('auth.rfidScanning', 'Scanning Card...') : t('auth.scanRfidBtn', 'Scan RFID RC522 Card Now')}</span>
                  </button>

                </div>
              )}

              {/* Quick Preset Demo Bypass */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthenticatedAccount({ type: 'Demo Access', id: 'Quick Test Mode' });
                    setStep('role_select');
                  }}
                  className="text-[11px] font-semibold text-govNavy hover:underline cursor-pointer"
                >
                  ⚡ {t('auth.quickDemoBypass', 'Skip to Role Selection (Quick Demo Mode)')}
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 'role_select' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {t('auth.authSuccess', 'Authentication Successful')}
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {authenticatedAccount?.type}: <span className="font-mono text-emerald-700">{authenticatedAccount?.id}</span>
                    </h5>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetAuth}
                  className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                >
                  {t('auth.changeLogin', 'Change Login')}
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-govNavy" />
                  <span>{t('auth.step2Title', 'Step 2: Select Authorized Access Role')}</span>
                </h4>
                <p className="text-xs text-slate-600">
                  {t('auth.step2Subtitle', 'Select your desired portal role below to enter the platform:')}
                </p>
              </div>

              {/* 4 Role Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {roleProfiles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 space-y-2 group ${role.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white rounded-xl shadow-xs">
                        {role.icon}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-govNavy group-hover:underline flex items-center gap-1">
                        {t('auth.enterRole', 'Enter Role')} <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{role.title}</h5>
                      <p className="text-xs font-semibold text-slate-600">{role.name}</p>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

