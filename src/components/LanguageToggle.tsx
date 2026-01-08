import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

// Language toggle is now a no-op since we removed multi-language support
// Keeping the component for backwards compatibility but it just shows English

export const LanguageToggle = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2" title="Language">
          <span className="text-base">🇬🇧</span>
          <span className="hidden sm:inline text-xs font-medium">English</span>
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="bg-accent font-medium">
          <span className="mr-2">🇬🇧</span>
          English
          <span className="ml-auto text-xs text-primary">✓</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
