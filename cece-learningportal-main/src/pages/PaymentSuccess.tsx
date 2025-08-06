import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/LearningPortal/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Download, Award } from "lucide-react";
import { formatPHP } from "@/utils/currency";

const PaymentSuccess = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setVerificationStatus('failed');
        return;
      }

      try {
        const response = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ session_id: sessionId })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        if (data.success && data.status === 'completed') {
          setVerificationStatus('success');
          setPaymentDetails(data.payment);
        } else {
          setVerificationStatus('failed');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setVerificationStatus('failed');
      }
    };

    verifyPayment();
  }, [location]);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-lg">Verifying your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl text-destructive">Payment Verification Failed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We couldn't verify your payment. If you've been charged, please contact support.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/marketplace')}>
                    Back to Courses
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/profile')}>
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-card">
            <CardHeader>
              <div className="w-16 h-16 bg-learning-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-learning-success">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Thank you for your purchase. Your enrollment has been confirmed.
              </p>

              {paymentDetails && (
                <div className="bg-gradient-card p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-sm">{paymentDetails.reference_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{formatPHP(paymentDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="outline">
                      {paymentDetails.type === 'course' ? 'Course Purchase' : 'Subscription'}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold">What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex flex-col items-center p-3 bg-gradient-card rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary mb-2" />
                    <span className="font-medium">Start Learning</span>
                    <span className="text-muted-foreground text-center">Access your course content immediately</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gradient-card rounded-lg">
                    <Download className="w-6 h-6 text-primary mb-2" />
                    <span className="font-medium">Download Resources</span>
                    <span className="text-muted-foreground text-center">Get course materials and exercises</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gradient-card rounded-lg">
                    <Award className="w-6 h-6 text-primary mb-2" />
                    <span className="font-medium">Earn Certificate</span>
                    <span className="text-muted-foreground text-center">Complete the course for certification</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/courses')}
                  className="bg-gradient-primary"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                >
                  View My Courses
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;