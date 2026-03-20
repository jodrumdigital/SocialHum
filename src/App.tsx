/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { 
  Bird, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Calendar, 
  BarChart3, 
  MessageSquare, 
  Users, 
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Play,
  Clock,
  Layout,
  Target,
  Upload,
  LogOut,
  LogIn,
  Save,
  Quote
} from 'lucide-react';

// --- Types ---

type Step = 'landing' | 'onboarding' | 'strategy' | 'content' | 'export' | 'thankyou' | 'how-it-works' | 'about';
type OnboardingStep = 'package-selection' | 'account-creation' | 'welcome' | 'strategy-intro' | 'strategy-builder';

// --- Components ---

const Logo = ({
  className = "",
  iconOnly = false,
  variant = 'default',
  onClick
}: {
  className?: string;
  iconOnly?: boolean;
  variant?: 'default' | 'reverse';
  onClick?: () => void;
}) => {
  const logoSrc = variant === 'reverse'
    ? '/socialhum-logo-reverse-v2.png'
    : '/socialhum-logo-v2.png';

  return (
    <div
      onClick={onClick}
      className={`flex items-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <img
        src={logoSrc}
        alt="SocialHum Logo"
        className={iconOnly ? "w-10 h-10 object-contain" : "h-16 w-auto object-contain"}
      />
    </div>
  );
};

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = "",
  type = "button",
  loading = false,
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
}) => {
  const variants = {
    primary: "bg-hum-yellow text-hum-navy",
    secondary: "bg-hum-coral text-white",
    outline: "bg-white text-hum-navy"
  };

  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`hum-btn ${variants[variant]} ${className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </div>
      ) : children}
    </button>
  );
};

const Card = ({ children, className = "", color = "bg-white" }: { children: React.ReactNode; className?: string; color?: string; key?: any }) => (
  <div className={`hum-card ${color} ${className}`}>
    {children}
  </div>
);

const ContentEngineCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-hum-navy p-10 rounded-[3rem] relative z-10 border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(13,56,71,0.2)] ${className}`}>
    <div className="flex items-center justify-between mb-8">
      <div className="flex gap-3">
        <div className="w-4 h-4 rounded-full bg-hum-coral border border-white/20" />
        <div className="w-4 h-4 rounded-full bg-hum-yellow border border-white/20" />
        <div className="w-4 h-4 rounded-full bg-hum-cyan border border-white/20" />
      </div>
      <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/40">Content Engine v1.0</span>
    </div>
    
    <div className="space-y-6">
      <div className="bg-white border-2 border-hum-navy p-6 rounded-2xl flex items-center gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="w-14 h-14 bg-hum-cyan rounded-xl flex items-center justify-center border-2 border-hum-navy">
          <Target className="w-7 h-7 text-hum-navy" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-1">Strategy Phase</div>
          <div className="font-black text-hum-navy text-lg uppercase tracking-tight">Journey Mapped</div>
        </div>
        <CheckCircle2 className="ml-auto text-hum-teal w-6 h-6" />
      </div>
      
      <div className="bg-white border-2 border-hum-navy p-6 rounded-2xl flex items-center gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
        <div className="w-14 h-14 bg-hum-coral rounded-xl flex items-center justify-center border-2 border-hum-navy">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-1">Production</div>
          <div className="font-black text-hum-navy text-lg uppercase tracking-tight">Posts Ready to Review</div>
        </div>
        <CheckCircle2 className="ml-auto text-hum-teal w-6 h-6" />
      </div>

      <div className="bg-hum-teal text-white p-6 rounded-2xl flex items-center gap-6 border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
        <Calendar className="w-7 h-7" />
        <div className="font-black uppercase tracking-tight text-lg">Scheduling Now</div>
      </div>
    </div>
  </div>
);

// --- Sections ---

const OnboardingLayout = ({ 
  children, 
  currentStep, 
  rightPanelContent,
  onBackToHome
}: { 
  children: React.ReactNode; 
  currentStep: OnboardingStep;
  rightPanelContent: React.ReactNode;
  onBackToHome?: () => void;
}) => {
  const steps = [
    { id: 'account-creation', label: 'Account' },
    { id: 'welcome', label: 'Welcome' },
    { id: 'strategy-intro', label: 'Strategy' },
  ];

  const getStepIndex = (step: string) => {
    if (step === 'package-selection') return -1;
    if (step === 'strategy-builder') return 3;
    return steps.findIndex(s => s.id === step);
  };

  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="min-h-screen bg-hum-cream flex flex-col">
      {/* Progress Bar */}
      {currentStep !== 'package-selection' && (
        <div className="w-full bg-white border-b-2 border-hum-navy px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between relative">
            {onBackToHome && (
              <button 
                onClick={onBackToHome}
                className="absolute -left-32 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hum-navy/40 hover:text-hum-navy transition-colors group"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </button>
            )}
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-hum-navy/10 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-hum-teal -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, i) => {
              const isActive = i <= currentIndex;
              const isCurrent = i === currentIndex;
              
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full border-2 border-hum-navy flex items-center justify-center font-black text-xs transition-all duration-300 ${
                    isActive ? 'bg-hum-teal text-white' : 'bg-white text-hum-navy'
                  } ${isCurrent ? 'scale-125 shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]' : ''}`}>
                    {isActive && i < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-hum-navy' : 'text-hum-navy/40'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-white relative">
          {currentStep === 'package-selection' && onBackToHome && (
            <button 
              onClick={onBackToHome}
              className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hum-navy/40 hover:text-hum-navy transition-colors group"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </button>
          )}
          <div className="max-w-md mx-auto w-full">
            <Logo className="mb-12 scale-75 origin-left" />
            {children}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-hum-navy relative overflow-hidden flex items-center justify-center p-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,25 50,50 T100,50" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M0,70 Q25,45 50,70 T100,70" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M0,30 Q25,5 50,30 T100,30" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
          
          <div className="relative z-10 w-full max-w-lg">
            {rightPanelContent}
          </div>
        </div>
      </div>
    </div>
  );
};

const PackageSelection = ({ onSelect, onBack }: { onSelect: (id: string) => void, onBack: () => void }) => {
  const [selectedId, setSelectedId] = useState('standard');

  const plans = [
    { id: 'starter', name: 'Starter', price: '99', desc: '1 post/week (4 posts/month)', recommended: false },
    { id: 'standard', name: 'Standard', price: '199', desc: '2 posts/week (8 posts/month)', recommended: true },
    { id: 'authority', name: 'Authority', price: '299', desc: '3 posts/week (12 posts/month)', recommended: false },
  ];

  const selectedPlan = plans.find(p => p.id === selectedId) || plans[1];

  return (
    <OnboardingLayout 
      currentStep="package-selection"
      onBackToHome={onBack}
      rightPanelContent={
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-hum-yellow p-10 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-hum-navy rounded-xl flex items-center justify-center">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div className="font-black uppercase tracking-tight text-hum-navy text-xl">Strategy Engine</div>
          </div>
          <p className="text-hum-navy font-bold italic mb-8 leading-relaxed">
            "We've automated the agency workflow so you get high-level strategy without the high-level retainer."
          </p>
          <div className="space-y-4">
            <div className="bg-white/50 p-4 rounded-2xl border-2 border-hum-navy flex items-center gap-4">
              <CheckCircle2 className="text-hum-teal w-5 h-5" />
              <span className="font-black uppercase text-xs tracking-widest">Journey Mapping</span>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl border-2 border-hum-navy flex items-center gap-4">
              <CheckCircle2 className="text-hum-teal w-5 h-5" />
              <span className="font-black uppercase text-xs tracking-widest">Content Matrix</span>
            </div>
          </div>
        </motion.div>
      }
    >
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-hum-navy leading-none">
        Choose your <span className="text-hum-coral italic">velocity.</span>
      </h2>
      <p className="text-lg text-hum-navy/60 mb-10 font-medium italic">
        Select the plan that fits your business goals. You can change this anytime.
      </p>

      <div className="space-y-4 mb-10">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedId(plan.id)}
            className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between group relative ${
              selectedId === plan.id 
                ? 'bg-hum-yellow border-hum-navy shadow-[8px_8px_0px_0px_rgba(22,55,71,1)] -translate-y-1' 
                : 'bg-white border-hum-navy/20 hover:border-hum-navy hover:bg-hum-cream shadow-[4px_4px_0px_0px_rgba(22,55,71,0.05)] hover:shadow-[6px_6px_0px_0px_rgba(22,55,71,0.1)]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black uppercase tracking-tight text-hum-navy text-xl">{plan.name}</span>
                {plan.recommended && (
                  <span className="bg-hum-coral text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-hum-navy">Recommended</span>
                )}
                {selectedId === plan.id && (
                  <CheckCircle2 className="w-5 h-5 text-hum-teal ml-1" />
                )}
              </div>
              <p className="text-xs font-bold text-hum-navy/60 uppercase tracking-widest">{plan.desc}</p>
            </div>
            <div className="text-right">
              <div className="font-black text-2xl text-hum-navy">${plan.price}</div>
              <div className="text-[8px] font-black uppercase text-hum-navy/40 tracking-widest">/month</div>
            </div>
          </button>
        ))}
      </div>

      <Button 
        onClick={() => onSelect(selectedId)} 
        variant="secondary" 
        className="w-full text-xl py-5 bg-hum-teal text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)]"
      >
        Start with {selectedPlan.name} <ArrowRight className="inline-block ml-2 w-6 h-6" />
      </Button>
    </OnboardingLayout>
  );
};

const AccountCreation = ({ onContinue, onLogin, onBack }: { onContinue: (data: { firstName: string, lastName: string, email: string, phone: string, companyName: string }) => Promise<void>, onLogin: (email: string) => Promise<void>, onBack: () => void }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: ''
  });
  const [error, setError] = useState<{ message: string, code?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.companyName) {
      setError({ message: 'All fields are required' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onContinue(formData);
    } catch (err: any) {
      setError({ message: err.message || 'Something went wrong', code: err.code });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin(formData.email);
    } catch (err: any) {
      setError({ message: err.message || 'Login failed', code: err.code });
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout 
      currentStep="account-creation"
      onBackToHome={onBack}
      rightPanelContent={
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-hum-purple p-10 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]"
        >
          <div className="w-20 h-20 bg-white rounded-2xl border-2 border-hum-navy flex items-center justify-center mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
            <Users className="text-hum-purple w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black uppercase tracking-tighter text-hum-navy mb-4">Join the Hum.</h3>
          <p className="text-hum-navy font-bold italic leading-relaxed">
            "Your business expertise, amplified by our intelligence. Let's get your account ready."
          </p>
        </motion.div>
      }
    >
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-hum-navy leading-none">
        Create your <span className="text-hum-teal italic">account.</span>
      </h2>
      <p className="text-lg text-hum-navy/60 mb-8 font-medium italic">
        Enter your details to start your 7-day free trial.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-2 ml-4">First Name</label>
            <input 
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-white border-2 border-hum-navy p-4 rounded-2xl font-bold text-hum-navy focus:outline-none focus:ring-2 focus:ring-hum-teal/20"
              placeholder="Jo"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-2 ml-4">Last Name</label>
            <input 
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-white border-2 border-hum-navy p-4 rounded-2xl font-bold text-hum-navy focus:outline-none focus:ring-2 focus:ring-hum-teal/20"
              placeholder="Sharma"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-2 ml-4">Email Address</label>
          <input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-white border-2 border-hum-navy p-4 rounded-2xl font-bold text-hum-navy focus:outline-none focus:ring-2 focus:ring-hum-teal/20"
            placeholder="jo@example.com"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-2 ml-4">Phone Number</label>
          <input 
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-white border-2 border-hum-navy p-4 rounded-2xl font-bold text-hum-navy focus:outline-none focus:ring-2 focus:ring-hum-teal/20"
            placeholder="0400 000 000"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-2 ml-4">Company Name</label>
          <input 
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full bg-white border-2 border-hum-navy p-4 rounded-2xl font-bold text-hum-navy focus:outline-none focus:ring-2 focus:ring-hum-teal/20"
            placeholder="Drum Digital"
          />
        </div>

        {error && (
          <div className="bg-hum-coral/10 border-2 border-hum-coral p-4 rounded-2xl mb-4">
            <p className="text-hum-coral text-xs font-black uppercase tracking-widest mb-2">
              Error
            </p>
            <p className="text-hum-navy text-sm font-bold italic leading-tight">
              {error.message || "An error occurred. Please try again."}
            </p>
          </div>
        )}

        <Button 
          type="submit" 
          variant="secondary" 
          loading={loading}
          className="w-full text-xl py-5 bg-hum-teal text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)] mt-4"
        >
          Continue <ArrowRight className="inline-block ml-2 w-6 h-6" />
        </Button>
      </form>

      <p className="text-[10px] text-hum-navy/40 font-bold uppercase tracking-widest text-center mt-8">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </OnboardingLayout>
  );
};


const WelcomeScreen = ({ onStart, onBack }: { onStart: () => void, onBack: () => void }) => {
  return (
    <OnboardingLayout 
      currentStep="welcome"
      onBackToHome={onBack}
      rightPanelContent={
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="bg-hum-yellow p-10 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] relative"
        >
          <div className="absolute -top-6 -right-6 bg-hum-coral text-white border-2 border-hum-navy rounded-full px-6 py-2 font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
            Active
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-hum-navy rounded-xl flex items-center justify-center">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <div className="font-black uppercase tracking-tight text-hum-navy text-xl">Strategy Engine</div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-hum-navy/10 rounded-full w-full" />
            <div className="h-4 bg-hum-navy/10 rounded-full w-3/4" />
            <div className="h-4 bg-hum-navy/10 rounded-full w-1/2" />
          </div>
          <div className="mt-8 pt-8 border-t-2 border-hum-navy/10 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40">Status</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-hum-teal">Ready for Input</span>
          </div>
        </motion.div>
      }
    >
      <div className="inline-block bg-hum-purple text-hum-navy border-2 border-hum-navy px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]">
        7-Day Free Trial
      </div>
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-hum-navy leading-none">
        You’re in. <br /><span className="text-hum-teal italic">Welcome to Social Hum.</span>
      </h2>
      <p className="text-lg text-hum-navy/60 mb-10 font-medium italic leading-relaxed">
        Your account is ready and your 7-Day free trial has started. Let's build your first strategy.
      </p>

      <Button onClick={onStart} variant="secondary" className="w-full text-xl py-5 bg-hum-coral text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)]">
        Start Your Strategy Setup <ArrowRight className="inline-block ml-2 w-6 h-6" />
      </Button>
    </OnboardingLayout>
  );
};

const StrategyIntro = ({ onBegin, onBack }: { onBegin: () => void, onBack: () => void }) => {
  return (
    <OnboardingLayout 
      currentStep="strategy-intro"
      onBackToHome={onBack}
      rightPanelContent={
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-hum-navy p-10 rounded-[3rem] border-4 border-white/10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 bg-hum-teal rounded-2xl border-2 border-white/20 flex items-center justify-center">
              <Target className="text-white w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Strategy Builder</h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-hum-yellow flex items-center justify-center font-black text-hum-navy text-xs">1</div>
              <span className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Business Context</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white/40 text-xs">2</div>
              <span className="text-white/20 font-bold uppercase text-[10px] tracking-widest">Audience Mapping</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white/40 text-xs">3</div>
              <span className="text-white/20 font-bold uppercase text-[10px] tracking-widest">Brand Voice</span>
            </div>
          </div>
        </motion.div>
      }
    >
      <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-hum-navy leading-none">
        Let’s build your <span className="text-hum-coral italic">content strategy.</span>
      </h2>
      <p className="text-lg text-hum-navy/60 mb-10 font-medium italic leading-relaxed">
        Answer a few questions so Social Hum can generate a tailored social media strategy for your business.
      </p>

      <div className="bg-hum-cream p-6 rounded-3xl border-2 border-hum-navy mb-10 flex items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl border-2 border-hum-navy flex items-center justify-center shrink-0">
          <Clock className="text-hum-navy w-6 h-6" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40">Estimated Time</div>
          <div className="font-black text-hum-navy uppercase tracking-tight">3–5 minutes</div>
        </div>
      </div>

      <Button onClick={onBegin} variant="secondary" className="w-full text-xl py-5 bg-hum-teal text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)]">
        Begin Strategy Builder <ArrowRight className="inline-block ml-2 w-6 h-6" />
      </Button>
    </OnboardingLayout>
  );
};
const LandingPage = ({ onStart, onHowItWorks, onAbout }: { onStart: () => void, onHowItWorks: () => void, onAbout: () => void }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Logo className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
        <div className="hidden md:flex items-center gap-8 font-medium">
          <button onClick={onHowItWorks} className="hover:text-hum-coral transition-colors font-bold uppercase text-xs tracking-widest">How it Works</button>
          <button onClick={onAbout} className="hover:text-hum-coral transition-colors font-bold uppercase text-xs tracking-widest">About</button>
          <a href="#pricing" className="hover:text-hum-coral transition-colors font-bold uppercase text-xs tracking-widest">Pricing</a>
          <Button onClick={onStart} variant="primary">Start Free Trial</Button>
        </div>
        <Menu className="md:hidden w-6 h-6" />
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative">
        {/* Expressive lines - hand-drawn style */}
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none -z-10">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" stroke="currentColor" className="text-hum-navy">
            <path d="M50,50 C100,150 200,50 350,150" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 10" />
            <path d="M80,100 Q150,250 300,100" strokeWidth="2" strokeLinecap="round" />
            <path d="M200,300 L250,350 L300,300" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block bg-hum-yellow border-2 border-hum-navy px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full mb-8 text-hum-navy shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]">
            For Expertise-Led Businesses
          </div>
          <h1 className="text-6xl md:text-8xl font-black leading-[0.85] mb-10 tracking-tighter uppercase text-hum-navy">
            <span className="text-hum-purple">Social Media</span> <br />
            <span className="text-hum-coral">Strategy.</span> <br />
            <span className="text-hum-teal italic lowercase font-medium tracking-normal">Automated.</span>
          </h1>
          <div className="flex gap-4 mb-10">
            {['Strategy', 'Production', 'Publishing'].map((stage, i) => (
              <div key={stage} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-hum-navy text-white flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                <span className="text-xs font-black uppercase tracking-widest text-hum-navy">{stage}</span>
              </div>
            ))}
          </div>
          <p className="text-xl text-hum-navy/80 mb-12 max-w-lg leading-relaxed font-medium">
            High-authority content for expertise-led businesses. No retainers, no meetings, just consistent growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Button onClick={onStart} variant="primary" className="text-xl px-10 py-5 bg-hum-teal text-white hover:bg-hum-navy border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)]">
              Start Your Strategy <ArrowRight className="inline-block ml-2 w-6 h-6" />
            </Button>
            <div className="flex flex-col">
              <span className="text-sm font-black text-hum-navy uppercase tracking-tight">7-Day Free Trial</span>
              <span className="text-xs font-mono text-hum-navy/40">No credit card required</span>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap gap-6 text-sm font-black text-hum-navy/60 uppercase tracking-widest">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-hum-cyan" /> No retainers</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-hum-cyan" /> No meetings</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-hum-cyan" /> No guesswork</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <ContentEngineCard />
          
          {/* Decorative elements - hand drawn style */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-hum-purple rounded-full border-2 border-hum-navy -z-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] flex items-center justify-center">
             <svg viewBox="0 0 100 100" className="w-16 h-16 text-hum-navy fill-none stroke-current stroke-[2]">
                <path d="M30,30 Q50,10 70,30 Q90,50 70,70 Q50,90 30,70 Q10,50 30,30" />
             </svg>
          </div>
        </motion.div>
      </section>

      {/* Social Proof / Logos */}
      <section className="bg-hum-navy text-white py-16 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M0,50 Q250,0 500,50 T1000,50" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-6 mb-10 text-center relative z-10">
          <span className="text-xs font-black uppercase tracking-[0.3em] opacity-60">Trusted by growing expertise-led businesses</span>
        </div>
        <div className="flex whitespace-nowrap animate-[marquee_30s_linear_infinite] relative z-10">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 mx-12 opacity-40 grayscale hover:opacity-100 transition-all duration-500 cursor-default">
              <span className="text-3xl font-black uppercase italic tracking-tighter">LegalPros</span>
              <span className="text-3xl font-black uppercase italic tracking-tighter">FinanceFlow</span>
              <span className="text-3xl font-black uppercase italic tracking-tighter">PR Pulse</span>
              <span className="text-3xl font-black uppercase italic tracking-tighter">StrategyCo</span>
            </div>
          ))}
        </div>
      </section>

      {/* The Three Pillars */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { 
                title: "Strategy", 
                desc: "We build your Customer Journey Map and Content Matrix based on your specific expertise.",
                icon: <Zap className="w-12 h-12 text-hum-yellow" />
              },
              { 
                title: "Production", 
                desc: "High-authority social posts that sound like you. On-brand, every time.",
                icon: <Sparkles className="w-12 h-12 text-hum-coral" />
              },
              { 
                title: "Publishing", 
                desc: "Review, approve, and publish. We handle the delivery so you stay visible without the bottleneck.",
                icon: <Calendar className="w-12 h-12 text-hum-teal" />
              }
            ].map((pillar, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-hum-navy flex items-center justify-center mb-8 shadow-[8px_8px_0px_0px_rgba(22,55,71,1)] group-hover:rotate-6 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 text-hum-navy">{pillar.title}</h3>
                <p className="text-lg text-hum-navy/70 font-medium italic leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* From Invisible to Influential */}
      <section className="px-6 py-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase leading-[0.85] text-hum-navy">
            From <span className="text-hum-coral italic">Invisible</span> <br />
            to <span className="text-hum-teal">Influential</span>
          </h2>
          <div className="space-y-8 text-xl text-hum-navy/80 leading-relaxed font-medium">
            <p>Expertise-led businesses don't struggle with knowledge—they struggle with consistency.</p>
            <p>We've productised the agency strategy process to turn your positioning into ready-to-publish content.</p>
            <p className="font-black text-hum-navy uppercase tracking-tight bg-hum-yellow inline-block px-2 border-2 border-hum-navy">SocialHum changes that.</p>
          </div>
          <div className="mt-12">
            <button onClick={onHowItWorks} className="text-hum-teal font-black uppercase tracking-widest text-sm flex items-center gap-2 group">
              Learn exactly how it works <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-hum-yellow p-10 rounded-[2.5rem] border-2 border-hum-navy shadow-[8px_8px_0px_0px_rgba(22,55,71,1)] rotate-[-2deg]">
            <div className="text-6xl font-black mb-3 text-hum-navy">0%</div>
            <div className="text-xs font-black uppercase tracking-widest text-hum-navy/60">Guesswork</div>
          </div>
          <div className="bg-hum-cyan p-10 rounded-[2.5rem] border-2 border-hum-navy shadow-[8px_8px_0px_0px_rgba(22,55,71,1)] rotate-[2deg]">
            <div className="text-6xl font-black mb-3 text-hum-navy">100%</div>
            <div className="text-xs font-black uppercase tracking-widest text-hum-navy/60">On-Brand</div>
          </div>
          <div className="bg-hum-purple p-10 rounded-[2.5rem] border-2 border-hum-navy shadow-[8px_8px_0px_0px_rgba(22,55,71,1)] col-span-2">
            <div className="text-5xl font-black mb-3 text-hum-navy uppercase tracking-tighter leading-none">Strategy-First</div>
            <div className="text-xs font-black uppercase tracking-widest text-hum-navy/60">Positioning Engine</div>
          </div>
        </div>
      </section>

      {/* Built for Professional Services */}
      <section className="bg-hum-navy text-white py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 1000 1000">
            <circle cx="500" cy="500" r="400" stroke="white" strokeWidth="1" fill="none" />
            <circle cx="500" cy="500" r="300" stroke="white" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase leading-none">Built for <br /><span className="text-hum-cyan italic lowercase font-medium tracking-normal">Expertise-Led Businesses.</span></h2>
            <p className="text-2xl opacity-60 max-w-2xl mx-auto font-medium italic">This is not influencer content. This is authority positioning.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Law Firms', 'Accounting & Advisory', 'Consulting Firms', 'Marketing and PR', 'Boutique Advisory'].map((sector) => (
              <div key={sector} className="bg-white/5 border-2 border-white/10 p-8 rounded-[2rem] text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <div className="font-black text-sm uppercase tracking-widest group-hover:text-hum-cyan transition-colors">{sector}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Velocity */}
      <section id="pricing" className="bg-hum-cream px-6 py-32 border-t-4 border-hum-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-end mb-20">
            <div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8 text-hum-navy">
                Choose Your <br /> <span className="text-hum-purple italic lowercase font-medium tracking-normal">Velocity.</span>
              </h2>
              <p className="text-2xl text-hum-navy/70 font-medium italic">Simple, predictable pricing based on how fast you want to grow.</p>
            </div>
            <div className="flex gap-4 md:justify-end">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-full border-2 border-hum-navy px-8 py-3 font-black uppercase text-xs tracking-widest transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-white shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]' 
                    : 'bg-transparent opacity-40 hover:opacity-100'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-full border-2 border-hum-navy px-8 py-3 font-black uppercase text-xs tracking-widest transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-hum-navy text-white shadow-[4px_4px_0px_0px_rgba(22,55,71,0.2)]' 
                    : 'bg-transparent text-hum-navy opacity-40 hover:opacity-100'
                }`}
              >
                Yearly (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                name: "Basic", 
                price: billingCycle === 'monthly' ? "99" : "79", 
                designedFor: "For businesses starting their visibility journey",
                velocity: "1–2 posts per week (flexible cadence)",
                subVelocity: "Up to 8 posts per month",
                features: [
                  "Strategy engine included",
                  "Up to 8 authority-building posts per month",
                  "1 social platform",
                  "Structured content themes",
                  "Review & approve workflow",
                  "Approved posts published directly to your social channels",
                  "Flexible delivery cadence"
                ],
                color: "bg-white"
              },
              { 
                name: "Standard", 
                price: billingCycle === 'monthly' ? "199" : "159", 
                designedFor: "For businesses building visible momentum",
                velocity: "3–4 posts per week",
                subVelocity: "Up to 16 posts per month",
                features: [
                  "Strategy engine included",
                  "Up to 16 authority-building posts per month",
                  "Up to 3 social platforms",
                  "Multi-platform formatting",
                  "Expanded topic mix",
                  "Structured authority positioning",
                  "Faster content generation cycle"
                ],
                color: "bg-hum-yellow",
                popular: true
              },
              { 
                name: "Authority", 
                price: billingCycle === 'monthly' ? "299" : "239", 
                designedFor: "For businesses serious about category leadership",
                velocity: "Daily visibility",
                subVelocity: "Up to 20 authority-building posts posts per month",
                features: [
                   "Strategy engine included",
                  "Post daily - up to 20 posts per month",
                  "Up to 5 social platforms",
                  "Advanced positioning depth",
                  "Higher publishing velocity",
                  "Priority generation queue"
                ],
                color: "bg-hum-cyan"
              }
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-[3rem] p-10 ${plan.color} border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] flex flex-col hover:translate-y-[-8px] transition-transform duration-300`}>
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-hum-coral text-white border-2 border-hum-navy rounded-full px-6 py-2 font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-2 text-hum-navy">{plan.name}</h3>
                <div className="text-[10px] font-black uppercase text-hum-navy/40 mb-6 tracking-widest leading-none">{plan.designedFor}</div>
                <div className="space-y-1 mb-8">
                  <div className="text-sm font-black text-hum-coral uppercase tracking-tight italic">{plan.velocity}</div>
                  <div className="text-xs font-bold text-hum-navy/60 uppercase tracking-widest">{plan.subVelocity}</div>
                </div>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-6xl font-black text-hum-navy tracking-tighter">${plan.price}</span>
                  <span className="font-black text-hum-navy/30 uppercase text-sm tracking-widest">/mo</span>
                </div>
                <ul className="space-y-5 mb-12 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-hum-navy font-bold leading-tight">
                      <CheckCircle2 className="w-5 h-5 text-hum-navy shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button variant={plan.popular ? 'secondary' : 'outline'} className={`w-full text-lg py-5 border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] ${plan.popular ? 'bg-hum-coral text-white' : 'bg-white text-hum-navy'}`} onClick={onStart}>
                  Start 7-Day Free Trial
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-hum-navy/60 font-medium italic max-w-2xl mx-auto">
              All plans include the SocialHum Strategy Engine that maps your expertise, generates structured content themes, and produces ready-to-publish posts each month.
            </p>
          </div>
        </div>
      </section>

      {/* Why Firms Choose SocialHum */}
      <section className="px-6 py-32 max-w-5xl mx-auto relative">
        <div className="bg-white rounded-[4rem] p-16 border-4 border-hum-navy shadow-[16px_16px_0px_0px_rgba(22,55,71,1)] relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-16 text-center uppercase tracking-tighter text-hum-navy">Why Businesses Choose <span className="text-hum-teal italic">SocialHum.</span></h2>
          <div className="grid md:grid-cols-2 gap-10">
            {[
              "Strategy before content",
              "Predictable monthly output",
              "No agency retainers",
              "No internal content chaos",
              "Built for professional credibility"
            ].map((item) => (
              <div key={item} className="flex items-center gap-6 group">
                <div className="w-12 h-12 bg-hum-cyan rounded-2xl border-2 border-hum-navy flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] group-hover:rotate-6 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-hum-navy" />
                </div>
                <span className="font-black text-xl text-hum-navy uppercase tracking-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Decorative hand-drawn target */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-20 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full text-hum-navy fill-none stroke-current stroke-[2]">
              <circle cx="50" cy="50" r="40" />
              <circle cx="50" cy="50" r="25" />
              <circle cx="50" cy="50" r="10" fill="currentColor" />
           </svg>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-32 text-center bg-hum-yellow border-y-4 border-hum-navy relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85] text-hum-navy">Ready to Turn Strategy Into <span className="text-hum-coral italic">Momentum?</span></h2>
          <p className="text-2xl text-hum-navy mb-12 font-medium italic">Stop relying on sporadic posting and internal bottlenecks. Start showing up like the authority you already are.</p>
          <Button onClick={onStart} variant="secondary" className="text-2xl px-16 py-6 bg-hum-teal text-white border-4 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] hover:bg-hum-navy transition-all">
            Start Your 7-Day Free Trial <ArrowRight className="inline-block ml-3 w-8 h-8" />
          </Button>
          <p className="mt-8 text-sm font-black text-hum-navy uppercase tracking-widest opacity-40 italic">No credit card required to start.</p>
        </div>
      </section>

      {/* Upsell Section */}
      <section className="px-6 py-20 bg-hum-cream">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 bg-hum-purple p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 bg-white rounded-[2rem] border-2 border-hum-navy flex items-center justify-center shrink-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] rotate-[-3deg]">
              <Users className="w-12 h-12 text-hum-purple" />
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-hum-navy mb-2">Need help with email marketing or ads?</h3>
              <p className="text-xl text-hum-navy/70 font-medium italic">Talk to our founder about implementing your full marketing strategy.</p>
            </div>
          </div>
          <a 
            href="https://drumdigital.com.au" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-hum-navy text-white px-12 py-5 rounded-full font-black uppercase tracking-widest border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:bg-hum-teal transition-all text-center"
          >
            Talk to Drum Digital
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-hum-navy text-white px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Logo variant="reverse" className="mb-8" />
            <p className="text-hum-cream/60 max-w-sm mb-8">
              SocialHum is a product of Drum Digital. We turn strategic insights into consistent social momentum for professional services.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white/10 hum-border border-white/20 flex items-center justify-center hover:bg-hum-coral transition-colors cursor-pointer">
                <Bird className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-white/10 hum-border border-white/20 flex items-center justify-center hover:bg-hum-coral transition-colors cursor-pointer">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-6 tracking-widest text-sm">Product</h4>
            <ul className="space-y-4 text-hum-cream/60 font-medium">
              <li onClick={onHowItWorks} className="hover:text-white cursor-pointer">How it Works</li>
              <li className="hover:text-white cursor-pointer"><a href="#pricing">Pricing</a></li>
              <li className="hover:text-white cursor-pointer">Case Studies</li>
              <li className="hover:text-white cursor-pointer">API</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-6 tracking-widest text-sm">Company</h4>
            <ul className="space-y-4 text-hum-cream/60 font-medium">
              <li onClick={onAbout} className="hover:text-white cursor-pointer">About</li>
              <li className="hover:text-white cursor-pointer">Blog</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
              <li className="hover:text-white cursor-pointer">Privacy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs font-mono font-bold uppercase tracking-widest text-hum-cream/40">
          <span>© 2026 SocialHum. All rights reserved.</span>
          <span>Built by Drum Digital</span>
        </div>
      </footer>
    </div>
  );
};

// --- App Flow ---

const Questionnaire = ({ onComplete, onBack, initialData }: { onComplete: (data: any) => void, onBack: () => void, initialData?: any }) => {
  const [step, setStep] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    businessName: initialData?.companyName || '',
    primaryGoals: '',
    currentPriority: '',
    personalGoals: '',
    productsServices: '',
    location: '',
    differentiators: '',
    targetAudience: '',
    audiencePriority: '',
    keyTriggers: '',
    problemsSolved: '',
    acv: '',
    salesType: 'Recurring',
    websiteUrl: '',
    seasonality: '',
    competitor1: '',
    competitor2: '',
    competitor3: '',
    competitor4: '',
    competitor5: '',
    marketingActivities: '',
    whatWorks: '',
    websiteTraffic: '',
    monthlyLeads: '',
    newCustomers: '',
    brandColors: '',
    brandFonts: '',
    linkedinUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    tiktokUrl: '',
    toneGuidelines: '',
    styleGuide: null as string | null,
    logoFiles: null as string | null
  });

  // Load saved progress
  useEffect(() => {
    const savedData = localStorage.getItem('socialhum_strategy_draft');
    const savedStep = localStorage.getItem('socialhum_strategy_step');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    if (savedStep) {
      setStep(parseInt(savedStep, 10));
    }
  }, []);

  const handleSaveForLater = () => {
    setSaveStatus('saving');
    localStorage.setItem('socialhum_strategy_draft', JSON.stringify(formData));
    localStorage.setItem('socialhum_strategy_step', step.toString());
    
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const steps = [
    { 
      id: 'identity', 
      title: 'Business Identity',
      q: "Let's start with the basics. Who are we building for?", 
      fields: [
        { id: 'websiteUrl', label: 'Website URL', type: 'text', placeholder: 'e.g. https://www.humsocial.com.au (We\'ll analyze this for brand voice)', required: true },
        { id: 'location', label: 'Geographic market/location', type: 'text', placeholder: 'e.g. Sydney Metro, National Australia, or Global (Be specific about your primary service area)', required: true }
      ]
    },
    { 
      id: 'goals', 
      title: 'Strategy & Goals',
      q: "What are we aiming for?", 
      fields: [
        { id: 'primaryGoals', label: 'Primary business goals', type: 'textarea', placeholder: 'e.g. "Increase monthly qualified leads by 20% within 6 months" or "Establish thought leadership in the FinTech space by publishing 2 deep-dives per week."', required: true },
        { id: 'currentPriority', label: 'What objective is your priority right now?', type: 'textarea', placeholder: 'e.g. "We are launching a new product in October and need to build a waitlist of 500 people." or "Improving customer retention through educational content."', required: true },
        { id: 'personalGoals', label: 'Any personal goals?', type: 'textarea', placeholder: 'e.g. "I want to spend 50% less time on manual social media posting" or "I want to be recognized as a top 10 influencer in my niche."' }
      ]
    },
    { 
      id: 'offerings', 
      title: 'Offerings & Edge',
      q: "What do you bring to the table?", 
      fields: [
        { id: 'productsServices', label: 'What products/services do you offer?', type: 'textarea', placeholder: 'e.g. "B2B SaaS platform for inventory management, including mobile app and desktop dashboard." List your top 3 revenue drivers.', required: true },
        { id: 'differentiators', label: 'What makes you different?', type: 'textarea', placeholder: 'e.g. "Unlike competitors, we offer 24/7 human support and our interface is designed for non-technical users." What is your "Unfair Advantage"?', required: true },
        { id: 'seasonality', label: 'What seasonality impacts your business?', type: 'textarea', placeholder: 'e.g. "70% of our sales happen between Nov-Jan due to Christmas gifting." or "We see a dip in July during school holidays."' }
      ]
    },
    { 
      id: 'audience', 
      title: 'Target Audience',
      q: "Who are we talking to?", 
      fields: [
        { id: 'targetAudience', label: 'Who is your target audience?', type: 'textarea', placeholder: 'e.g. "Female entrepreneurs aged 30-45, based in Australia, earning $100k+, who value sustainability and work-life balance."', required: true },
        { id: 'audiencePriority', label: 'What target audience is your priority right now?', type: 'textarea', placeholder: 'e.g. "Specifically focusing on HR Managers in mid-sized tech companies (50-200 employees) looking for wellness programs."', required: true },
        { id: 'keyTriggers', label: 'Key triggers for your customers?', type: 'textarea', placeholder: 'e.g. "They just received a round of funding," "They are failing an audit," or "They are frustrated with their current slow manual process."', required: true },
        { id: 'problemsSolved', label: 'What problems do you solve?', type: 'textarea', placeholder: 'e.g. "We eliminate 10 hours of manual data entry per week" or "We provide peace of mind that their tax compliance is 100% accurate."', required: true }
      ]
    },
    { 
      id: 'economics', 
      title: 'Business Economics',
      q: "How does the business flow?", 
      fields: [
        { id: 'acv', label: 'Average customer value (ACV)', type: 'text', placeholder: 'e.g. $5,000 initial setup + $500/month recurring', required: true },
        { id: 'salesType', label: 'Sales Type', type: 'select', options: ['One-off', 'Recurring'] }
      ]
    },
    { 
      id: 'competitors', 
      title: 'Competitors',
      q: "Who else is in the space?", 
      fields: [
        { id: 'competitor1', label: 'Competitor Website URL 1', type: 'text', placeholder: 'https://www.competitor-a.com (Who do you lose deals to most often?)' },
        { id: 'competitor2', label: 'Competitor Website URL 2', type: 'text', placeholder: 'https://www.competitor-b.com' },
        { id: 'competitor3', label: 'Competitor Website URL 3', type: 'text', placeholder: 'https://www.competitor-c.com' },
        { id: 'competitor4', label: 'Competitor Website URL 4', type: 'text', placeholder: 'https://www.competitor-d.com' },
        { id: 'competitor5', label: 'Competitor Website URL 5', type: 'text', placeholder: 'https://www.competitor-e.com' }
      ]
    },
    { 
      id: 'marketing', 
      title: 'Marketing History',
      q: "What's the current state of play?", 
      fields: [
        { id: 'marketingActivities', label: 'Current marketing activities', type: 'textarea', placeholder: 'e.g. "Posting 3x week on LinkedIn, running $500/mo Google Ads, monthly email newsletter to 1,000 subs."' },
        { id: 'whatWorks', label: 'What works and what hasn\'t worked?', type: 'textarea', placeholder: 'e.g. "LinkedIn outreach works well, but Facebook Ads had a very high CPL and low quality."' },
        { id: 'websiteTraffic', label: 'Monthly website traffic', type: 'text', placeholder: 'e.g. 2,500 unique visitors per month (Check your Google Analytics)' },
        { id: 'monthlyLeads', label: 'Monthly leads', type: 'text', placeholder: 'e.g. 45 inbound inquiries per month' },
        { id: 'newCustomers', label: 'Monthly new customers', type: 'text', placeholder: 'e.g. 12 new signed contracts per month' }
      ]
    },
    { 
      id: 'brand', 
      title: 'Brand & Social',
      q: "Let's polish the look and feel.", 
      fields: [
        { id: 'brandColors', label: 'Brand colors', type: 'textarea', placeholder: 'e.g. Primary: #006777 (Teal), Secondary: #FEDA5F (Yellow). Provide HEX codes if possible.', required: true },
        { id: 'brandFonts', label: 'Brand fonts', type: 'text', placeholder: 'e.g. Montserrat for Headings, Open Sans for Body text.' },
        { id: 'toneGuidelines', label: 'Brand tone and voice guidelines', type: 'textarea', placeholder: 'e.g. "Professional yet approachable, witty but not sarcastic, authoritative but helpful." Use 3-5 adjectives.', required: true },
        { id: 'styleGuide', label: 'Upload your brand style guide', type: 'file', placeholder: 'Choose File (PDF or Image)' },
        { id: 'logoFiles', label: 'Upload logo files', type: 'file', placeholder: 'Choose File (PNG, SVG, or JPG)' }
      ]
    },
    { 
      id: 'social', 
      title: 'Social Channels',
      q: "Where do you hang out?", 
      fields: [
        { id: 'linkedinUrl', label: 'LinkedIn (URL)', type: 'text', placeholder: 'https://linkedin.com/company/your-brand' },
        { id: 'instagramUrl', label: 'Instagram (URL)', type: 'text', placeholder: 'https://instagram.com/your-brand' },
        { id: 'facebookUrl', label: 'Facebook (URL)', type: 'text', placeholder: 'https://facebook.com/your-brand' },
        { id: 'twitterUrl', label: 'Twitter/X (URL)', type: 'text', placeholder: 'https://twitter.com/your-brand' },
        { id: 'tiktokUrl', label: 'TikTok (URL)', type: 'text', placeholder: 'https://tiktok.com/your-brand' }
      ]
    }
  ];

  const syncToHubSpot = async (data: any) => {
    try {
      await fetch('/api/hubspot/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          businessName: data.businessName,
          websiteUrl: data.websiteUrl
        })
      });
    } catch (error) {
      console.error('HubSpot sync failed:', error);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const next = () => {
    // Validate required fields
    const currentStepFields = steps[step].fields;
    const missingFields = currentStepFields.filter(f => f.required && !(formData as any)[f.id]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }
    
    setError(null);
    if (step === 0) {
      syncToHubSpot(formData);
    }
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete(formData);
  };

  const prev = () => {
    setStep(Math.max(0, step - 1));
  };

  const toggleOption = (fieldId: string, option: string) => {
    const current = (formData as any)[fieldId] as string[];
    if (current.includes(option)) {
      setFormData({ ...formData, [fieldId]: current.filter(i => i !== option) });
    } else {
      setFormData({ ...formData, [fieldId]: [...current, option] });
    }
  };

  return (
    <OnboardingLayout 
      currentStep="strategy-builder"
      onBackToHome={onBack}
      rightPanelContent={
        <motion.div 
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-hum-yellow rounded-xl flex items-center justify-center">
              <BarChart3 className="text-hum-navy w-6 h-6" />
            </div>
            <div className="font-black uppercase tracking-tight text-hum-navy text-xl">Strategy Matrix</div>
          </div>
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40">Current Progress</div>
            <div className="w-full bg-hum-navy/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-hum-teal h-full transition-all duration-500" 
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-hum-navy/60">Step {step + 1} of {steps.length}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-hum-teal">{steps[step].title}</span>
            </div>
          </div>
          <div className="mt-8 p-6 bg-hum-cream rounded-2xl border-2 border-hum-navy italic text-sm font-medium text-hum-navy/70 leading-relaxed">
            "We're mapping your {steps[step].title.toLowerCase()} to ensure every post builds authority."
          </div>
        </motion.div>
      }
    >
      <div className="mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-hum-teal mb-2 block">Strategy Builder</span>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-hum-navy leading-none">
          {steps[step].q}
        </h2>
        {error && (
          <div className="bg-hum-coral/10 border-2 border-hum-coral p-4 rounded-2xl text-hum-coral font-bold text-sm mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-6 mb-10">
        {steps[step].fields.map((field) => (
          <div key={field.id} className="space-y-3">
            {field.label && <label className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40 ml-2">{field.label}</label>}
            
            {field.type === 'text' && (
              <input 
                type="text"
                className="w-full rounded-2xl border-2 border-hum-navy p-4 font-bold text-hum-navy focus:bg-hum-cream outline-none transition-all shadow-[4px_4px_0px_0px_rgba(22,55,71,0.1)]"
                placeholder={field.placeholder}
                value={(formData as any)[field.id]}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
              />
            )}

            {field.type === 'email' && (
              <input 
                type="email"
                className="w-full rounded-2xl border-2 border-hum-navy p-4 font-bold text-hum-navy focus:bg-hum-cream outline-none transition-all shadow-[4px_4px_0px_0px_rgba(22,55,71,0.1)]"
                placeholder={field.placeholder}
                value={(formData as any)[field.id]}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
              />
            )}

            {field.type === 'file' && (
              <div className="relative">
                <input 
                  type="file"
                  className="hidden"
                  id={field.id}
                  accept={field.id === 'logoFiles' ? '.png,.svg,.jpg,.jpeg' : '*'}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({...formData, [field.id]: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label 
                  htmlFor={field.id}
                  className="flex items-center justify-center w-full rounded-2xl border-2 border-dashed border-hum-navy/30 p-8 font-bold text-hum-navy/60 hover:bg-hum-cream hover:border-hum-navy transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <span>
                      {(formData as any)[field.id] 
                        ? (typeof (formData as any)[field.id] === 'string' && (formData as any)[field.id].startsWith('data:') 
                            ? 'File selected' 
                            : (formData as any)[field.id])
                        : field.placeholder || 'Upload File'}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {field.type === 'textarea' && (
              <textarea 
                className="w-full rounded-2xl border-2 border-hum-navy p-4 font-bold text-hum-navy focus:bg-hum-cream outline-none h-40 transition-all shadow-[4px_4px_0px_0px_rgba(22,55,71,0.1)]"
                placeholder={field.placeholder}
                value={(formData as any)[field.id]}
                onChange={e => setFormData({...formData, [field.id]: e.target.value})}
              />
            )}

            {field.type === 'select' && (
              <div className="grid grid-cols-1 gap-3">
                {field.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFormData({...formData, [field.id]: opt})}
                    className={`rounded-xl border-2 p-4 font-black uppercase tracking-tight text-left transition-all text-sm ${
                      (formData as any)[field.id] === opt 
                        ? 'bg-hum-yellow border-hum-navy shadow-[4px_4px_0px_0px_rgba(22,55,71,1)] -translate-y-0.5' 
                        : 'bg-white border-hum-navy/20 hover:bg-hum-cream'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {field.type === 'multiselect' && (
              <div className="grid grid-cols-1 gap-3">
                {field.options?.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleOption(field.id, opt)}
                    className={`rounded-xl border-2 p-4 font-black uppercase tracking-tight text-left transition-all text-sm ${
                      ((formData as any)[field.id] as string[]).includes(opt)
                        ? 'bg-hum-cyan border-hum-navy shadow-[4px_4px_0px_0px_rgba(22,55,71,1)] -translate-y-0.5' 
                        : 'bg-white border-hum-navy/20 hover:bg-hum-cream'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {opt}
                      {((formData as any)[field.id] as string[]).includes(opt) && <CheckCircle2 className="w-4 h-4 text-hum-navy" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={prev}
            className={`font-black uppercase text-xs tracking-widest text-hum-navy/40 hover:text-hum-navy transition-all ${step === 0 ? 'invisible' : ''}`}
          >
            Back
          </button>
          <button 
            onClick={handleSaveForLater}
            className="flex items-center gap-2 font-black uppercase text-xs tracking-widest text-hum-teal hover:text-hum-navy transition-all"
          >
            {saveStatus === 'saving' ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Progress Saved!' : 'Save for Later'}
          </button>
        </div>
        <Button onClick={next} variant="secondary" className="bg-hum-teal text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)] px-10">
          {step === steps.length - 1 ? 'Generate Strategy' : 'Next Step'} <ArrowRight className="inline-block ml-2 w-5 h-5" />
        </Button>
      </div>
    </OnboardingLayout>
  );
};

const BrandedEmailPreview = () => (
  <div className="bg-white border-2 border-hum-navy rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(13,56,71,1)] max-w-sm mx-auto">
    <div className="bg-hum-navy p-4 flex justify-center">
      <Logo className="h-8 invert" iconOnly={false} />
    </div>
    <div className="p-8 space-y-4">
      <div className="h-4 w-1/3 bg-hum-navy/10 rounded" />
      <div className="h-8 w-2/3 bg-hum-navy rounded" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-hum-navy/5 rounded" />
        <div className="h-3 w-full bg-hum-navy/5 rounded" />
        <div className="h-3 w-4/5 bg-hum-navy/5 rounded" />
      </div>
      <div className="pt-4">
        <div className="h-10 w-32 bg-hum-coral rounded-full" />
      </div>
    </div>
    <div className="bg-hum-cream p-4 text-center text-[10px] font-bold uppercase tracking-widest text-hum-navy/40">
      © 2026 SocialHum • Expertise-Led Growth
    </div>
  </div>
);

const ThankYouPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-hum-cream flex items-center justify-center p-6 relative overflow-hidden">
      {/* Expressive lines background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000">
          <path d="M100,100 Q300,500 100,900" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M900,100 Q700,500 900,900" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-hum-navy p-12 md:p-20 rounded-[4rem] shadow-[20px_20px_0px_0px_rgba(22,55,71,1)] max-w-3xl w-full text-center relative z-10"
      >
        <div className="w-24 h-24 bg-hum-yellow rounded-[2rem] border-2 border-hum-navy flex items-center justify-center mx-auto mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] rotate-[-6deg]">
          <Sparkles className="w-12 h-12 text-hum-navy" />
        </div>
        
        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-hum-navy mb-6 leading-none">
          Congratulations! <br />
          <span className="text-hum-teal italic lowercase font-medium tracking-normal">Your strategy is on the way.</span>
        </h2>
        
        <p className="text-xl md:text-2xl text-hum-navy/70 font-medium italic mb-12 max-w-xl mx-auto">
          Thank you for sharing your vision with us. We're now processing your inputs to build a category-leading authority strategy.
        </p>

        <div className="bg-hum-cream rounded-3xl border-2 border-hum-navy p-8 mb-12 flex flex-col md:flex-row items-center gap-8 text-left">
          <div className="w-16 h-16 bg-hum-coral rounded-2xl border-2 border-hum-navy flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div>
            <h4 className="font-black uppercase tracking-tight text-hum-navy text-xl mb-1">Check your inbox</h4>
            <p className="text-sm text-hum-navy/60 font-bold">We will email the complete strategy artefacts and your first content batch to you within the next 24 hours.</p>
          </div>
        </div>

        <Button onClick={onBack} variant="primary" className="bg-hum-navy text-white px-12 py-5 rounded-full font-black uppercase tracking-widest border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:bg-hum-teal transition-all">
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

const HowItWorks = ({ onStart, onBack, onAbout }: { onStart: () => void, onBack: () => void, onAbout: () => void }) => {
  return (
    <div className="min-h-screen bg-hum-cream">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Logo onClick={onBack} className="cursor-pointer" />
        <div className="hidden md:flex items-center gap-8 font-black uppercase text-xs tracking-widest">
          <button onClick={onBack} className="text-hum-navy/60 hover:text-hum-navy transition-colors">Home</button>
          <button onClick={onAbout} className="text-hum-navy/60 hover:text-hum-navy transition-colors">About</button>
          <Button onClick={onStart} variant="primary">Start Free Trial</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-hum-navy leading-[0.85] mb-8">
              Turn your expertise into <br />
              <span className="text-hum-coral italic lowercase font-medium tracking-normal">consistent social authority.</span>
            </h1>
            <div className="max-w-2xl mx-auto space-y-6 text-xl text-hum-navy/70 font-medium italic">
              <p>Most professional service firms know they should be posting on social media.</p>
              <p>But strategy lives in conversations. Content gets delegated. Posting becomes inconsistent.</p>
              <p className="text-hum-navy not-italic font-black uppercase tracking-tight bg-hum-yellow inline-block px-4 py-1 border-2 border-hum-navy">
                SocialHum turns that thinking into a structured system that produces ready-to-publish content every month.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm font-black uppercase tracking-widest text-hum-navy">
                <span>• No retainers</span>
                <span>• No internal bottlenecks</span>
                <span>• Just clear strategy</span>
              </div>
            </div>
          </div>

          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-hum-yellow p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
              <div className="w-16 h-16 bg-hum-navy text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-8">01</div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-hum-navy mb-6">Define Your Expertise</h2>
              <p className="text-lg font-black uppercase tracking-tight text-hum-coral mb-4 italic">Strategy First. Always.</p>
              <p className="text-hum-navy/70 font-medium italic leading-relaxed">
                Before content is created, SocialHum maps your expert positioning. You complete a short strategic questionnaire covering your services, audience, and the insights you want to be known for.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-white border-2 border-hum-navy p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(22,55,71,0.1)]">
                <h4 className="font-black uppercase tracking-tight text-hum-navy mb-2">Customer Journey Map</h4>
                <p className="text-sm text-hum-navy/60 font-medium italic">How prospects move from unaware → client.</p>
              </div>
              <div className="bg-white border-2 border-hum-navy p-6 rounded-2xl shadow-[6px_6px_0px_0px_rgba(22,55,71,0.1)]">
                <h4 className="font-black uppercase tracking-tight text-hum-navy mb-2">Content Matrix</h4>
                <p className="text-sm text-hum-navy/60 font-medium italic">The themes your business should consistently speak about.</p>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-hum-teal italic">This ensures every post supports long-term authority, not random visibility.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-4">
              {[
                { type: 'Insight Post', text: 'Most professional services firms don’t struggle with expertise. They struggle with translating that expertise into visible thinking.' },
                { type: 'Educational Post', text: '3 questions every founder should ask before hiring a PR agency.' },
                { type: 'Perspective Post', text: 'Why most LinkedIn content fails to build authority.' },
                { type: 'Industry Commentary', text: 'What the new regulatory changes mean for advisory firms.' }
              ].map((post, i) => (
                <div key={i} className="bg-white border-2 border-hum-navy p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(22,55,71,0.05)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-hum-coral mb-2">{post.type}</div>
                  <p className="text-sm font-bold text-hum-navy italic leading-relaxed">"{post.text}"</p>
                </div>
              ))}
            </div>
            <div className="order-1 md:order-2 bg-hum-cyan p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
              <div className="w-16 h-16 bg-hum-navy text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-8">02</div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-hum-navy mb-6">Generate Authority Content</h2>
              <p className="text-lg font-black uppercase tracking-tight text-hum-teal mb-4 italic">Your ideas turned into structured posts</p>
              <p className="text-hum-navy/70 font-medium italic leading-relaxed">
                Once the strategy is defined, the SocialHum engine produces authority-building content based on your expertise. Each post is designed to demonstrate expertise, address client questions, and reinforce your positioning.
              </p>
            </div>
          </div>

          {/* Step 3 & 4 */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-hum-coral p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] text-white">
              <div className="w-16 h-16 bg-white text-hum-navy rounded-2xl flex items-center justify-center text-2xl font-black mb-8">03</div>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Review and Approve</h2>
              <p className="text-lg font-black uppercase tracking-tight text-hum-yellow mb-4 italic">Maintain control without the workload</p>
              <p className="opacity-80 font-medium italic leading-relaxed">
                All content is delivered through a structured review workflow. You remain in control of your voice while removing the burden of creating content internally.
              </p>
            </div>
            <div className="bg-hum-purple p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
              <div className="w-16 h-16 bg-hum-navy text-white rounded-2xl flex items-center justify-center text-2xl font-black mb-8">04</div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-hum-navy mb-6">Publish and Stay Visible</h2>
              <p className="text-lg font-black uppercase tracking-tight text-hum-teal mb-4 italic">Consistency builds authority</p>
              <p className="text-hum-navy/70 font-medium italic leading-relaxed">
                Once approved, posts are published directly to your social channels. The result is a steady flow of insight-driven content that reinforces your expertise over time.
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-hum-navy text-white p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,100 M100,0 L0,100" stroke="white" strokeWidth="0.5" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 leading-none">What You Receive <br /><span className="text-hum-cyan italic lowercase font-medium tracking-normal">Each Month.</span></h2>
            <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-16">
              {[
                "Structured content strategy",
                "Authority-building social posts",
                "Multi-platform formatting",
                "Review workflow",
                "Publishing support"
              ].map(item => (
                <div key={item} className="flex items-center gap-4">
                  <CheckCircle2 className="text-hum-teal w-6 h-6 shrink-0" />
                  <span className="font-black uppercase tracking-tight text-lg">{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-6 text-xl opacity-70 font-medium italic max-w-2xl mx-auto">
              <p>Professional services grow through credibility and trust. But credibility requires consistent visibility.</p>
              <p>SocialHum removes the friction between thinking and publishing so your expertise shows up in the market every month.</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center pb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-hum-navy mb-8 leading-none">
              Start Your <span className="text-hum-coral">Strategy.</span>
            </h2>
            <p className="text-2xl text-hum-navy/60 mb-12 font-medium italic">Turn your expertise into consistent authority-building content.</p>
            <Button onClick={onStart} variant="secondary" className="text-2xl px-16 py-6 bg-hum-teal text-white border-4 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] hover:bg-hum-navy transition-all">
              Start Your 7-Day Free Trial <ArrowRight className="inline-block ml-3 w-8 h-8" />
            </Button>
            <p className="mt-8 text-sm font-black text-hum-navy uppercase tracking-widest opacity-40 italic">No credit card required.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AboutPage = ({ onStart, onBack }: { onStart: () => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-hum-cream">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Logo onClick={onBack} className="cursor-pointer" />
        <div className="hidden md:flex items-center gap-8 font-black uppercase text-xs tracking-widest">
          <button onClick={onBack} className="text-hum-navy/60 hover:text-hum-navy transition-colors">Home</button>
          <Button onClick={onStart} variant="primary">Start Free Trial</Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-hum-navy leading-[0.85] mb-8">
              About <br />
              <span className="text-hum-coral italic lowercase font-medium tracking-normal">SocialHum.</span>
            </h1>
            <div className="max-w-2xl mx-auto space-y-6 text-xl text-hum-navy/70 font-medium italic">
              <p className="text-hum-navy not-italic font-black uppercase tracking-tight bg-hum-yellow inline-block px-4 py-1 border-2 border-hum-navy">
                Strategy Before Content
              </p>
              <p>SocialHum was created to solve a problem I’ve seen for more than two decades working in digital marketing.</p>
              <p>Most expertise-led businesses don’t struggle with ideas. They struggle with turning those ideas into consistent visibility.</p>
              <p>Strategy lives in partner meetings. Content gets delegated internally. Posting becomes sporadic. Momentum disappears.</p>
              <p className="text-hum-teal font-black uppercase tracking-widest">SocialHum was built to fix that.</p>
            </div>
          </div>

          {/* Founder Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-hum-navy text-white p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Built From 20 Years in Digital Marketing</h2>
              <p className="opacity-80 font-medium italic leading-relaxed mb-8">
                Hi, I’m Jo Sharma, founder of SocialHum and CEO of Drum Digital.
              </p>
              <p className="opacity-80 font-medium italic leading-relaxed">
                For more than twenty years, I’ve worked with professional services firms helping them translate their expertise into digital visibility — through websites, content marketing, social media, and digital strategy.
              </p>
            </div>
            <div className="space-y-6">
              <div className="bg-white border-2 border-hum-navy p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(22,55,71,0.1)]">
                <p className="text-hum-navy/70 font-medium italic leading-relaxed">
                  "Across hundreds of projects, one pattern kept appearing: Businesses had strong expertise and valuable insights — but no structured way to turn that thinking into consistent content."
                </p>
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-hum-coral italic">
                SocialHum was built by productising the agency workflow that solved this problem.
              </p>
            </div>
          </div>

          {/* The Idea Section */}
          <div className="bg-hum-cyan p-12 md:p-20 rounded-[4rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-hum-navy mb-12 leading-none">The Idea Behind <br /><span className="text-hum-coral italic lowercase font-medium tracking-normal">SocialHum.</span></h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6 text-lg text-hum-navy/70 font-medium italic">
                <p>Instead of asking businesses to become content creators, SocialHum turns strategic thinking into a repeatable system.</p>
                <p>We start with positioning and expertise mapping.</p>
                <p>Then we generate structured content based on the problems your clients face, the insights you want to be known for, and the perspective your business brings to your industry.</p>
              </div>
              <div className="bg-white border-2 border-hum-navy p-8 rounded-3xl">
                <p className="text-hum-navy font-black uppercase tracking-tight mb-4">The Result:</p>
                <ul className="space-y-4 text-hum-navy/70 font-medium italic">
                  <li>• Authority-building social content</li>
                  <li>• Reflects how experts actually think</li>
                  <li>• Not influencer content</li>
                  <li>• Not generic marketing posts</li>
                  <li>• Strategic content designed to reinforce credibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Built for Expertise Section */}
          <div className="text-center py-10">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-hum-navy mb-12">Built for Expertise-Led Businesses</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {['law firms', 'consulting firms', 'accounting and advisory', 'boutique agencies', 'professional services'].map(item => (
                <span key={item} className="bg-hum-yellow px-6 py-2 rounded-full border-2 border-hum-navy font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-12 text-2xl text-hum-navy/60 font-medium italic max-w-2xl mx-auto">
              These businesses don’t need viral posts. They need consistent authority positioning.
            </p>
          </div>

          {/* Agency Workflow Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-hum-navy leading-none">From Agency Workflow <br /><span className="text-hum-teal italic lowercase font-medium tracking-normal">to Product.</span></h2>
              <p className="text-lg text-hum-navy/70 font-medium italic leading-relaxed">
                Traditional agencies solve the problem of content consistency — but often with large retainers and ongoing meetings.
              </p>
              <p className="text-lg text-hum-navy/70 font-medium italic leading-relaxed">
                SocialHum takes the strategy framework used in agency engagements and turns it into a streamlined system.
              </p>
            </div>
            <div className="bg-hum-purple p-12 rounded-[3rem] border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)]">
              <p className="text-hum-navy font-black uppercase tracking-tight mb-6">The result:</p>
              <ul className="space-y-4 text-hum-navy/70 font-medium italic">
                <li className="flex items-center gap-3"><CheckCircle2 className="text-hum-navy w-5 h-5" /> clear strategic positioning</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-hum-navy w-5 h-5" /> consistent social visibility</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="text-hum-navy w-5 h-5" /> structured monthly content output</li>
              </ul>
            </div>
          </div>

          {/* Drum Digital Section */}
          <div className="bg-hum-navy text-white p-12 md:p-20 rounded-[4rem] text-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-none">A Product of <br /><span className="text-hum-yellow italic lowercase font-medium tracking-normal">Drum Digital.</span></h2>
            <p className="text-xl opacity-70 font-medium italic max-w-2xl mx-auto mb-12">
              SocialHum is built by Drum Digital, a digital marketing agency focused on helping professional services firms grow through strategic visibility.
            </p>
            <div className="bg-white/10 border-2 border-white/20 p-12 rounded-3xl text-left">
              <h4 className="font-black uppercase tracking-tight text-xl mb-6">Our Philosophy</h4>
              <p className="opacity-80 font-medium italic leading-relaxed mb-6">
                We believe that expertise-led businesses should be visible for the insights they bring to their industry.
              </p>
              <p className="opacity-80 font-medium italic leading-relaxed">
                SocialHum exists to ensure that valuable thinking doesn’t stay trapped in internal conversations. Instead, it becomes visible authority in the market.
              </p>
            </div>
          </div>

          {/* Why I Built This Section */}
          <div className="bg-hum-cream border-4 border-hum-navy p-12 rounded-[3rem] shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Quote className="w-20 h-20 text-hum-navy" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-hum-navy mb-8">Why I Built This</h2>
            <div className="space-y-6 text-lg text-hum-navy/70 font-medium italic max-w-2xl">
              <p>After more than 20 years helping businesses grow through digital marketing, I saw how often valuable expertise never made it into the market.</p>
              <p>SocialHum is my attempt to solve that problem at scale — by turning strategic thinking into a system that consistently produces authority-building content.</p>
            </div>
            <div className="mt-12 pt-8 border-t border-hum-navy/10">
              <p className="font-black text-hum-navy uppercase tracking-widest">— Jo Sharma</p>
              <p className="text-xs font-bold text-hum-navy/40 uppercase tracking-widest mt-1">Founder, SocialHum • CEO, Drum Digital</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center pb-20">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-hum-navy mb-8 leading-none">
              Start Your <span className="text-hum-coral">Strategy.</span>
            </h2>
            <p className="text-2xl text-hum-navy/60 mb-12 font-medium italic">If your business has valuable insights but struggles to turn them into consistent content, SocialHum was built for you.</p>
            <Button onClick={onStart} variant="secondary" className="text-2xl px-16 py-6 bg-hum-teal text-white border-4 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] hover:bg-hum-navy transition-all">
              Start Your 7-Day Free Trial <ArrowRight className="inline-block ml-3 w-8 h-8" />
            </Button>
            <p className="mt-8 text-sm font-black text-hum-navy uppercase tracking-widest opacity-40 italic">No credit card required.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StrategyDashboard = ({ data, onNext, onBack }: { data: any, onNext: () => void, onBack: () => void }) => {
  return (
    <div className="min-h-screen bg-hum-cream p-6 md:p-12 relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hum-navy/40 hover:text-hum-navy transition-colors group z-50"
      >
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>
      {/* Expressive lines background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000">
          <path d="M100,100 Q300,500 100,900" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M900,100 Q700,500 900,900" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <div className="flex items-center gap-6 mb-4">
              <Logo />
              <div className="bg-hum-teal text-white border-2 border-hum-navy px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]">Strategy Active</div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-hum-navy leading-none">Your Strategy <br /><span className="text-hum-coral italic lowercase font-medium tracking-normal">Artefacts.</span></h1>
          </div>
          <Button onClick={onNext} variant="primary" className="bg-hum-teal text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)] text-xl px-10 py-5">
            Generate Content <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {/* Customer Journey */}
          <Card className="md:col-span-2 bg-white border-2 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] rounded-[3rem] p-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-hum-coral rounded-2xl border-2 border-hum-navy flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-hum-navy">Customer Journey Map</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Awareness', 'Consideration', 'Decision', 'Advocacy'].map((stage, i) => (
                <div key={stage} className="space-y-4">
                  <div className="bg-hum-navy text-white p-3 text-center text-[10px] font-black uppercase tracking-widest rounded-xl border-2 border-hum-navy">{stage}</div>
                  <div className="bg-hum-cream rounded-2xl border-2 border-hum-navy p-6 text-sm font-medium h-40 overflow-hidden italic leading-relaxed shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    {i === 0 ? "Client realizes they have a regulatory risk..." : i === 1 ? "Comparing businesses with specialized expertise..." : i === 2 ? "Reviewing proposal and case studies..." : "Referring colleagues and sharing success..."}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Digital Ecosystem */}
          <Card color="bg-hum-yellow" className="border-2 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] rounded-[3rem] p-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-white rounded-2xl border-2 border-hum-navy flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <Zap className="w-8 h-8 text-hum-navy" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-hum-navy">Ecosystem</h3>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Primary', val: 'LinkedIn' },
                { label: 'Secondary', val: 'Newsletter' },
                { label: 'Authority', val: 'Whitepapers' }
              ].map(item => (
                <div key={item.label} className="bg-white border-2 border-hum-navy p-6 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-hum-navy/40 mb-1">{item.label}</div>
                  <div className="font-black text-xl text-hum-navy uppercase tracking-tight">{item.val}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Content Matrix */}
          <Card className="md:col-span-3 bg-white border-2 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] rounded-[3rem] p-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-hum-purple rounded-2xl border-2 border-hum-navy flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-hum-navy">Content Matrix</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { type: 'Educate', weight: '40%', desc: 'Thought leadership, industry news, regulatory updates.', color: 'bg-hum-yellow' },
                { type: 'Inspire', weight: '20%', desc: 'Client success stories, business culture, mission-driven content.', color: 'bg-hum-cyan' },
                { type: 'Convince', weight: '30%', desc: 'Case studies, service deep-dives, testimonials.', color: 'bg-hum-coral' },
                { type: 'Promote', weight: '10%', desc: 'Direct offers, webinar invites, consultation links.', color: 'bg-hum-purple' }
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl border-2 border-hum-navy p-8 ${item.color} shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-sm uppercase tracking-widest text-hum-navy">{item.type}</span>
                    <span className="font-mono font-black text-hum-navy text-xl">{item.weight}</span>
                  </div>
                  <p className="text-sm text-hum-navy/70 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Brand & Email Identity */}
          <Card className="md:col-span-3 bg-hum-cream border-2 border-hum-navy shadow-[10px_10px_0px_0px_rgba(22,55,71,1)] rounded-[3rem] p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-hum-teal rounded-2xl border-2 border-hum-navy flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tight text-hum-navy">Brand & Email Identity</h3>
                </div>
                <p className="text-lg text-hum-navy/70 font-medium italic mb-8">
                  "Your expertise is reflected in every touchpoint. We've mapped your brand colors and logo to all outgoing communications, ensuring a consistent authority position."
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-hum-teal border-2 border-hum-navy" />
                    <span className="font-black uppercase tracking-widest text-xs">Primary: Hum Teal</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-hum-coral border-2 border-hum-navy" />
                    <span className="font-black uppercase tracking-widest text-xs">Accent: Hum Coral</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-hum-navy border-2 border-hum-navy" />
                    <span className="font-black uppercase tracking-widest text-xs">Typography: Hum Navy</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -right-6 bg-hum-yellow border-2 border-hum-navy rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-10 rotate-12">
                  Email Preview
                </div>
                <BrandedEmailPreview />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ContentReview = ({ onBack }: { onBack: () => void }) => {
  const [activePost, setActivePost] = useState(0);
  const posts = [
    { 
      platform: 'LinkedIn', 
      caption: "In the rapidly evolving landscape of professional services, consistency isn't just a goal—it's a competitive advantage. Here's how our business is navigating the latest regulatory shifts in 2026. #ProfessionalServices #Strategy",
      image: "https://picsum.photos/seed/post1/800/600",
      status: 'Ready'
    },
    { 
      platform: 'Twitter', 
      caption: "Strategy without execution is just a hallucination. We're helping businesses turn their 'what' into 'how'. 🚀 #BusinessGrowth",
      image: "https://picsum.photos/seed/post2/800/600",
      status: 'Review'
    },
    { 
      platform: 'Instagram', 
      caption: "Behind the scenes at SocialHum. We're keeping things humming along so you can focus on what you do best. ✨",
      image: "https://picsum.photos/seed/post3/800/600",
      status: 'Ready'
    }
  ];

  return (
    <div className="min-h-screen bg-hum-cyan p-6 md:p-12 relative overflow-hidden">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-hum-navy/40 hover:text-hum-navy transition-colors group z-50"
      >
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <Logo />
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-hum-navy leading-none mt-4">Content Review <br /><span className="text-white italic lowercase font-medium tracking-normal">March 2026.</span></h1>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-2 border-hum-navy shadow-[4px_4px_0px_0px_rgba(22,55,71,1)]">Export All</Button>
            <Button variant="secondary" className="bg-hum-coral text-white border-2 border-hum-navy shadow-[6px_6px_0px_0px_rgba(22,55,71,1)]">Schedule Month <Calendar className="ml-2 w-5 h-5" /></Button>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-10">
          {/* Sidebar List */}
          <div className="md:col-span-4 space-y-4">
            {posts.map((post, i) => (
              <button
                key={i}
                onClick={() => setActivePost(i)}
                className={`w-full text-left p-6 rounded-3xl border-2 border-hum-navy transition-all shadow-[6px_6px_0px_0px_rgba(22,55,71,1)] ${
                  activePost === i ? 'bg-hum-yellow -translate-y-1' : 'bg-white hover:bg-hum-cream'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black uppercase tracking-widest text-[10px] text-hum-navy/60">{post.platform}</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-hum-navy/20 ${post.status === 'Ready' ? 'bg-hum-teal text-white' : 'bg-hum-coral text-white'}`}>
                    {post.status}
                  </span>
                </div>
                <p className="font-bold text-hum-navy line-clamp-2 text-sm">{post.caption}</p>
              </button>
            ))}
          </div>

          {/* Preview Area */}
          <div className="md:col-span-8">
            <Card className="bg-white border-4 border-hum-navy shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] rounded-[3rem] p-12 h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-hum-navy rounded-full flex items-center justify-center">
                  <Logo iconOnly className="invert scale-50" />
                </div>
                <div>
                  <div className="font-black uppercase tracking-tight text-hum-navy">SocialHum Agency</div>
                  <div className="text-xs font-mono font-bold text-hum-navy/40 uppercase tracking-widest">Sponsored • {posts[activePost].platform}</div>
                </div>
              </div>
              
              <p className="text-xl font-medium text-hum-navy mb-8 leading-relaxed">
                {posts[activePost].caption}
              </p>
              
              <div className="rounded-[2rem] overflow-hidden border-2 border-hum-navy shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] mb-8">
                <img 
                  src={posts[activePost].image} 
                  alt="Post preview" 
                  className="w-full h-[400px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-hum-navy/40">
                    <MessageSquare className="w-4 h-4" /> 12
                  </div>
                  <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-hum-navy/40">
                    <Zap className="w-4 h-4" /> 48
                  </div>
                </div>
                <div className="flex gap-4">
                  <button className="font-black uppercase text-xs tracking-widest text-hum-coral hover:underline">Edit Caption</button>
                  <button className="font-black uppercase text-xs tracking-widest text-hum-teal hover:underline">Swap Image</button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Error Boundary ---

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, errorInfo: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.errorInfo);
        if (parsed.error) displayMessage = `Firestore Error: ${parsed.error}`;
      } catch (e) {
        displayMessage = this.state.errorInfo;
      }

      return (
        <div className="min-h-screen bg-hum-cream flex items-center justify-center p-6">
          <div className="bg-white border-4 border-hum-navy p-10 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(22,55,71,1)] max-w-lg w-full">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-hum-coral mb-4">System Error</h2>
            <p className="text-hum-navy font-bold mb-6">{displayMessage}</p>
            <Button onClick={() => window.location.reload()} variant="primary" className="w-full">
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Main App ---

export default function App() {
  const [view, setView] = useState<Step>('landing');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('package-selection');
  const [strategyData, setStrategyData] = useState(null);
  const [pendingUserData, setPendingUserData] = useState<any>(null);
  const [user, setUser] = useState<any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock auth initialization
    setIsAuthReady(true);
  }, []);

  const login = async () => {
    // Mock login
    const mockUser = {
      uid: 'mock-user-id',
      email: 'demo@example.com',
      displayName: 'Demo User'
    };
    setUser(mockUser);
    return mockUser;
  };

  const signIn = async (email: string) => {
    // Mock sign in
    const mockUser = {
      uid: 'mock-user-id',
      email: email,
      displayName: 'Demo User'
    };
    setUser(mockUser);
  };

  const signUp = async (data: { firstName: string, lastName: string, email: string, phone: string, companyName: string }) => {
    try {
      // Mock user creation
      const mockUser = {
        uid: 'mock-user-id-' + Date.now(),
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`
      };
      
      setUser(mockUser);

      // Sync with HubSpot
      try {
        await fetch('/api/hubspot/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            businessName: data.companyName,
          }),
        });
      } catch (hsError) {
        console.error("HubSpot sync failed:", hsError);
      }

      // Sync with n8n
      try {
        await fetch('https://atd-test.app.n8n.cloud/webhook/f47de6fe-9fa9-4045-a07d-7379aa98eab8', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'account_created',
            ...data,
            timestamp: new Date().toISOString()
          }),
        });
      } catch (n8nError) {
        console.error("n8n sync failed:", n8nError);
      }

      setPendingUserData(data);
      setOnboardingStep('welcome');
    } catch (error: any) {
      console.error("Sign up failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setView('landing');
    setOnboardingStep('package-selection');
    setPendingUserData(null);
    setStrategyData(null);
  };

  const startFlow = () => setView('onboarding');
  
  const handlePackageSelect = (plan: string) => {
    setSelectedPackage(plan);
    setOnboardingStep('account-creation');
  };

  const handleAccountCreated = async (data: any) => {
    await signUp(data);
  };

  const handleStartStrategy = () => {
    setOnboardingStep('strategy-intro');
  };

  const handleBeginStrategy = () => {
    setOnboardingStep('strategy-builder');
  };

  const completeQuestionnaire = async (data: any) => {
    setStrategyData(data);
    
    // Sync with n8n
    try {
      await fetch('https://atd-test.app.n8n.cloud/webhook/f47de6fe-9fa9-4045-a07d-7379aa98eab8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'strategy_completed',
          user: {
            email: user?.email,
            displayName: user?.displayName,
            ...pendingUserData
          },
          strategyData: data,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (n8nError) {
      console.error("n8n strategy sync failed:", n8nError);
    }
    
    if (user) {
      try {
        // Mock saving strategy
        console.log("Mock saving strategy for user:", user.uid, data);
        setView('strategy');
      } catch (error) {
        console.error("Failed to save strategy:", error);
      }
    } else {
      setView('strategy');
    }
    
    setView('thankyou');
  };
  const goToInput = () => {
    setView('onboarding');
    setOnboardingStep('strategy-builder');
  };
  const goToContent = () => setView('content');

  const downloadCard = async () => {
    if (cardRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        backgroundColor: 'transparent',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      const link = document.createElement('a');
      link.download = 'content-engine-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Oops, something went wrong!', err);
    }
  };

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage onStart={startFlow} onHowItWorks={() => setView('how-it-works')} onAbout={() => setView('about')} />
            {user && (
              <button 
                onClick={logout}
                className="fixed top-4 right-4 bg-white border-2 border-hum-navy px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(22,55,71,1)] z-50"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            )}
            <button 
              onClick={() => setView('export')}
              className="fixed bottom-4 right-4 bg-hum-navy text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity z-50"
            >
              Export Card
            </button>
          </motion.div>
        )}
        
        {view === 'export' && (
          <motion.div key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="min-h-screen bg-hum-cream/50 flex flex-col items-center justify-center p-20">
              <div className="mb-12 flex gap-4">
                <button 
                  onClick={downloadCard}
                  className="bg-hum-teal text-white px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(13,56,71,1)] hover:translate-y-[-2px] transition-all"
                >
                  Download PNG (1000px)
                </button>
                <button 
                  onClick={() => setView('landing')}
                  className="bg-hum-navy text-white px-8 py-4 rounded-full font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-all"
                >
                  Close
                </button>
              </div>
              
              <div className="p-10 bg-transparent">
                <div ref={cardRef} className="w-[1000px]">
                  <ContentEngineCard />
                </div>
              </div>

              <div className="mt-8 text-hum-navy/40 font-mono text-xs uppercase tracking-widest">
                Transparent background • 1000px width
              </div>
            </div>
          </motion.div>
        )}
        
        {view === 'onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {onboardingStep === 'package-selection' && (
              <PackageSelection onSelect={handlePackageSelect} onBack={() => setView('landing')} />
            )}
            {onboardingStep === 'account-creation' && (
              <AccountCreation 
                onContinue={handleAccountCreated} 
                onLogin={signIn}
                onBack={() => setView('landing')} 
              />
            )}
            {onboardingStep === 'welcome' && (
              <WelcomeScreen onStart={handleStartStrategy} onBack={() => setView('landing')} />
            )}
            {onboardingStep === 'strategy-intro' && (
              <StrategyIntro onBegin={handleBeginStrategy} onBack={() => setView('landing')} />
            )}
            {onboardingStep === 'strategy-builder' && (
              <Questionnaire 
                onComplete={completeQuestionnaire} 
                onBack={() => setView('landing')} 
                initialData={pendingUserData}
              />
            )}
          </motion.div>
        )}

        {view === 'how-it-works' && (
          <motion.div key="how-it-works" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HowItWorks onStart={startFlow} onBack={() => setView('landing')} onAbout={() => setView('about')} />
          </motion.div>
        )}

        {view === 'about' && (
          <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AboutPage onStart={startFlow} onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'thankyou' && (
          <motion.div key="thankyou" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ThankYouPage onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'strategy' && (
          <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StrategyDashboard data={strategyData} onNext={goToContent} onBack={() => setView('landing')} />
          </motion.div>
        )}

        {view === 'content' && (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ContentReview onBack={() => setView('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
