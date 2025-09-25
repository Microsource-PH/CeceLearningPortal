import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, MessageCircle } from "lucide-react";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-card">
            <CardHeader>
              <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-destructive">
                Payment Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Unfortunately, your payment could not be processed. This could
                be due to various reasons such as insufficient funds, network
                issues, or payment method problems.
              </p>

              <div className="bg-gradient-card p-4 rounded-lg">
                <h3 className="font-semibold mb-3">What you can do:</h3>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>• Check your payment method details</li>
                  <li>• Ensure you have sufficient funds</li>
                  <li>• Try a different payment method</li>
                  <li>• Contact your bank if the issue persists</li>
                  <li>• Reach out to our support team for assistance</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => navigate("/marketplace")}
                  className="bg-gradient-primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
