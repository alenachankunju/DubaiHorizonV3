import HeroSection from '@/components/home/hero-section';
import FeaturedDestinations from '@/components/home/featured-destinations';
import WhyVisitDubai from '@/components/home/why-visit-dubai';
import TopExperiences from '@/components/home/top-experiences';
import Testimonials from '@/components/home/testimonials';
import PopularPackages from '@/components/home/popular-packages';
import TravelGuide from '@/components/home/travel-guide';
import Faq from '@/components/home/faq';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <div className="container mx-auto px-4">
        <FeaturedDestinations />
      </div>
      <WhyVisitDubai />
      <TopExperiences />
      <Testimonials />
      <PopularPackages />
      <TravelGuide />
      <Faq />
    </div>
  );
}
