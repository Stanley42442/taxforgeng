import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subDays, subMonths, isAfter, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Filter,
  ArrowLeftRight,
  Trash2,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Briefcase,
  Bitcoin,
  TrendingUp as InvestIcon,
  Store,
  Globe,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  Eye
} from 'lucide-react';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatCurrency, type IndividualTaxInputs, type IndividualTaxResult } from '@/lib/individualTaxCalculations';
import { downloadIndividualTaxPDF } from '@/lib/individualPdfExport';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { useDeviceCSS, getResponsiveClasses } from '@/hooks/useDeviceCSS';
import logger from '@/lib/logger';

interface SavedCalculation {
  id: string;
  calculation_type: string;
  inputs: IndividualTaxInputs;
  result: IndividualTaxResult;
  created_at: string;
}

const calcTypeIcons: Record<string, typeof Briefcase> = {
  pit: Briefcase,
  crypto: Bitcoin,
  investment: InvestIcon,
  informal: Store,
  foreign_income: Globe
};

const calcTypeLabels: Record<string, string> = {
  pit: 'Employment PIT',
  crypto: 'Crypto Tax',
  investment: 'Investment Tax',
  informal: 'Informal Tax',
  foreign_income: 'Foreign Income'
};

const dateFilters = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '1y', label: 'Last Year' }
];

export default function CalculationHistory() {
  const { device, isMobile, isTablet, containerClass } = useDeviceCSS();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [rulesFilter, setRulesFilter] = useState<'all' | '2026' | 'pre2026'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState<SavedCalculation | null>(null);

  useEffect(() => {
    if (user) {
      loadCalculations();
    }
  }, [user]);

  const loadCalculations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('individual_calculations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalculations(data as unknown as SavedCalculation[]);
    } catch (error) {
      logger.error('Error loading calculations:', error);
      toast.error('Failed to load calculation history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('individual_calculations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCalculations(prev => prev.filter(c => c.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success('Calculation deleted');
    } catch (error) {
      logger.error('Error deleting:', error);
      toast.error('Failed to delete calculation');
    }
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      const { error } = await supabase
        .from('individual_calculations')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      setCalculations(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} calculation(s) deleted`);
    } catch (error) {
      logger.error('Error bulk deleting:', error);
      toast.error('Failed to delete calculations');
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredCalculations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCalculations.map(c => c.id)));
    }
  };

  const filteredCalculations = calculations.filter(calc => {
    // Type filter
    if (typeFilter !== 'all' && calc.calculation_type !== typeFilter) return false;
    
    // Rules filter
    if (rulesFilter === '2026' && !calc.inputs.use2026Rules) return false;
    if (rulesFilter === 'pre2026' && calc.inputs.use2026Rules) return false;
    
    // Date filter
    if (dateFilter !== 'all') {
      const calcDate = parseISO(calc.created_at);
      const now = new Date();
      let cutoffDate: Date;
      
      switch (dateFilter) {
        case '7d': cutoffDate = subDays(now, 7); break;
        case '30d': cutoffDate = subDays(now, 30); break;
        case '90d': cutoffDate = subMonths(now, 3); break;
        case '1y': cutoffDate = subMonths(now, 12); break;
        default: cutoffDate = new Date(0);
      }
      
      if (!isAfter(calcDate, cutoffDate)) return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const typeLabel = calcTypeLabels[calc.calculation_type]?.toLowerCase() || '';
      const amount = formatCurrency(calc.result.taxPayable).toLowerCase();
      return typeLabel.includes(query) || amount.includes(query);
    }
    
    return true;
  });

  const selectedCalculations = calculations.filter(c => selectedIds.has(c.id));
  const canCompare = selectedIds.size >= 2 && selectedIds.size <= 4;

  const handleExportPDF = (calc: SavedCalculation) => {
    downloadIndividualTaxPDF({
      inputs: calc.inputs,
      result: calc.result,
      employmentIncome: calc.inputs.employmentIncome,
      pensionContribution: calc.inputs.pensionContribution,
      nhfContribution: calc.inputs.nhfContribution,
      lifeInsurance: calc.inputs.lifeInsurancePremium,
      cryptoIncome: calc.inputs.cryptoIncome,
      cryptoGains: calc.inputs.cryptoGains,
      cryptoLosses: calc.inputs.cryptoLosses,
      dividendIncome: calc.inputs.dividendIncome,
      interestIncome: calc.inputs.interestIncome,
      capitalGains: calc.inputs.capitalGains,
      estimatedTurnover: calc.inputs.estimatedTurnover,
      location: calc.inputs.location
    });
    toast.success('PDF downloaded');
  };

  if (!user) {
    return (
      <PageLayout title="Calculation History" icon={History}>
        <Card className="glass-premium text-center py-12">
          <CardContent>
            <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Sign in to view history</h3>
            <p className="text-muted-foreground mb-6">
              Your calculation history will appear here after you sign in
            </p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Calculation History" 
      icon={History}
      description="View, compare, and manage your saved tax calculations"
      maxWidth="6xl"
    >
      {/* Search & Filter Bar */}
      <Card className={getResponsiveClasses(device, {
        mobile: 'glass-premium mb-4 mobile-card',
        all: 'glass-frosted mb-6'
      })}>
        <CardContent className={isMobile ? 'py-3 px-3' : 'py-4'}>
          <div className="flex flex-col gap-4">
            {/* Search Row */}
            <div className={getResponsiveClasses(device, {
              mobile: 'flex flex-col gap-2',
              all: 'flex flex-col sm:flex-row gap-3'
            })}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search calculations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={getResponsiveClasses(device, {
                    mobile: 'pl-10 input-neumorphic h-11',
                    all: 'pl-10 input-neumorphic'
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2 whitespace-nowrap"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(typeFilter !== 'all' || dateFilter !== 'all' || rulesFilter !== 'all') && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {[typeFilter !== 'all', dateFilter !== 'all', rulesFilter !== 'all'].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                {canCompare && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowCompareDialog(true)}
                    className="gap-2 whitespace-nowrap"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="hidden sm:inline">Compare</span>
                    <span className="sm:hidden">{selectedIds.size}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Row */}
            <Collapsible open={showFilters}>
              <CollapsibleContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {Object.entries(calcTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFilters.map(f => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Tax Rules</Label>
                    <Select value={rulesFilter} onValueChange={(v) => setRulesFilter(v as typeof rulesFilter)}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rules</SelectItem>
                        <SelectItem value="2026">2026 Rules</SelectItem>
                        <SelectItem value="pre2026">Pre-2026 Rules</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Selection Actions Bar */}
      {selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Card className="glass-premium border-primary/30">
            <CardContent className="py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.size === filteredCalculations.length && filteredCalculations.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <span className="text-sm font-medium">
                    {selectedIds.size} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canCompare && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCompareDialog(true)}
                      className="gap-2"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      <span className="hidden sm:inline">Compare</span>
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredCalculations.length === 0 ? (
        <Card className="glass-premium text-center py-12">
          <CardContent>
            <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {calculations.length === 0 ? 'No calculations yet' : 'No matching calculations'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {calculations.length === 0 
                ? 'Calculate your taxes and save them to see your history here'
                : 'Try adjusting your filters or search query'}
            </p>
            {calculations.length === 0 && (
              <Button onClick={() => navigate('/individual-calculator')}>
                Go to Calculator
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>{filteredCalculations.length} calculation{filteredCalculations.length !== 1 ? 's' : ''}</span>
            {selectedIds.size === 0 && (
              <span className="hidden sm:inline">Select calculations to compare</span>
            )}
          </div>
          
          <AnimatePresence mode="popLayout">
            {filteredCalculations.map((calc, index) => {
              const Icon = calcTypeIcons[calc.calculation_type] || Briefcase;
              const isSelected = selectedIds.has(calc.id);
              
              return (
                <motion.div
                  key={calc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                >
                  <Card 
                    className={getResponsiveClasses(device, {
                      mobile: `glass-premium mobile-card transition-all cursor-pointer touch-feedback ${
                        isSelected ? 'border-primary ring-1 ring-primary/30' : ''
                      }`,
                      all: `glass-frosted transition-all cursor-pointer hover:border-primary/30 ${
                        isSelected ? 'border-primary ring-1 ring-primary/30' : ''
                      }`
                    })}
                    onClick={() => toggleSelection(calc.id)}
                  >
                    <CardContent className={isMobile ? 'py-3 px-3' : 'py-4'}>
                      <div className={getResponsiveClasses(device, {
                        mobile: 'flex items-start gap-2',
                        all: 'flex items-start gap-3 sm:gap-4'
                      })}>
                        {/* Checkbox */}
                        <div className="pt-1">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelection(calc.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        
                        {/* Icon */}
                        <div className={`rounded-xl flex-shrink-0 ${
                          isMobile ? 'p-2' : 'p-2.5 sm:p-3'
                        } ${
                          calc.inputs.use2026Rules ? 'bg-success/10 text-success' : 'bg-secondary text-secondary-foreground'
                        }`}>
                          <Icon className={isMobile ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {calcTypeLabels[calc.calculation_type]}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {calc.inputs.use2026Rules ? '2026' : 'Pre-2026'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(calc.created_at), 'MMM d, yyyy')}
                            </span>
                            <span>Rate: {calc.result.effectiveRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        
                        {/* Amount & Actions */}
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-base sm:text-lg text-primary">
                            {formatCurrency(calc.result.taxPayable)}
                          </p>
                          <div className="flex items-center gap-1 mt-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDetailDialog(calc);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportPDF(calc);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteId(calc.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!showDetailDialog} onOpenChange={() => setShowDetailDialog(null)}>
        <DialogContent className="w-[92vw] max-w-md max-h-[65vh] rounded-xl p-4 flex flex-col mx-auto">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              {showDetailDialog && (
                <>
                  {(() => {
                    const Icon = calcTypeIcons[showDetailDialog.calculation_type] || Briefcase;
                    return <Icon className="h-4 w-4 text-primary" />;
                  })()}
                  {calcTypeLabels[showDetailDialog?.calculation_type || 'pit']}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {showDetailDialog && format(parseISO(showDetailDialog.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {showDetailDialog && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4">
              <div className="space-y-3 pb-2">
                {/* Summary */}
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">Total Tax Payable</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(showDetailDialog.result.taxPayable)}</p>
                  <div className="flex gap-3 mt-1.5 text-xs">
                    <span>Rate: {showDetailDialog.result.effectiveRate.toFixed(2)}%</span>
                    <Badge variant="outline" className="text-xs h-5">
                      {showDetailDialog.inputs.use2026Rules ? '2026 Rules' : 'Pre-2026'}
                    </Badge>
                  </div>
                </div>
                
                {/* Breakdown */}
                <div>
                  <h4 className="font-medium text-sm mb-1.5">Tax Breakdown</h4>
                  <div className="space-y-0.5">
                    {showDetailDialog.result.breakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Reliefs */}
                {showDetailDialog.result.reliefs?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-1.5">Reliefs Applied</h4>
                    <div className="space-y-1.5">
                      {showDetailDialog.result.reliefs.map((relief, i) => (
                        <div key={i} className="p-2 rounded-lg bg-success/5 border border-success/20 text-xs">
                          <div className="flex justify-between">
                            <span>{relief.name}</span>
                            <span className="text-success font-medium">-{formatCurrency(relief.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex-shrink-0 pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={() => setShowDetailDialog(null)}>Close</Button>
            {showDetailDialog && (
              <Button size="sm" onClick={() => handleExportPDF(showDetailDialog)} className="gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="w-[92vw] max-w-3xl max-h-[70vh] rounded-xl p-4 flex flex-col mx-auto">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="h-4 w-4" />
              Compare Calculations
            </DialogTitle>
            <DialogDescription className="text-xs">
              Comparing {selectedCalculations.length} calculations side by side
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 overflow-y-auto pr-2 mt-4">
            <div className={`grid gap-3 ${selectedCalculations.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              {selectedCalculations.map((calc, index) => {
                const Icon = calcTypeIcons[calc.calculation_type] || Briefcase;
                const minTax = Math.min(...selectedCalculations.map(c => c.result.taxPayable));
                const isLowest = calc.result.taxPayable === minTax;
                
                return (
                  <Card key={calc.id} className={`relative ${isLowest ? 'border-success ring-1 ring-success/30' : ''}`}>
                    {isLowest && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-success text-success-foreground text-xs">
                        Lowest Tax
                      </Badge>
                    )}
                    <CardHeader className="pb-2 p-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <CardTitle className="text-xs">
                          {calcTypeLabels[calc.calculation_type]}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        {format(parseISO(calc.created_at), 'MMM d, yyyy')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 p-3 pt-0">
                      <div className="text-center p-2 rounded-lg bg-primary/5">
                        <p className="text-xs text-muted-foreground">Tax Payable</p>
                        <p className="text-base font-bold text-primary">
                          {formatCurrency(calc.result.taxPayable)}
                        </p>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Taxable Income</span>
                          <span>{formatCurrency(calc.result.taxableIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Effective Rate</span>
                          <span>{calc.result.effectiveRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tax Rules</span>
                          <Badge variant="outline" className="text-xs h-4">
                            {calc.inputs.use2026Rules ? '2026' : 'Pre-2026'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Savings Summary */}
            {selectedCalculations.length >= 2 && (
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-success/5 to-accent/5 border border-success/20">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-success" />
                  Potential Savings
                </h4>
                {(() => {
                  const taxes = selectedCalculations.map(c => c.result.taxPayable);
                  const maxTax = Math.max(...taxes);
                  const minTax = Math.min(...taxes);
                  const savings = maxTax - minTax;
                  
                  return (
                    <div className="text-center">
                      <p className="text-xl font-bold text-success">{formatCurrency(savings)}</p>
                      <p className="text-xs text-muted-foreground">
                        Difference between highest and lowest tax
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-shrink-0 pt-3 border-t border-border/50">
            <Button variant="outline" size="sm" onClick={() => setShowCompareDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Calculation"
        description="Are you sure you want to delete this calculation? This action cannot be undone."
      />
    </PageLayout>
  );
}
