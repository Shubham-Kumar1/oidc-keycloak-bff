'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function MFAPage() {
  const [step, setStep] = useState<'info' | 'setup' | 'verify'>('info');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSetup = () => {
    // In production, this would call Keycloak API to generate TOTP secret
    // For demo, we'll simulate it
    const mockSecret = 'JBSWY3DPEHPK3PXP';
    const mockQR = `otpauth://totp/OIDC%20Demo:user@example.com?secret=${mockSecret}&issuer=OIDC%20Demo`;
    
    setSecret(mockSecret);
    setQrCode(mockQR);
    setStep('setup');
  };

  const handleVerify = () => {
    // In production, this would verify with Keycloak
    if (code.length === 6) {
      setVerified(true);
      setStep('verify');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">🔐 Multi-Factor Authentication</h1>
        <p className="text-slate-300 mt-2">Set up TOTP (Time-based One-Time Password) for enhanced security</p>
      </div>

      {step === 'info' && (
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">MFA Overview</h2>
            <p className="text-slate-300 text-sm">
              Multi-factor authentication adds an extra layer of security to your account. 
              After enabling MFA, you'll need both your password and a code from your authenticator app to log in.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• Use authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator</p>
              <p>• Generate time-based codes that change every 30 seconds</p>
              <p>• Required for sensitive operations (step-up authentication)</p>
            </div>
            <button onClick={handleSetup} className="btn btn-primary">
              Set Up MFA
            </button>
          </div>
        </div>
      )}

      {step === 'setup' && secret && (
        <div className="card">
          <div className="card-body space-y-6">
            <h2 className="font-semibold text-slate-100">Step 1: Scan QR Code</h2>
            <p className="text-slate-300 text-sm">
              Open your authenticator app and scan this QR code:
            </p>
            <div className="flex justify-center p-6 bg-white rounded">
              <div className="text-slate-800 text-center">
                <div className="text-4xl mb-2">📱</div>
                <p className="text-sm">QR Code Placeholder</p>
                <p className="text-xs text-slate-500 mt-2">In production, this would show a real QR code</p>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-300 text-sm mb-2">Or enter this secret manually:</p>
              <div className="bg-slate-950 p-3 rounded border border-slate-700">
                <code className="text-slate-200 font-mono text-sm">{secret}</code>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <h3 className="font-semibold text-slate-100 mb-2">Step 2: Verify Setup</h3>
              <p className="text-slate-300 text-sm mb-3">
                Enter the 6-digit code from your authenticator app:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-slate-200 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                <button
                  onClick={handleVerify}
                  disabled={code.length !== 6}
                  className="btn btn-primary"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'verify' && verified && (
        <div className="card border-green-500/30 bg-green-500/5">
          <div className="card-body space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <h2 className="font-semibold text-green-400">MFA Successfully Enabled!</h2>
                <p className="text-slate-300 text-sm">
                  Your account is now protected with multi-factor authentication.
                </p>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-300 text-sm">
                💡 In production, this would integrate with Keycloak's TOTP API. 
                You can manage MFA settings in the Keycloak Account Console.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="card-body">
          <p className="text-blue-300 text-sm">
            <strong>💡 Note:</strong> To enable real MFA in Keycloak: 
            Authentication → Required Actions → Enable "Configure OTP". 
            Users will be prompted to set up TOTP on first login or can configure it in the Account Console.
          </p>
        </div>
      </div>
    </div>
  );
}

