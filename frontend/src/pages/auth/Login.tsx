import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({ mobileOrEmail: '', password: '' });
  const [showPw, setShowPw] = useState(false);
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

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.mobileOrEmail || !formData.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setStep('otp');
      startCountdown();
      setTimeout(() => alert(`📱 [NEPSE Pro SMS Simulation]\nOTP sent to: ${formData.mobileOrEmail}\nYour OTP: ${newOtp}\nExpires in 60 seconds.`), 300);
    }, 900);
  };

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
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
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) { setError('Please enter the 6-digit OTP.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (entered === generatedOtp) {
        localStorage.setItem('token', 'jwt-demo-token');
        localStorage.setItem('user', JSON.stringify({ name: 'John Doe', email: formData.mobileOrEmail }));
        navigate('/dashboard');
      } else {
        setError('Incorrect OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    }, 700);
  };

  const resendOtp = () => {
    if (countdown > 0) return;
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtp(['', '', '', '', '', '']);
    startCountdown();
    setTimeout(() => alert(`📱 [NEPSE Pro SMS]\nNew OTP: ${newOtp}`), 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Background orbs */}
      <div className="orb w-96 h-96 top-0 right-0 opacity-20" style={{ background: 'var(--color-blue)' }} />
      <div className="orb w-80 h-80 bottom-0 left-0 opacity-10" style={{ background: 'var(--color-green)' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fadeUp">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(41,98,255,.15)', border: '1px solid rgba(41,98,255,.3)' }}>
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--color-blue)' }} />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-wide">NEPSE Pro</div>
              <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'var(--color-muted)' }}>Trading Terminal</div>
            </div>
          </div>
        </div>

        <div className="card glow-blue animate-fadeUp delay-100">
          <div className="p-7">
            {step === 'credentials' ? (
              <>
                <h1 className="text-xl font-bold text-white mb-1">Sign In</h1>
                <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Access your NEPSE trading dashboard</p>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn"
                    style={{ background: 'rgba(242,54,69,.1)', border: '1px solid rgba(242,54,69,.3)', color: 'var(--color-red)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                      Email or Mobile
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                      <input
                        type="text"
                        className="input icon-left"
                        placeholder="you@example.com or 98XXXXXXXX"
                        value={formData.mobileOrEmail}
                        onChange={e => setFormData({ ...formData, mobileOrEmail: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-muted)' }} />
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="input icon-left pr-10"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'var(--color-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-1.5">
                      <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: 'var(--color-blue)' }}>Forgot password?</Link>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn btn-primary w-full py-2.5 mt-2"
                    style={{ fontSize: '.875rem' }}>
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
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
                    <h1 className="text-xl font-bold text-white leading-none">Verify OTP</h1>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Sent to <span className="font-semibold text-white">{formData.mobileOrEmail}</span></p>
                  </div>
                </div>

                <div className="p-3 rounded-lg mb-5 text-center text-sm"
                  style={{ background: 'rgba(8,153,129,.08)', border: '1px solid rgba(8,153,129,.2)', color: 'var(--color-green)' }}>
                  ✓ OTP sent! Check the popup alert for your code.
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg text-sm font-medium animate-fadeIn"
                    style={{ background: 'rgba(242,54,69,.1)', border: '1px solid rgba(242,54,69,.3)', color: 'var(--color-red)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify}>
                  <label className="block mb-3 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--color-muted)' }}>Enter 6-digit OTP</label>
                  <div className="flex justify-center gap-2 mb-3" onPaste={handleOtpPaste}>
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        className={`otp-box ${d ? 'filled' : ''}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKey(i, e)}
                      />
                    ))}
                  </div>
                  <div className="text-center mb-5">
                    {countdown > 0 ? (
                      <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        Resend in <span className="font-semibold" style={{ color: 'var(--color-blue)' }}>{countdown}s</span>
                      </span>
                    ) : (
                      <button type="button" onClick={resendOtp}
                        className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5">
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </span>
                    ) : 'Verify & Sign In'}
                  </button>
                  <button type="button" onClick={() => { setStep('credentials'); setError(''); setOtp(['','','','','','']); }}
                    className="btn btn-ghost w-full py-2.5 mt-2 text-sm">← Back</button>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-muted)' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--color-blue)' }}>Create one</Link>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs mt-4 animate-fadeUp delay-300" style={{ color: 'var(--color-dimmed)' }}>
          Demo: use any email/password → enter OTP from popup alert
        </p>
      </div>
    </div>
  );
};

export default Login;
