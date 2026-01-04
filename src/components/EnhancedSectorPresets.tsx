import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles,
  Building2,
  User,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  X
} from "lucide-react";
import { SECTOR_PRESETS, type SectorPreset } from "@/lib/sectorConfig";
import { toast } from "sonner";

interface EnhancedSectorPresetsProps {
  onApplyPreset: (presets: SectorPreset['presets'], sectorId: string) => void;
  currentSector?: string;
}

export const EnhancedSectorPresets = ({ onApplyPreset, currentSector }: EnhancedSectorPresetsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorPreset | null>(null);
  const [activeTab, setActiveTab] = useState<'business' | 'individual' | 'specialized'>('business');

  const businessSectors = SECTOR_PRESETS.filter(s => s.category === 'business');
  const individualSectors = SECTOR_PRESETS.filter(s => s.category === 'individual');
  const specializedSectors = SECTOR_PRESETS.filter(s => s.category === 'specialized');

  const handleSelect = (sector: SectorPreset) => {
    setSelectedSector(sector);
  };

  const handleApply = () => {
    if (selectedSector) {
      onApplyPreset(selectedSector.presets, selectedSector.id);
      toast.success(`${selectedSector.name} preset applied`);
      setIsOpen(false);
      setSelectedSector(null);
    }
  };

  const renderSectorList = (sectors: SectorPreset[]) => (
    <div className="space-y-2">
      {sectors.map((sector) => (
        <button
          key={sector.id}
          onClick={() => handleSelect(sector)}
          className={`w-full p-3 rounded-xl transition-all text-left ${
            selectedSector?.id === sector.id 
              ? 'bg-primary/20 border-2 border-primary' 
              : currentSector === sector.id
                ? 'bg-success/10 border border-success/30'
                : 'hover:bg-secondary/50 border border-transparent'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              selectedSector?.id === sector.id 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary/10 text-primary'
            }`}>
              <sector.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{sector.name}</span>
                {currentSector === sector.id && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {sector.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Sector Presets
          {currentSector && (
            <Badge variant="secondary" className="ml-1 text-xs">
              {SECTOR_PRESETS.find(s => s.id === currentSector)?.name || 'Selected'}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0 glass-frosted" align="start">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div>
            <h4 className="font-semibold text-sm">Choose Your Sector</h4>
            <p className="text-xs text-muted-foreground">
              Apply sector-specific tax rules and incentives
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="business" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Business
            </TabsTrigger>
            <TabsTrigger 
              value="individual" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <User className="h-4 w-4 mr-2" />
              Individual
            </TabsTrigger>
            <TabsTrigger 
              value="specialized" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary py-3"
            >
              <Zap className="h-4 w-4 mr-2" />
              Specialized
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[300px]">
            <div className="p-3">
              <TabsContent value="business" className="mt-0">
                {renderSectorList(businessSectors)}
              </TabsContent>
              <TabsContent value="individual" className="mt-0">
                {renderSectorList(individualSectors)}
              </TabsContent>
              <TabsContent value="specialized" className="mt-0">
                {renderSectorList(specializedSectors)}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Sector Details Panel */}
        {selectedSector && (
          <div className="border-t border-border p-4 bg-secondary/30">
            <div className="flex items-center gap-2 mb-3">
              <selectedSector.icon className="h-5 w-5 text-primary" />
              <h5 className="font-semibold">{selectedSector.name}</h5>
            </div>

            {/* Benefits */}
            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Key Benefits</p>
              <div className="flex flex-wrap gap-1">
                {selectedSector.benefits.slice(0, 3).map((benefit, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tax Rules */}
            <div className="mb-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-medium mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" />
                Tax Rules
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedSector.taxRules.citRate !== undefined && (
                  <div>
                    <span className="text-muted-foreground">CIT Rate:</span>
                    <span className="font-medium ml-1">{selectedSector.taxRules.citRate}%</span>
                  </div>
                )}
                {selectedSector.taxRules.vatStatus && (
                  <div>
                    <span className="text-muted-foreground">VAT:</span>
                    <span className="font-medium ml-1 capitalize">{selectedSector.taxRules.vatStatus}</span>
                  </div>
                )}
                {selectedSector.taxRules.edtiRate && (
                  <div>
                    <span className="text-muted-foreground">EDTI:</span>
                    <span className="font-medium ml-1">{selectedSector.taxRules.edtiRate}% credit</span>
                  </div>
                )}
              </div>
            </div>

            {/* Myth Busting */}
            {selectedSector.myths.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-xs font-medium mb-2 flex items-center gap-1 text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Myth vs Reality
                </p>
                <div className="space-y-2">
                  {selectedSector.myths.slice(0, 1).map((myth, i) => (
                    <div key={i} className="text-xs">
                      <p className="text-muted-foreground line-through">{myth.myth}</p>
                      <p className="text-foreground flex items-start gap-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-success mt-0.5 flex-shrink-0" />
                        {myth.truth}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleApply} className="w-full">
              Apply {selectedSector.name} Preset
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
