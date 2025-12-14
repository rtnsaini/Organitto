import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, User, Phone, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FloatingLeaves, PremiumButton } from '../components/ui';

export default function Register() {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      if (loading) {
        setLoading(false);
      }
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, isFirstUser ? 2000 : 0);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, loading, isFirstUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error('Failed to check existing users');
      }

      const isFirst = count === 0;
      const finalRole = isFirst ? 'admin' : 'partner';

      if (isFirst) {
        setIsFirstUser(true);
      }

      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        finalRole
      );

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account. Please try again.');
        setLoading(false);
        setIsFirstUser(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
      setIsFirstUser(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isFirstUser) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(27, 77, 62, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), #F5F1E8'
        }}
      >
        <FloatingLeaves />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-primary opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-gold opacity-5 blur-3xl"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="glass-card p-10 text-center animate-scale-in">
            <div className="flex items-center justify-center mb-8 animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-gold blur-2xl opacity-40 rounded-full"></div>
                <div className="relative bg-gradient-to-br from-sage to-primary p-6 rounded-full shadow-glow">
                  <CheckCircle className="w-12 h-12 text-cream" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h1 className="font-heading text-4xl font-bold text-gradient mb-4">
              Welcome, Founder!
            </h1>
            <p className="text-primary/70 mb-4 text-lg font-medium">
              Your account has been created successfully. You have full access to all features.
            </p>
            <p className="text-primary/50 text-sm font-medium animate-pulse">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(27, 77, 62, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), #F5F1E8'
      }}
    >
      <FloatingLeaves />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-gold opacity-5 blur-3xl"></div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 px-4 py-2 glass-card hover:shadow-md transition-all duration-300 font-semibold flex items-center gap-2 text-primary group"
      >
        <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card p-10 md:p-12 animate-scale-in">
          <div className="flex items-center justify-center mb-10 animate-float">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-gold blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img
                src="/whatsapp_image_2025-10-29_at_11.28.27-removebg-preview.png"
                alt="Organitto - The Organic Choice"
                className="h-20 w-auto object-contain relative z-10 transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <h1 className="font-heading text-5xl font-bold text-gradient text-center mb-3">
            Create Account
          </h1>
          <p className="text-primary/60 text-center mb-10 text-lg font-medium">
            Join Organitto and start managing your business
          </p>

          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50/90 to-red-100/90 backdrop-blur-sm border border-red-200 rounded-button flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-primary mb-3 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-float w-full pl-12"
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-primary mb-3 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-float w-full pl-12"
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-primary mb-3 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-float w-full pl-12"
                  placeholder="+1 (555) 000-0000"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-primary mb-3 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-float w-full pl-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <p className="text-xs text-primary/50 mt-2 ml-1 font-medium">Minimum 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-primary mb-3 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-float w-full pl-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <PremiumButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full text-lg mt-8"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </PremiumButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-primary/70 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-gradient-gold font-bold hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 glass-card inline-block px-6 py-3 mx-auto">
          <p className="text-primary/50 text-sm font-medium flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Organitto - Premium Ayurvedic Management
          </p>
        </div>
      </div>
    </div>
  );
}
