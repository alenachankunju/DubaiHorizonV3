import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Do I need a visa to visit Dubai?',
    answer: 'Visa requirements for Dubai depend on your nationality. Many countries are eligible for a visa on arrival, while others need to apply in advance. Check with the official UAE government website for the most current information.',
  },
  {
    question: 'Is Dubai safe for solo travelers?',
    answer: 'Yes, Dubai is considered one of the safest cities in the world for solo travelers, including women. It has a low crime rate and a strong security presence. Standard travel precautions are always recommended.',
  },
  {
    question: 'When is the best time to go?',
    answer: 'The best time to visit Dubai is during the winter months, from November to March, when the weather is cool and pleasant. This is the peak tourist season. The summer months (June to September) are very hot and humid.',
  },
  {
    question: 'What is the local currency?',
    answer: 'The local currency is the United Arab Emirates Dirham (AED). Credit cards are widely accepted, but it\'s useful to have some cash for smaller purchases at traditional markets (souks).',
  },
];

export default function Faq() {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
