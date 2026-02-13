interface DataSourceCitationProps {
  source?: string;
}

export const DataSourceCitation = ({ 
  source = 'Nigeria Tax Act 2025 (Official Gazette, Federal Republic of Nigeria)' 
}: DataSourceCitationProps) => (
  <p className="text-xs text-muted-foreground mt-3 italic">
    Source: {source}
  </p>
);
