'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useRegister, useSendOtp, useVerifyOtp, checkEmailExists } from '@/services/authApi';
import { Check, ArrowRight, Shield, User, Mail, Lock, Eye, EyeOff, ChevronDown, Headphones } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  targetExamYear: z.coerce.number().min(2024, 'Please select a valid year'),
  stream: z.enum(['PCM', 'PCB']),
  targetMarks: z.coerce.number().min(0, 'Marks must be at least 0').max(200, 'Marks cannot exceed 200'),
  targetCollege: z.string().optional(),
  referralCode: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const steps = [
  { id: 1, title: 'Account Details', description: 'Enter your basic details to get started.' },
  { id: 2, title: 'Verify Email', description: 'Enter the verification code sent to your email.' },
  { id: 3, title: 'Exam Goal', description: 'Help us personalize your study plan.' },
  { id: 4, title: 'College Goal', description: 'Which college are you aiming for?' },
  { id: 5, title: 'Referral', description: 'Enter it below to get exclusive benefits.' },
];

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegister();
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const { register, handleSubmit, trigger, watch, setError, clearErrors, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    mode: 'onChange',
    defaultValues: {
      targetExamYear: new Date().getFullYear(),
      stream: 'PCM',
      targetMarks: 150,
      termsAccepted: false
    }
  });

  const formData = watch();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setFormError('');
    setFormSuccess('');
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setFormError('Please enter a 6-digit code');
      return;
    }
    verifyOtpMutation.mutate({ email: formData.email, otp: otpValue }, {
      onSuccess: () => {
        setVerifiedEmail(formData.email);
        setCurrentStep(3);
        setFormSuccess('Email verified successfully!');
      },
      onError: (err: any) => setFormError(err.response?.data?.message || 'Verification failed')
    });
  };

  const handleResendOtp = () => {
    setFormError('');
    setFormSuccess('');
    if (timer > 0) return;
    sendOtpMutation.mutate(formData.email, {
      onSuccess: () => {
        setTimer(60);
        setIsTimerActive(true);
        setOtp(['', '', '', '', '', '']);
        setFormSuccess('OTP sent successfully!');
      },
      onError: (err: any) => setFormError(err.response?.data?.message || 'Failed to send OTP')
    });
  };

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone', 'password', 'confirmPassword'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['targetExamYear', 'stream', 'targetMarks'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['targetCollege'];
    } else if (currentStep === 5) {
      fieldsToValidate = ['referralCode'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 1) {
        const email = formData.email;
        if (email) {
          const exists = await checkEmailExists(email);
          if (exists) {
            setError('email', { type: 'manual', message: 'Email already exists' });
            return;
          }
        }
        
        if (email === verifiedEmail) {
          setCurrentStep(3);
          return;
        }

        sendOtpMutation.mutate(formData.email, {
          onSuccess: () => {
            setCurrentStep(2);
            setTimer(60);
            setIsTimerActive(true);
            setFormSuccess('OTP sent successfully!');
          },
          onError: (err: any) => setFormError(err.response?.data?.message || 'Failed to send OTP')
        });
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: RegisterFormData) => {
    setFormError('');
    setFormSuccess('');
    registerMutation.mutate(data, {
      onError: (err: any) => setFormError(err.response?.data?.message || 'Registration failed')
    });
  };

  let isCurrentStepFilled = true;
  if (currentStep === 1) {
    isCurrentStepFilled = !!formData.fullName && !!formData.email && !!formData.phone && !!formData.password && !!formData.confirmPassword;
  } else if (currentStep === 3) {
    isCurrentStepFilled = !!formData.targetExamYear && !!formData.stream && !!formData.targetMarks;
  }

  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <div className="flex-1 flex flex-col xl:flex-none xl:w-[600px] 2xl:w-[700px] px-8 sm:px-16 lg:px-20 pt-8 pb-4">
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#11c880] flex items-center justify-center transform -rotate-12 shadow-sm">
              <div className="w-4 h-4 rounded bg-white"></div>
            </div>
            <span className="font-bold text-[22px] text-foreground tracking-tight">Acadify</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Headphones className="w-5 h-5 text-muted-foreground" />
            <span>Need help? <Link href="/support" className="text-emerald-500 hover:text-emerald-600">Contact Support</Link></span>
          </div>
        </header>

        <div className="w-full max-w-md mx-auto xl:mx-0 flex-1 flex flex-col justify-center">
          <div className="mb-5">
            <div className="text-emerald-500 font-bold mb-1 text-[10px] tracking-wider uppercase">Step {currentStep} of {steps.length}</div>
            {currentStep !== 2 && (
              <>
                <h2 className="text-2xl font-semibold font-sans text-foreground tracking-tight mb-0.5">
                  {currentStep === 1 ? 'Create Your Account' : steps[currentStep - 1].title}
                </h2>
                <p className="text-muted-foreground text-xs font-medium">
                  {currentStep === 1 ? "Let's get started with your details." : steps[currentStep - 1].description}
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            
            {(formError || formSuccess) && (
              <div className="mb-4">
                <Alert type={formError ? 'error' : 'success'} message={formError || formSuccess} />
              </div>
            )}
            
            {/* STEP 1: ACCOUNT */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Enter your full name"
                    icon={<User className="w-4 h-4" />}
                    {...register('fullName')}
                    error={errors.fullName?.message}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    icon={<Mail className="w-4 h-4" />}
                    {...register('email')}
                    onBlur={async (e) => {
                      register('email').onBlur(e);
                      const email = e.target.value;
                      // Only check if it's a somewhat valid email to avoid unnecessary requests
                      if (email && email.includes('@') && email.includes('.')) {
                        const exists = await checkEmailExists(email);
                        if (exists) {
                          setError('email', { type: 'manual', message: 'Email already exists' });
                        } else {
                          clearErrors('email');
                        }
                      }
                    }}
                    error={errors.email?.message}
                  />
                  
                  <div className="w-full flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-foreground">Mobile Number</label>
                    <div className={`relative flex items-center border rounded-xl bg-white overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-slate-900 ${errors.phone ? 'border-red-500 focus-within:ring-red-500' : 'border-border'}`}>
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-muted/50 border-r border-border text-sm font-medium text-muted-foreground shrink-0">
                        <span role="img" aria-label="India Flag">🇮🇳</span>
                        <span>+91</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
                      </div>
                      <input
                        type="tel"
                        placeholder="Enter your mobile number"
                        className="w-full px-4 py-2.5 text-sm focus:outline-none bg-transparent"
                        {...register('phone')}
                      />
                    </div>
                    {errors.phone && <span className="text-xs font-medium text-destructive mt-0.5">{errors.phone.message}</span>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-muted-foreground focus:outline-none">
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      }
                      {...register('password')}
                      error={errors.password?.message}
                    />

                    <Input
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      icon={<Lock className="w-4 h-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="hover:text-muted-foreground focus:outline-none">
                          {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      }
                      {...register('confirmPassword')}
                      error={errors.confirmPassword?.message}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFY EMAIL */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 bg-emerald-50 text-emerald-500 rounded-2xl mb-6">
                      <Mail className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-semibold font-sans text-foreground tracking-tight mb-2">Please check your email</h3>
                    <p className="text-sm font-medium text-muted-foreground">
                      We've sent a code to <span className="font-semibold text-foreground">{formData.email || 'student@example.com'}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-2 sm:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-medium text-slate-700 border-2 border-border rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="button" 
                      onClick={handleVerifyOtp}
                      fullWidth 
                      className="!bg-emerald-500 hover:!bg-emerald-600 text-white py-3 !rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent"
                      isLoading={verifyOtpMutation.isPending}
                    >
                      Verify
                    </Button>
                  </div>

                  <div className="pt-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      Didn&apos;t receive the code?{' '}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={timer > 0}
                        className={`font-semibold transition-colors ${timer > 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-emerald-500 hover:text-emerald-600'}`}
                      >
                        Resend OTP {timer > 0 && `(${timer}s)`}
                      </button>
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-muted-foreground hover:text-emerald-500 transition-colors"
                    >
                      Change email
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: EXAM GOAL */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Target Exam Year"
                    type="number"
                    placeholder="2025"
                    {...register('targetExamYear')}
                    error={errors.targetExamYear?.message}
                  />
                  <Input
                    label="Target Marks (out of 200)"
                    type="number"
                    placeholder="150"
                    {...register('targetMarks')}
                    error={errors.targetMarks?.message}
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Stream</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${formData.stream === 'PCM' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 font-bold shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                      <input type="radio" value="PCM" {...register('stream')} className="hidden" />
                      PCM
                    </label>
                    <label className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all ${formData.stream === 'PCB' ? 'bg-emerald-50 border-emerald-500 text-emerald-600 font-bold shadow-sm' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                      <input type="radio" value="PCB" {...register('stream')} className="hidden" />
                      PCB
                    </label>
                  </div>
                  {errors.stream && <p className="text-sm text-destructive mt-1">{errors.stream.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: COLLEGE GOAL */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <Input
                  label="Target College"
                  type="text"
                  placeholder="e.g. COEP Pune, VJTI Mumbai"
                  {...register('targetCollege')}
                  error={errors.targetCollege?.message}
                />
              </div>
            )}

            {/* STEP 5: REFERRAL */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <Input
                  label="Referral / Coupon Code (Optional)"
                  type="text"
                  placeholder="ENTER CODE"
                  className="uppercase"
                  {...register('referralCode')}
                  error={errors.referralCode?.message}
                />

                <div className="flex items-start gap-3 bg-emerald-50 p-5 rounded-xl border border-emerald-100">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="terms"
                      type="checkbox"
                      {...register('termsAccepted')}
                      className="w-4 h-4 text-emerald-500 border-border rounded focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the <Link href="/terms" className="font-semibold text-emerald-500 hover:text-emerald-600">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-emerald-500 hover:text-emerald-600">Privacy Policy</Link>.
                  </label>
                </div>
                {errors.termsAccepted && <p className="text-xs text-destructive mt-2">{errors.termsAccepted.message}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            {currentStep !== 2 && (
              <div className="flex gap-3 pt-3">
                {currentStep > 1 && (
                  <Button type="button" variant="secondary" onClick={handleBack} className="flex-1 py-3 rounded-xl text-sm font-semibold" disabled={registerMutation.isPending}>
                    Back
                  </Button>
                )}
                
                {currentStep < 5 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={(currentStep === 1 && !!errors.email) || !isCurrentStepFilled}
                    className="flex-1 !bg-emerald-500 hover:!bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="flex-1 !bg-emerald-500 hover:!bg-emerald-600 text-white py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    isLoading={registerMutation.isPending}
                    disabled={!formData.termsAccepted}
                  >
                    Create Account
                  </Button>
                )}
              </div>
            )}
          </form>

          <div className="mt-4 text-center text-xs font-medium text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Illustration & Social Proof */}
      <div className="hidden xl:flex flex-1 relative bg-gradient-to-br from-[#f8f5ff] via-[#fdf7ff] to-[#fff5f5] overflow-hidden items-center justify-center p-12">
        {/* Background glow effects */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-200/40 blur-[80px] mix-blend-multiply" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-warning-light/50 blur-[80px] mix-blend-multiply" />
        
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="Avatar 1" />
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="Avatar 2" />
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="Avatar 3" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground"><span className="text-primary font-bold">25,000+</span> Aspirants Trust Us</span>
          </div>

          <h2 className="text-lg font-semibold font-sans text-foreground tracking-tight text-center leading-tight mb-4">
            "Top MHT-CET rankers <br/> started just like you."
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-sm">
            Practice smarter, analyze deeper and achieve your dream college.
          </p>

          {/* Abstract UI Component */}
          <div className="relative w-full max-w-lg mb-16">
            {/* Floating Tags */}
            <div className="absolute -left-12 top-10 bg-[#f43f5e] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[-12deg] shadow-lg">#Practice</div>
            <div className="absolute -right-4 -top-4 bg-[#d946ef] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[10deg] shadow-lg">#Excel</div>
            <div className="absolute -left-16 bottom-20 bg-[#0ea5e9] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[-5deg] shadow-lg">#Analyze</div>
            <div className="absolute left-4 -bottom-6 bg-[#10b981] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[4deg] shadow-lg">#Achieve</div>

            {/* Quiz Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white p-6 pb-12 w-full max-w-md mx-auto">
              <div className="text-xs font-bold text-foreground mb-2">Physics</div>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                A ball is thrown vertically upwards with a velocity of u.<br/>
                The time taken to reach the maximum height is:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-white">
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold">A</div>
                  <span className="text-xs text-muted-foreground">u / g</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-green-200 bg-success-light/50 relative">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">B</div>
                  <span className="text-xs text-muted-foreground font-medium">2u / g</span>
                  <div className="absolute right-3 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-white">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">C</div>
                  <span className="text-xs text-muted-foreground">u / 2g</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-pink-200 bg-pink-50/50">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">D</div>
                  <span className="text-xs text-muted-foreground font-medium">g / u</span>
                </div>
              </div>
            </div>

            {/* Performance Card Overlay */}
            <div className="absolute -right-16 bottom-[-20px] bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-border p-5 w-48 z-20">
              <div className="text-[10px] font-bold text-foreground mb-3 text-center">Your Performance</div>
              
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full text-success transform -rotate-90">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-success"
                    strokeDasharray="72, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-foreground">72%</span>
                  <span className="text-[8px] text-muted-foreground uppercase">Score</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-bold text-muted-foreground">72%</span>
              </div>
              <div className="flex justify-between items-center text-[10px] mb-4">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-bold text-muted-foreground">36 / 50</span>
              </div>
              
              <button className="w-full bg-[#10b981] text-white text-[10px] font-bold py-2 rounded-lg shadow-sm hover:bg-[#059669] transition-colors">
                View Analysis
              </button>
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}
