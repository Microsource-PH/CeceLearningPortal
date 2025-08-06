import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Download, Calendar, DollarSign, Package, AlertCircle } from "lucide-react";

export const BillingSettings = () => {
  const { toast } = useToast();
  
  const subscription = {
    plan: "Pro Plan",
    status: "active",
    price: "₱1,499/month",
    nextBilling: "2025-02-25",
    features: [
      "Unlimited course enrollments",
      "Download certificates",
      "Priority support",
      "Advanced analytics"
    ]
  };

  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8888",
      expiry: "09/26",
      isDefault: false
    }
  ];

  const billingHistory = [
    {
      id: 1,
      date: "2025-01-25",
      description: "Pro Plan - Monthly",
      amount: "₱1,499",
      status: "paid",
      invoice: "INV-2025-001"
    },
    {
      id: 2,
      date: "2024-12-25",
      description: "Pro Plan - Monthly",
      amount: "₱1,499",
      status: "paid",
      invoice: "INV-2024-012"
    },
    {
      id: 3,
      date: "2024-11-25",
      description: "Pro Plan - Monthly",
      amount: "₱1,499",
      status: "paid",
      invoice: "INV-2024-011"
    }
  ];

  const handleChangePlan = () => {
    toast({
      title: "Change Plan",
      description: "Redirecting to plan selection...",
    });
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Cancel Subscription",
      description: "Are you sure you want to cancel your subscription?",
      variant: "destructive",
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Downloading Invoice",
      description: `Downloading invoice ${invoiceId}...`,
    });
  };

  const handleAddPaymentMethod = () => {
    toast({
      title: "Add Payment Method",
      description: "Opening payment method form...",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription plan and features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{subscription.plan}</h3>
                <p className="text-muted-foreground">{subscription.price}</p>
              </div>
              <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                {subscription.status}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Next billing date: {new Date(subscription.nextBilling).toLocaleDateString()}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Included features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleChangePlan}>
                Change Plan
              </Button>
              <Button variant="outline" onClick={handleCancelSubscription}>
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {method.type} ending in {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.expiry}
                    </div>
                  </div>
                  {method.isDefault && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddPaymentMethod}
            >
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Billing History
          </CardTitle>
          <CardDescription>
            Your recent transactions and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingHistory.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="space-y-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{transaction.amount}</div>
                    <Badge 
                      variant={transaction.status === "paid" ? "outline" : "secondary"}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadInvoice(transaction.invoice)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Alert */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-orange-900 dark:text-orange-100">
                Usage Alert
              </p>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                You've used 85% of your monthly course enrollment limit. Consider upgrading your plan for unlimited access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingSettings;