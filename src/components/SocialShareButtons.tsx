import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MessageCircle, Linkedin, Link2, Share2, Twitter } from "lucide-react";

interface SocialShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

/**
 * Social Share Buttons Component
 * Provides WhatsApp, LinkedIn, and Copy Link sharing options
 * Optimized for Nigerian user behavior (WhatsApp primary)
 */
export const SocialShareButtons = ({
  title,
  text,
  url = typeof window !== 'undefined' ? window.location.href : '',
  className = '',
}: SocialShareButtonsProps) => {
  const encodedText = encodeURIComponent(`${title}\n\n${text}\n\n${url}`);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodedText}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // User cancelled or share failed silently
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground mr-1">Share:</span>
      
      {/* WhatsApp - Primary for Nigerian users */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="gap-1.5 hover:bg-success/10 hover:text-success hover:border-success/30"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      {/* LinkedIn - For professional sharing */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkedInShare}
        className="gap-1.5 hover:bg-info/10 hover:text-info hover:border-info/30"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      {/* X/Twitter - For professional discussions */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleTwitterShare}
        className="gap-1.5 hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30"
        title="Share on X"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">X</span>
      </Button>

      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5"
        title="Copy link"
      >
        <Link2 className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>

      {/* Native Share (mobile) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="gap-1.5 sm:hidden"
          title="Share"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
