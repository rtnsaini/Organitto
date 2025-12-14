import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, AlertTriangle, CheckCircle, Clock, QrCode } from 'lucide-react';
import Header from '../components/Header';
import AddBatchModal from '../components/AddBatchModal';
import { supabase } from '../lib/supabase';
import { format, differenceInDays } from 'date-fns';
import { FloatingLeaves } from '../components/ui/FloatingLeaves';
import { GlassCard } from '../components/ui/GlassCard';
import { PremiumButton } from '../components/ui';

export default function Batches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [stats, setStats] = useState({
    activeBatches: 0,
    totalUnits: 0,
    expiringSoon: 0,
    productsWithBatches: 0,
  });

  useEffect(() => {
    fetchBatches();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterBatches();
    calculateStats();
  }, [batches, searchQuery, statusFilter]);

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*, products(name, images)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterBatches = () => {
    let filtered = batches;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.batch_number?.toLowerCase().includes(query) ||
        b.products?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredBatches(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const activeBatches = batches.filter(b => b.status === 'active').length;
    const totalUnits = batches.reduce((sum, b) => sum + (b.units_in_stock || 0), 0);
    const expiringSoon = batches.filter(b => {
      const daysUntilExpiry = differenceInDays(new Date(b.expiry_date), now);
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    }).length;
    const uniqueProducts = new Set(batches.map(b => b.product_id)).size;

    setStats({
      activeBatches,
      totalUnits,
      expiringSoon,
      productsWithBatches: uniqueProducts,
    });
  };

  const getExpiryColor = (expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());
    if (daysUntilExpiry < 0) return 'text-soft-red';
    if (daysUntilExpiry <= 15) return 'text-soft-red';
    if (daysUntilExpiry <= 30) return 'text-accent';
    if (daysUntilExpiry <= 60) return 'text-amber-500';
    return 'text-sage';
  };

  const getStatusBadge = (batch: any) => {
    const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), new Date());

    if (batch.status === 'recalled') {
      return { label: 'Recalled', color: 'bg-soft-red text-white', icon: '🛑' };
    }
    if (daysUntilExpiry < 0) {
      return { label: 'Expired', color: 'bg-soft-red/10 text-soft-red', icon: '🔴' };
    }
    if (batch.units_in_stock === 0) {
      return { label: 'Sold Out', color: 'bg-dark-brown/10 text-dark-brown', icon: '⚫' };
    }
    if (daysUntilExpiry <= 30) {
      return { label: 'Expiring Soon', color: 'bg-accent/10 text-accent', icon: '🟠' };
    }
    if (batch.units_in_stock < batch.batch_size * 0.2) {
      return { label: 'Low Stock', color: 'bg-amber-500/10 text-amber-500', icon: '🟡' };
    }
    if (batch.units_in_stock > 0) {
      return { label: 'In Stock', color: 'bg-blue-500/10 text-blue-500', icon: '🔵' };
    }
    return { label: 'Active', color: 'bg-sage/10 text-sage', icon: '🟢' };
  };

  const getStockPercentage = (batch: any) => {
    return (batch.units_in_stock / batch.batch_size) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-beige to-cream relative overflow-hidden">
      <FloatingLeaves />
      <Header />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <GlassCard className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-gradient mb-2">
                Batch & Lot Tracking
              </h1>
              <p className="text-primary/70 text-lg font-medium">Complete traceability for manufacturing</p>
            </div>
            <PremiumButton
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="lg"
              className="hidden md:flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Batch
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
          New Batch
        </PremiumButton>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-sage/20 rounded-button">
                <CheckCircle className="w-6 h-6 text-sage" />
              </div>
              <span className="text-3xl font-bold text-sage">{stats.activeBatches}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Active Batches</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-primary/20 rounded-button">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <span className="text-3xl font-bold text-primary">{stats.totalUnits}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Total Units in Stock</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-accent/20 rounded-button">
                <AlertTriangle className="w-6 h-6 text-accent" />
              </div>
              <span className={`text-3xl font-bold ${stats.expiringSoon > 0 ? 'text-accent' : 'text-primary/40'}`}>
                {stats.expiringSoon}
              </span>
            </div>
            <p className="text-sm font-bold text-primary/70">Expiring Soon (30d)</p>
          </GlassCard>

          <GlassCard className="hover:shadow-glow transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-blue-500/20 rounded-button">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-blue-500">{stats.productsWithBatches}</span>
            </div>
            <p className="text-sm font-bold text-primary/70">Products with Batches</p>
          </GlassCard>
        </div>

        <GlassCard className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-button font-bold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-primary/5 text-primary hover:bg-primary/10'
                }`}
              >
                All Batches ({batches.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-button font-bold transition-all ${
                  statusFilter === 'active'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-primary/5 text-primary hover:bg-primary/10'
                }`}
              >
                Active ({batches.filter(b => b.status === 'active').length})
              </button>
              <button
                onClick={() => setStatusFilter('sold_out')}
                className={`px-4 py-2 rounded-button font-bold transition-all ${
                  statusFilter === 'sold_out'
                    ? 'bg-gradient-primary text-white shadow-glow'
                    : 'bg-primary/5 text-primary hover:bg-primary/10'
                }`}
              >
                Sold Out ({batches.filter(b => b.status === 'sold_out').length})
              </button>
            </div>

            <div className="relative w-full lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches..."
                className="input-float w-full pl-12"
              />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBatches.map(batch => {
            const statusBadge = getStatusBadge(batch);
            const stockPercentage = getStockPercentage(batch);
            const daysUntilExpiry = differenceInDays(new Date(batch.expiry_date), new Date());

            return (
              <Link
                key={batch.id}
                to={`/batches/${batch.id}`}
                className="block"
              >
                <GlassCard className="hover:shadow-glow transition-all duration-300 group h-full">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusBadge.color}`}>
                          <span className="mr-1">{statusBadge.icon}</span>
                          {statusBadge.label}
                        </span>
                      </div>
                      <h3 className="font-mono text-lg font-bold text-primary group-hover:text-accent transition-colors mb-1">
                        {batch.batch_number}
                      </h3>
                      <p className="text-sm font-semibold text-dark-brown">
                        {batch.products?.name || 'Unknown Product'}
                      </p>
                    </div>
                    <QrCode className="w-8 h-8 text-dark-brown/20 group-hover:text-primary transition-colors" />
                  </div>

                  {batch.products?.images && batch.products.images[0] && (
                    <div className="w-full h-32 mb-4 rounded-lg overflow-hidden bg-cream">
                      <img
                        src={batch.products.images[0]}
                        alt={batch.products.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-brown/60">Manufacturing</span>
                      <span className="font-semibold text-dark-brown">
                        {format(new Date(batch.manufacturing_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-brown/60">Expiry</span>
                      <span className={`font-semibold ${getExpiryColor(batch.expiry_date)}`}>
                        {format(new Date(batch.expiry_date), 'MMM dd, yyyy')}
                        <span className="text-xs ml-1">
                          ({daysUntilExpiry >= 0 ? `${daysUntilExpiry}d left` : 'Expired'})
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-dark-brown/60">Stock Status</span>
                      <span className="font-bold text-primary">
                        {batch.units_in_stock} / {batch.batch_size} units
                      </span>
                    </div>
                    <div className="w-full bg-dark-brown/10 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          stockPercentage > 50 ? 'bg-sage' : stockPercentage > 20 ? 'bg-amber-500' : 'bg-soft-red'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                  </div>

                  {batch.qc_approved && (
                    <div className="flex items-center gap-2 text-sm text-sage">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-semibold">QC Approved</span>
                    </div>
                  )}
                </div>
                </GlassCard>
              </Link>
            );
          })}
        </div>

        {filteredBatches.length === 0 && (
          <GlassCard className="text-center py-16">
            <Package className="w-20 h-20 text-primary/20 mx-auto mb-6" />
            <h3 className="font-heading text-2xl font-bold text-primary mb-3">
              No batches found
            </h3>
            <p className="text-primary/60 mb-6 text-lg font-medium">
              {searchQuery ? 'Try adjusting your search' : 'Create your first batch to start tracking'}
            </p>
            {!searchQuery && (
              <PremiumButton
                onClick={() => setShowAddModal(true)}
                variant="primary"
                size="lg"
              >
                Create Batch
              </PremiumButton>
            )}
          </GlassCard>
        )}
      </div>

      {showAddModal && (
        <AddBatchModal
          products={products}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchBatches();
          }}
        />
      )}
    </div>
  );
}
