'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(error);
        if (window.opener) {
          window.opener.postMessage({ type: 'oauth_error', message: error }, '*');
        }
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No code');
        return;
      }

      const savedState = localStorage.getItem('wallet_oauth_state');
      if (state !== savedState) {
        setStatus('error');
        setMessage(`State mismatch: got=${state} saved=${savedState}`);
        return;
      }

      try {
        const codeVerifier = localStorage.getItem('wallet_code_verifier');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.reklam.biz/api';

        const response = await fetch(`${API_URL}/auth/wallet/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            redirect_uri: `${window.location.origin}/auth/wallet/callback`,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status === 'error') {
          throw new Error(data.message || 'Auth failed');
        }

        localStorage.removeItem('wallet_oauth_state');
        localStorage.removeItem('wallet_code_verifier');

        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          setStatus('success');

          if (window.opener) {
            window.opener.postMessage({ type: 'oauth_success' }, '*');
            setTimeout(() => window.close(), 1000);
          } else {
            window.location.href = '/advertiser';
          }
        } else {
          throw new Error('No token');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Failed');
        // Don't close popup - show error instead
      }
    };

    handleCallback();
  }, [searchParams]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        {status === 'loading' && <p>Loading...</p>}
        {status === 'success' && <p style={{ color: 'green' }}>Success! Redirecting...</p>}
        {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    </div>
  );
}

export default function WalletCallbackPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
}
