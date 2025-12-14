import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FloatingLeaves, PremiumButton } from '../components/ui';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || 'Failed to sign in. Please check your credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

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
            Welcome Back
          </h1>
          <p className="text-primary/60 text-center mb-10 text-lg font-medium">
            Sign in to continue your journey
          </p>

          {error && (
            <div className="mb-8 p-5 bg-gradient-to-r from-red-50/90 to-red-100/90 backdrop-blur-sm border border-red-200 rounded-button flex items-start gap-3 animate-slide-down">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-primary mb-3 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-float w-full pl-12"
                  placeholder="you@example.com"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in...' : 'Sign In'}
            </PremiumButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-primary/70 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-gradient-gold font-bold hover:underline transition-all">
                Create Account
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
