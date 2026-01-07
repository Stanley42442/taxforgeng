import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Quote, Star, Building2, Users, TrendingUp } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  sector: string;
  metric: string;
  metricLabel: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "TaxForge NG saved us over ₦2M in the first year by identifying we qualified for small company 0% CIT rate. Game changer for our startup.",
    author: "Chinedu Okafor",
    role: "CEO",
    company: "TechStack Lagos",
    sector: "Technology",
    metric: "₦2M+",
    metricLabel: "Tax Savings",
  },
  {
    id: "2",
    quote: "The VAT calculator alone has saved me hours every month. I used to dread tax season, now it takes minutes instead of days.",
    author: "Aisha Mohammed",
    role: "Founder",
    company: "Fashion Forward NG",
    sector: "Retail",
    metric: "90%",
    metricLabel: "Time Saved",
  },
  {
    id: "3",
    quote: "Finally, a tax tool that understands Nigerian tax laws! The 2026 updates were reflected immediately. Our accountant loves it.",
    author: "Emeka Nwosu",
    role: "CFO",
    company: "Agro Solutions Ltd",
    sector: "Agriculture",
    metric: "5 hrs/week",
    metricLabel: "Time Saved",
  },
  {
    id: "4",
    quote: "Switched from manual calculations to TaxForge. The accuracy and automatic updates for new tax laws are invaluable.",
    author: "Folake Adeyemi",
    role: "Managing Director",
    company: "Adeyemi Consulting",
    sector: "Professional Services",
    metric: "100%",
    metricLabel: "Compliance",
  },
  {
    id: "5",
    quote: "The business structure advisor helped us choose LLC over Business Name. That decision has protected our personal assets.",
    author: "Uche Obi",
    role: "Co-founder",
    company: "BuildRight Construction",
    sector: "Construction",
    metric: "Protected",
    metricLabel: "Personal Assets",
  },
  {
    id: "6",
    quote: "We manage 50+ client businesses on TaxForge. The bulk processing and reporting features are exactly what we needed.",
    author: "Ngozi Eze",
    role: "Partner",
    company: "Eze & Associates",
    sector: "Accounting",
    metric: "50+",
    metricLabel: "Clients Managed",
  },
];

interface SuccessStoriesProps {
  showTitle?: boolean;
  limit?: number;
  autoPlay?: boolean;
}

export const SuccessStories = ({ 
  showTitle = true, 
  limit, 
  autoPlay = true 
}: SuccessStoriesProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayedTestimonials = limit ? testimonials.slice(0, limit) : testimonials;
  const totalSlides = Math.ceil(displayedTestimonials.length / 3);

  useEffect(() => {
    if (!autoPlay || totalSlides <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [autoPlay, totalSlides]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);

  const getVisibleTestimonials = () => {
    const start = currentIndex * 3;
    return displayedTestimonials.slice(start, start + 3);
  };

  return (
    <section className="py-16 relative z-10">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="text-center mb-12 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success mb-4">
              <Star className="h-4 w-4" />
              Success Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Nigerian Businesses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how businesses across Nigeria are saving time and money with TaxForge NG
            </p>
          </div>
        )}

        <div className="relative">
          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500">
            {getVisibleTestimonials().map((testimonial, index) => (
              <Card 
                key={testimonial.id} 
                className="glass-frosted hover-lift transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  
                  {/* Quote Text */}
                  <p className="text-foreground mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Metric Highlight */}
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-lg font-bold text-primary">{testimonial.metric}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.metricLabel}</p>
                    </div>
                  </div>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {testimonial.author.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                  
                  {/* Sector Badge */}
                  <div className="mt-4 flex items-center gap-2">
                    <Building2 className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{testimonial.sector}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="ghost" size="icon" onClick={prevSlide}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={nextSlide}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
