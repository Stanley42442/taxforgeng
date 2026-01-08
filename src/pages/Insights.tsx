import { useState, useMemo, useEffect, useRef } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, PieChart, Crown, Building2, Percent, Wallet, ArrowUpRight, ArrowDownRight, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// Mock calculation history data
const MOCK_HISTORY = [
  { month: 'Jul', cit: 2500000, vat: 450000, pit: 0, total: 2950000 },
  { month: 'Aug', cit: 2800000, vat: 520000, pit: 0, total: 3320000 },
  { month: 'Sep', cit: 2600000, vat: 480000, pit: 0, total: 3080000 },
  { month: 'Oct', cit: 3100000, vat: 550000, pit: 0, total: 3650000 },
  { month: 'Nov', cit: 2900000, vat: 510000, pit: 0, total: 3410000 },
  { month: 'Dec', cit: 3200000, vat: 580000, pit: 0, total: 3780000 },
];

const MOCK_BENCHMARKS = {
  company: {
    avgEffectiveRate: 22.5,
    avgVatPayable: 8.2,
    topRelief: 'Rent Relief',
  },
  business_name: {
    avgEffectiveRate: 18.3,
    avgVatPayable: 6.5,
    topRelief: 'Consolidated Relief',
  }
};

const COLORS = ['hsl(153, 47%, 25%)', 'hsl(43, 96%, 56%)', 'hsl(199, 89%, 48%)', 'hsl(152, 69%, 31%)'];

const Insights = () => {
  const { tier, savedBusinesses } = useSubscription();
  const { t } = useLanguage();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const pieContainerRef = useRef<HTMLDivElement>(null);

  const canAccess = tier === 'business' || tier === 'corporate';

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle click outside pie chart to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pieContainerRef.current && !pieContainerRef.current.contains(event.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePieClick = (data: any, index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Calculate aggregated insights
  const insights = useMemo(() => {
    if (savedBusinesses.length === 0) return null;

    const totalTurnover = savedBusinesses.reduce((sum, b) => sum + b.turnover, 0);
    const avgTurnover = totalTurnover / savedBusinesses.length;
    const companyCount = savedBusinesses.filter(b => b.entityType === 'company').length;
    const businessNameCount = savedBusinesses.filter(b => b.entityType === 'business_name').length;

    // Mock tax calculations based on saved businesses
    const estimatedTax = totalTurnover * 0.15; // Simplified estimation
    const effectiveRate = 15.2;
    const reliefSavings = totalTurnover * 0.03;

    return {
      totalTurnover,
      avgTurnover,
      companyCount,
      businessNameCount,
      estimatedTax,
      effectiveRate,
      reliefSavings,
    };
  }, [savedBusinesses]);

  // Tax breakdown pie data
  const pieData = useMemo(() => {
    const latestMonth = MOCK_HISTORY[MOCK_HISTORY.length - 1];
    return [
      { name: 'CIT', value: latestMonth.cit },
      { name: 'VAT', value: latestMonth.vat },
      { name: 'Reliefs', value: 450000 },
    ];
  }, []);

  // Free/Basic tier - show teaser
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">{t('insights.title')}</CardTitle>
              <CardDescription>
                {t('insights.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <PieChart className="w-5 h-5 text-primary" />
                  <span>{t('insights.taxBreakdown')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>{t('insights.monthlyTrends')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Percent className="w-5 h-5 text-primary" />
                  <span>{t('insights.effectiveTracking')}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span>{t('insights.reliefAnalysis')}</span>
                </div>
              </div>
              <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/50">
                  <Badge variant="secondary" className="text-sm">
                    <Crown className="w-4 h-4 mr-1" />
                    {t('insights.businessFeature')}
                  </Badge>
                </div>
                <div className="opacity-30 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_HISTORY.slice(0, 3)}>
                      <Bar dataKey="total" fill="hsl(153, 47%, 25%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  {t('insights.upgradeForInsights')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      <div className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <BarChart3 className="inline-block w-8 h-8 mr-2 text-primary" />
              {t('insights.taxInsights')}
            </h1>
            <p className="text-muted-foreground">
              {t('insights.analyzeData')}
            </p>
          </div>
          <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t('insights.selectBusiness')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('insights.allBusinesses')}</SelectItem>
              {savedBusinesses.map(b => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {savedBusinesses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('insights.noDataYet')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('insights.saveAndCalculate')}
              </p>
              <Link to="/calculator">
                <Button>{t('insights.goToCalculator')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="glass-frosted shadow-futuristic border-border/40 hover-lift transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('insights.totalTurnover')}</p>
                      <p className="text-2xl font-bold">₦{insights?.totalTurnover.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-success">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    <span>+12% from last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-frosted shadow-futuristic border-border/40 hover-lift transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('insights.effectiveTaxRate')}</p>
                      <p className="text-2xl font-bold">{insights?.effectiveRate}%</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Percent className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-destructive">
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                    <span>-2.1% optimized</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-frosted shadow-futuristic border-border/40 hover-lift transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('insights.estAnnualTax')}</p>
                      <p className="text-2xl font-bold">₦{insights?.estimatedTax.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-info" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-frosted shadow-futuristic border-border/40 hover-lift transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('insights.reliefSavings')}</p>
                      <p className="text-2xl font-bold text-success">₦{insights?.reliefSavings.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Tax Breakdown Pie */}
              <Card className="glass-frosted shadow-futuristic border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-primary" />
                    </div>
                    {t('insights.taxBreakdownChart')}
                  </CardTitle>
                  <CardDescription>{t('insights.currentPeriod')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`transition-all duration-700 ease-out ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <div className="h-[16rem] relative" ref={pieContainerRef}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={2}
                            dataKey="value"
                            animationBegin={200}
                            animationDuration={1000}
                            animationEasing="ease-out"
                            onClick={handlePieClick}
                            style={{ cursor: 'pointer' }}
                          >
                            {pieData.map((entry, index) => {
                              const isActive = activeIndex === index;
                              return (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]}
                                  stroke={isActive ? 'hsl(var(--foreground))' : 'transparent'}
                                  strokeWidth={isActive ? 3 : 0}
                                  style={{
                                    filter: activeIndex !== null && !isActive ? 'opacity(0.4)' : 'none',
                                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                    transformOrigin: 'center',
                                    transition: 'all 0.2s ease-out',
                                    cursor: 'pointer'
                                  }}
                                />
                              );
                            })}
                          </Pie>
                        </RechartsPie>
                      </ResponsiveContainer>
                      {activeIndex !== null && pieData[activeIndex] && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <p className="text-lg font-bold text-foreground">{pieData[activeIndex].name}</p>
                            <p className="text-sm text-muted-foreground">₦{pieData[activeIndex].value.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {((pieData[activeIndex].value / pieData.reduce((sum, e) => sum + e.value, 0)) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Legend */}
                    <div className={`mt-4 grid grid-cols-3 gap-2 transition-all duration-500 delay-300 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {pieData.map((entry, index) => {
                        const total = pieData.reduce((sum, e) => sum + e.value, 0);
                        const percent = ((entry.value / total) * 100).toFixed(0);
                        const isActive = activeIndex === index;
                        return (
                          <div 
                            key={entry.name} 
                            className={`flex items-center gap-2 text-sm cursor-pointer rounded-md p-1 transition-all ${
                              isActive ? 'bg-muted ring-2 ring-primary' : 'hover:bg-muted/50'
                            } ${activeIndex !== null && !isActive ? 'opacity-40' : ''}`}
                            onClick={() => setActiveIndex(isActive ? null : index)}
                          >
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-muted-foreground truncate">{entry.name}</span>
                            <span className="font-medium text-foreground ml-auto">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="glass-frosted shadow-futuristic border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-accent" />
                    </div>
                    {t('insights.monthlyTrendsChart')}
                  </CardTitle>
                  <CardDescription>{t('insights.taxLiabilityOverTime')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[20rem]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_HISTORY}>
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip 
                          formatter={(value: number) => `₦${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar 
                          dataKey="cit" 
                          name="CIT" 
                          fill={COLORS[0]} 
                          radius={[4, 4, 0, 0]}
                          animationBegin={300}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                        <Bar 
                          dataKey="vat" 
                          name="VAT" 
                          fill={COLORS[1]} 
                          radius={[4, 4, 0, 0]}
                          animationBegin={400}
                          animationDuration={1000}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="mt-4 flex justify-center gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[0] }} />
                      <span className="text-muted-foreground">CIT</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[1] }} />
                      <span className="text-muted-foreground">VAT</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benchmarks */}
            <Card className="glass-frosted shadow-futuristic border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-info" />
                  </div>
                    {t('insights.industryBenchmarks')}
                  </CardTitle>
                  <CardDescription>{t('insights.compareTaxProfile')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t('insights.avgEffectiveRate')}</p>
                    <p className="text-2xl font-bold">{MOCK_BENCHMARKS.company.avgEffectiveRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('insights.similarCompanies')}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t('insights.avgVAT')}</p>
                    <p className="text-2xl font-bold">{MOCK_BENCHMARKS.company.avgVatPayable}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('insights.ofTurnover')}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">{t('insights.topReliefUsed')}</p>
                    <p className="text-2xl font-bold">{MOCK_BENCHMARKS.company.topRelief}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('insights.mostEffective')}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {t('insights.benchmarkDisclaimer')}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Insights;
