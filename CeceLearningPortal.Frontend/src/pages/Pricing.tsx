import { PricingSection } from "@/components/Pricing/PricingSection";
import { TestimonialsSection } from "@/components/LearningPortal/TestimonialsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, Shield, CreditCard, RefreshCw } from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Invest in Your Future
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of learners who have transformed their careers with
            CECE. Choose a plan that fits your learning goals.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <RefreshCw className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">
                      Can I switch plans anytime?
                    </h3>
                    <p className="text-muted-foreground">
                      Yes! You can upgrade or downgrade your plan at any time.
                      Changes take effect at the next billing cycle.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">
                      What payment methods do you accept?
                    </h3>
                    <p className="text-muted-foreground">
                      We accept all major credit cards, debit cards, and PayPal.
                      Enterprise customers can pay via invoice.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">
                      Is there a money-back guarantee?
                    </h3>
                    <p className="text-muted-foreground">
                      Yes! All paid plans come with a 7-day money-back
                      guarantee. No questions asked.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">
                      Do you offer student discounts?
                    </h3>
                    <p className="text-muted-foreground">
                      Yes! Students get 30% off all plans with a valid .edu
                      email address.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Have more questions?</p>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
};

export default Pricing;
