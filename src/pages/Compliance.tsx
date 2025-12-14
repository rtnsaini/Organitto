import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, CheckCircle, Clock, FileText, Shield } from 'lucide-react';
import AddLicenseModal from '../components/AddLicenseModal';
import { supabase } from '../lib/supabase';
import { differenceInDays, format } from 'date-fns';
import { FloatingLeaves } from '../components/ui/FloatingLeaves';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui';

const LICENSE_TYPES = {
  fssai: { label: 'FSSAI License', icon: '🍴', color: 'from-blue-500 to-blue-600' },
  ayush: { label: 'Ayush License', icon: '🌿', color: 'from-sage to-primary' },
  gmp: { label: 'GMP Certification', icon: '✓', color: 'from-primary to-accent' },
  trade: { label: 'Trade License', icon: '🏪', color: 'from-amber-500 to-amber-600' },
  gst: { label: 'GST Registration', icon: '💼', color: 'from-purple-500 to-purple-600' },
  organic: { label: 'Organic Certification', icon: '🌱', color: 'from-green-500 to-green-600' },
  pollution: { label: 'Pollution Control', icon: '🏭', color: 'from-teal-500 to-teal-600' },
  fire: { label: 'Fire Safety', icon: '🔥', color: 'from-red-500 to-red-600' },
  drug: { label: 'Drug License', icon: '💊', color: 'from-pink-500 to-pink-600' },
  other: { label: 'Other License', icon: '📄', color: 'from-dark-brown to-primary' },
};

export default function Compliance() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    complianceScore: 100,
  });

  useEffect(() => {
    fetchLicenses();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [licenses]);

  const fetchLicenses = async () => {
    try {
      const { data, error } = await supabase
        .from('license_summary')
        .select('*')
        .order('expiry_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error('Error fetching licenses:', error);
    }
  };

  const calculateStats = () => {
    const total = licenses.length;
    const active = licenses.filter(l => l.expiry_status === 'active' || l.expiry_status === 'no_expiry').length;
    const expiringSoon = licenses.filter(l =>
      l.expiry_status === 'expiring_soon' || l.expiry_status === 'renewal_due' || l.expiry_status === 'critical'
    ).length;
    const expired = licenses.filter(l => l.expiry_status === 'expired').length;

    const complianceScore = total > 0
      ? Math.round(((active + expiringSoon) / total) * 100)
      : 100;

    setStats({ total, active, expiringSoon, expired, complianceScore });
  };

  const getExpiryStatusBadge = (expiryStatus: string, daysUntilExpiry: number | null) => {
    const badges: any = {
      active: { label: 'Active', color: 'bg-sage/10 text-sage', icon: CheckCircle },
      renewal_due: { label: 'Renewal Due', color: 'bg-amber-500/10 text-amber-500', icon: Clock },
      expiring_soon: { label: 'Expiring Soon', color: 'bg-accent/10 text-accent', icon: AlertTriangle },
      critical: { label: 'Critical', color: 'bg-soft-red/10 text-soft-red', icon: AlertTriangle },
      expired: { label: 'Expired', color: 'bg-soft-red/10 text-soft-red', icon: AlertTriangle },
      no_expiry: { label: 'No Expiry', color: 'bg-blue-500/10 text-blue-500', icon: CheckCircle },
    };
    return badges[expiryStatus] || badges.active;
  };

  const getComplianceColor = () => {
    if (stats.complianceScore === 100) return 'text-sage';
    if (stats.complianceScore >= 80) return 'text-amber-500';
    return 'text-soft-red';
  };

  const getComplianceStatus = () => {
    if (stats.complianceScore === 100) return { label: 'All Compliant', icon: '🟢' };
    if (stats.complianceScore >= 80) return { label: 'Needs Attention', icon: '🟡' };
    return { label: 'Critical Issues', icon: '🔴' };
  };

  const licenseTypeInfo = (type: string) => LICENSE_TYPES[type as keyof typeof LICENSE_TYPES] || LICENSE_TYPES.other;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream relative overflow-hidden">
      <FloatingLeaves />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <GlassCard className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-gradient mb-2">
                Compliance & Certifications
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <p className="text-primary/70 text-lg font-medium">Manage licenses and certifications</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-primary/60 font-medium">Status:</span>
                  <span className={`font-bold text-lg ${getComplianceColor()}`}>
                    {getComplianceStatus().icon} {getComplianceStatus().label} ({stats.complianceScore}%)
                  </span>
                </div>
              </div>
            </div>
            <PremiumButton
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="lg"
              className="hidden md:flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add License
            </PremiumButton>
          </div>
        </GlassCard>

        <PremiumButton
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="lg"
          className="md:hidden w-full mb-6 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add License/Certificate
        </PremiumButton>

        {stats.expiringSoon > 0 && (
          <GlassCard className="bg-accent/10 border-2 border-accent/20 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-primary">
                  {stats.expiringSoon} license{stats.expiringSoon !== 1 ? 's' : ''} expiring in next 90 days - Review required
                </p>
                <p className="text-sm text-primary/70 mt-1 font-medium">
                  Initiate renewal process to maintain compliance
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {stats.expired > 0 && (
          <GlassCard className="bg-soft-red/10 border-2 border-soft-red/20 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-soft-red flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-soft-red">
                  {stats.expired} license{stats.expired !== 1 ? 's have' : ' has'} expired - Immediate action required
                </p>
                <p className="text-sm text-primary/70 mt-1 font-medium">
                  Operating without valid licenses may result in penalties and business disruption
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-primary/20 rounded-button">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-primary">{stats.total}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Total Licenses</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-sage/20 rounded-button">
                <CheckCircle className="w-6 h-6 text-sage" />
              </div>
              <span className="text-3xl font-bold text-sage">{stats.active}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Active & Valid</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-accent/20 rounded-button">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <span className="text-3xl font-bold text-accent">{stats.expiringSoon}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Renewal Due Soon</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-soft-red/20 rounded-button">
                <AlertTriangle className="w-6 h-6 text-soft-red" />
              </div>
              <span className="text-3xl font-bold text-soft-red">{stats.expired}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Expired</p>
          </GlassCard>
        </div>

        {licenses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {licenses.map(license => {
              const typeInfo = licenseTypeInfo(license.license_type);
              const statusBadge = getExpiryStatusBadge(license.expiry_status, license.days_until_expiry);
              const StatusIcon = statusBadge.icon;
              const compliancePercentage = license.total_checklist_items > 0
                ? Math.round((license.completed_checklist_items / license.total_checklist_items) * 100)
                : 100;

              return (
                <Link
                  key={license.id}
                  to={`/compliance/${license.id}`}
                  className="block"
                >
                  <GlassCard className="hover:shadow-glow transition-all duration-300 overflow-hidden p-0">
                  <div className={`h-2 bg-gradient-to-r ${typeInfo.color}`} />

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{typeInfo.icon}</div>
                        <div>
                          <h3 className="font-semibold text-dark-brown">{typeInfo.label}</h3>
                          <p className="text-xs text-dark-brown/60 font-mono">{license.license_number}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-dark-brown/60">Issued by:</span>
                        <span className="text-sm font-semibold text-dark-brown">{license.issuing_authority}</span>
                      </div>

                      {license.expiry_date && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-dark-brown/60">Expiry:</span>
                            <span className={`text-sm font-semibold ${
                              license.expiry_status === 'expired' ? 'text-soft-red' :
                              license.expiry_status === 'critical' ? 'text-soft-red' :
                              license.expiry_status === 'expiring_soon' ? 'text-accent' :
                              license.expiry_status === 'renewal_due' ? 'text-amber-500' : 'text-sage'
                            }`}>
                              {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                            </span>
                          </div>

                          {license.days_until_expiry !== null && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-dark-brown/60">Days remaining:</span>
                              <span className={`text-lg font-bold ${
                                license.days_until_expiry < 0 ? 'text-soft-red' :
                                license.days_until_expiry <= 7 ? 'text-soft-red' :
                                license.days_until_expiry <= 30 ? 'text-accent' :
                                license.days_until_expiry <= 90 ? 'text-amber-500' : 'text-sage'
                              }`}>
                                {license.days_until_expiry >= 0 ? license.days_until_expiry : 'Expired'}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {license.total_checklist_items > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-dark-brown/60">Compliance:</span>
                            <span className="text-sm font-semibold text-dark-brown">{compliancePercentage}%</span>
                          </div>
                          <div className="w-full bg-dark-brown/10 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                compliancePercentage === 100 ? 'bg-sage' :
                                compliancePercentage >= 80 ? 'bg-amber-500' : 'bg-soft-red'
                              }`}
                              style={{ width: `${compliancePercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-dark-brown/10">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusBadge.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm font-bold">{statusBadge.label}</span>
                      </div>
                    </div>
                  </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-16 text-center">
            <FileText className="w-20 h-20 text-primary/20 mx-auto mb-6" />
            <h3 className="font-heading text-2xl font-bold text-primary mb-3">
              No licenses recorded yet
            </h3>
            <p className="text-primary/60 mb-6 text-lg font-medium">
              Add your business licenses and certifications to track compliance
            </p>
            <PremiumButton
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="lg"
            >
              Add First License
            </PremiumButton>
          </GlassCard>
        )}
      </div>

      {showAddModal && (
        <AddLicenseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchLicenses();
          }}
        />
      )}
    </div>
  );
}
