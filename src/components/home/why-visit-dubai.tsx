import { Building2, ShoppingBag, Sun, Landmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <Building2 className="w-10 h-10 text-primary" />,
    title: 'Iconic Skyline',
    description: 'Witness breathtaking modern architecture and futuristic cityscapes.',
  },
  {
    icon: <ShoppingBag className="w-10 h-10 text-primary" />,
    title: 'Luxury Lifestyle',
    description: 'Experience world-class shopping, dining, and entertainment.',
  },
  {
    icon: <Sun className="w-10 h-10 text-primary" />,
    title: 'Year-Round Sun',
    description: 'Enjoy endless sunshine and beautiful beaches for perfect holidays.',
  },
  {
    icon: <Landmark className="w-10 h-10 text-primary" />,
    title: 'Rich Culture',
    description: 'Explore a unique blend of traditional Arabian heritage and modern culture.',
  },
];

export default function WhyVisitDubai() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">Why Visit Dubai?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-sm hover:shadow-lg transition-shadow bg-card">
              <CardHeader className="flex flex-col items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
