import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startCountdown = (secs = 60) => {
    setCountdown(secs);
    const t = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleDetails = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep('otp'); startCountdown();
      setTimeout(() => alert(`📱 [NEPSE Pro SMS Simulation]\nOTP sent to: +977 ${formData.mobile}\nYour OTP: ${newOtp}\nExpires in 60 seconds.`), 300);
    }, 900);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter the 6-digit OTP.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (entered === generatedOtp) {
        localStorage.setItem('token', 'jwt-demo-token');
        localStorage.setItem('user', JSON.stringify({ name: formData.fullName, email: formData.email }));
        navigate('/dashboard');
      } else {
        setError(`Incorrect OTP. Hint: ${generatedOtp}`);
        setOtp(['','','','','','']); otpRefs.current[0]?.focus();
      }
    }, 700);
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp); setOtp(['','','','','','']); startCountdown();
    setTimeout(() => alert(`📱 New OTP: ${newOtp}`), 200);
  };

  const field = (
    label: string,
    name: keyof typeof formData,
    type: string,
    placeholder: string,
    Icon: React.ElementType,
    extra?: React.ReactNode
  ) => (
    <div>
      <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
        <input
          type={type}
          name={name}
          className="input icon-left"
          placeholder={placeholder}
          value={formData[name]}
          onChange={e => setFormData({ ...formData, [name]: e.target.value })}
          required
        />
        {extra}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-10 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <div className="orb w-80 h-80 top-0 left-0 opacity-15" style={{ background: 'var(--color-green)' }} />
      <div className="orb w-96 h-96 bottom-0 right-0 opacity-10" style={{ background: 'var(--color-blue)' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex justify-center mb-8 animate-fadeUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(8,153,129,.15)', border: '1px solid rgba(8,153,129,.3)' }}>
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-wide">NEPSE Pro</div>
              <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'var(--color-muted)' }}>Trading Terminal</div>
            </div>
          </div>
        </div>

        <div className="card glow-green animate-fadeUp delay-100">
          <div className="p-7">
            {step === 'details' ? (
              <>
                <h1 className="text-xl font-bold text-white mb-1">Create Account</h1>
                <p className="text-sm mb-5" style={{ color: 'var(--color-muted)' }}>Join Nepal's premier stock trading platform</p>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn"
                    style={{ background: 'rgba(242,54,69,.1)', border: '1px solid rgba(242,54,69,.3)', color: 'var(--color-red)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleDetails} className="space-y-4">
                  {field('Full Name', 'fullName', 'text', 'Hari Prasad Sharma', User)}
                  {field('Email Address', 'email', 'email', 'hari@example.com', Mail)}

                  {/* Mobile with country code */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 rounded-lg border text-sm font-semibold"
                        style={{ background: 'var(--color-panel)', border: '1px solid var(--color-border)', color: 'var(--color-text)', minWidth: '72px' }}>
                        🇳🇵 +977
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                        <input type="tel" name="mobile" className="input icon-left w-full" placeholder="98XXXXXXXX"
                          value={formData.mobile} maxLength={10} pattern="[0-9]{10}"
                          onChange={e => setFormData({ ...formData, mobile: e.target.value })} required />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                      <input type={showPw ? 'text' : 'password'} className="input icon-left pr-10" placeholder="Min 6 characters"
                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                      <input type={showCPw ? 'text' : 'password'} className="input icon-left pr-10" placeholder="Repeat password"
                        value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                      <button type="button" onClick={() => setShowCPw(!showCPw)}
                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                        {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-green w-full py-2.5 mt-2">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">Send OTP via SMS <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(8,153,129,.15)', border: '1px solid rgba(8,153,129,.3)' }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-green)' }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white leading-none">Verify Mobile</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                      OTP sent to <span className="font-semibold text-white">+977 {formData.mobile}</span>
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-lg mb-5 text-center text-sm"
                  style={{ background: 'rgba(8,153,129,.08)', border: '1px solid rgba(8,153,129,.2)', color: 'var(--color-green)' }}>
                  ✓ OTP sent! Check the browser popup for your code.
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn"
                    style={{ background: 'rgba(242,54,69,.1)', border: '1px solid rgba(242,54,69,.3)', color: 'var(--color-red)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify}>
                  <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--color-muted)' }}>
                    Enter 6-digit OTP
                  </label>
                  <div className="flex justify-center gap-2 mb-3" onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input key={i} ref={el => { otpRefs.current[i] = el; }}
                        className={`otp-box ${d ? 'filled' : ''}`}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)} />
                    ))}
                  </div>

                  {/* Countdown bar */}
                  {countdown > 0 && (
                    <div className="mb-4">
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                        <div className="h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(countdown / 60) * 100}%`, background: countdown > 20 ? 'var(--color-green)' : 'var(--color-red)' }} />
                      </div>
                      <p className="text-xs text-center mt-1" style={{ color: 'var(--color-muted)' }}>
                        Expires in <span className="font-bold" style={{ color: countdown > 20 ? 'var(--color-green)' : 'var(--color-red)' }}>{countdown}s</span>
                      </p>
                    </div>
                  )}
                  {countdown === 0 && (
                    <p className="text-xs text-center mb-4">
                      <button type="button" onClick={resendOtp} className="font-semibold hover:underline"
                        style={{ color: 'var(--color-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Resend OTP
                      </button>
                    </p>
                  )}

                  <button type="submit" disabled={loading} className="btn btn-green w-full py-2.5">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Verify & Create Account</span>}
                  </button>
                  <button type="button" onClick={() => { setStep('details'); setError(''); setOtp(['','','','','','']); }}
                    className="btn btn-ghost w-full py-2.5 mt-2 text-sm">← Edit Details</button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-green)' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
