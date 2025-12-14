import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { FloatingLeaves, PremiumButton } from '../components/ui';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 20% 50%, rgba(27, 77, 62, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%), #F5F1E8'
      }}
    >
      <FloatingLeaves />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-gold opacity-5 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-12 animate-float">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-gold blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
                <img
                  src="/whatsapp_image_2025-10-29_at_11.28.27-removebg-preview.png"
                  alt="Organitto - The Organic Choice"
                  className="h-32 md:h-40 w-auto object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 glass-card">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-bold text-gradient">Premium Ayurvedic Management</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-heading font-bold text-primary mb-6 leading-tight animate-fade-in">
              Elevate Your{' '}
              <span className="text-gradient-gold">Ayurvedic</span>
              <br />
              Business
            </h1>

            <p className="text-xl md:text-2xl text-primary/70 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              The most sophisticated platform for managing your Ayurvedic practice with elegance and precision
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
              <PremiumButton
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                className="min-w-[220px] text-lg shadow-colored"
              >
                Start Your Journey
              </PremiumButton>

              <PremiumButton
                variant="gold"
                size="lg"
                onClick={() => navigate('/login')}
                className="min-w-[220px] text-lg"
              >
                Sign In
              </PremiumButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
              <div className="glass-card p-8 card-3d group animate-float">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-colored transform group-hover:rotate-12 transition-transform duration-300">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-3">
                  Natural Flow
                </h3>
                <p className="text-primary/70 leading-relaxed text-lg">
                  Manage your practice with intuitive tools that respect the natural rhythm of Ayurvedic care
                </p>
              </div>

              <div className="glass-card p-8 card-3d group animate-float-delayed">
                <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-glow transform group-hover:rotate-12 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-primary-dark" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-3">
                  Premium Analytics
                </h3>
                <p className="text-primary/70 leading-relaxed text-lg">
                  Gain comprehensive insights into your business health with sophisticated reporting tools
                </p>
              </div>

              <div className="glass-card p-8 card-3d group animate-float">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-colored transform group-hover:rotate-12 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-primary mb-3">
                  Secure & Reliable
                </h3>
                <p className="text-primary/70 leading-relaxed text-lg">
                  Enterprise-grade security ensuring your data is protected with the highest standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-primary/10 via-gold/5 to-transparent pointer-events-none"></div>

      <div className="absolute bottom-8 left-0 right-0 text-center z-20">
        <p className="text-sm text-primary/50 font-medium">
          Trusted by leading Ayurvedic practitioners worldwide
        </p>
      </div>
    </div>
  );
}
