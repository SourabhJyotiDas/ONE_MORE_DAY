import React from 'react';
import { useHabits } from '../context/HabitContext';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LoginScreen: React.FC = () => {
  const { login, loginAsGuest, loading, error: contextError } = useHabits();
  const [localError, setLocalError] = React.useState<string | null>(null);

  const error = localError || contextError;

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalError(null);
      try {
        // console.log('Google login success, fetching user info...');
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );

        const { sub, name, email, picture } = userInfo.data;
        // console.log('User info received:', { sub, name, email });
        
        await login({
          id: sub,
          name,
          email,
          picture
        });
      } catch (error: any) {
        console.error('Google login processing failed:', error);
        setLocalError(error.response?.data?.message || error.message || 'Failed to process Google login');
      }
    },
    onError: () => {
      console.error('Login Failed');
      setLocalError('Google login failed. Please try again.');
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-2xl shadow-primary/20 rotate-12">
          <span className="text-primary-foreground font-black text-3xl sm:text-4xl">1</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tighter mb-4">
          ONE MORE DAY
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-8 sm:mb-12 max-w-[280px] mx-auto">
          Track your progress, break bad habits, and master your life.
        </p>

        <div className="space-y-4">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl font-medium">
              {error}
            </div>
          )}

          <button
            onClick={() => handleGoogleLogin()}
            disabled={loading}
            className="w-full bg-foreground text-background py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            )}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button
            onClick={() => loginAsGuest()}
            className="w-full bg-secondary text-secondary-foreground py-3.5 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all cursor-pointer"
          >
            Continue as Guest
          </button>
          
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Securely login or try guest mode
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;
