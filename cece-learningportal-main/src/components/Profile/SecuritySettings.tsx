import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import userService from "@/services/userService";
import { Shield, Key, Smartphone, History, AlertCircle, Check, X } from "lucide-react";

export const SecuritySettings = () => {
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Password strength validation
  const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("At least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("At least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("At least one special character");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Get password strength percentage
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
    return strength;
  };

  // Get password strength label
  const getPasswordStrengthLabel = (password: string): string => {
    const strength = getPasswordStrength(password);
    if (strength < 40) return "Weak";
    if (strength < 70) return "Fair";
    if (strength < 90) return "Good";
    return "Strong";
  };

  // Get password requirements with status
  const getPasswordRequirements = (password: string) => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Lowercase letter", met: /[a-z]/.test(password) },
      { label: "Number", met: /[0-9]/.test(password) },
      { label: "Special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  };

  const handlePasswordChange = async () => {
    // Validate all fields are filled
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    // Check if passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    // Check if new password is same as current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from current password.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const validation = validatePasswordStrength(passwordForm.newPassword);
    if (!validation.isValid) {
      toast({
        title: "Weak Password",
        description: `Password must have: ${validation.errors.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.error) {
        // Handle specific error messages
        let errorMessage = response.error;
        if (response.error.includes("401") || response.error.toLowerCase().includes("unauthorized")) {
          errorMessage = "Current password is incorrect";
        } else if (response.error.includes("404")) {
          errorMessage = "Password change service is temporarily unavailable";
        }
        
        toast({
          title: "Password Change Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Changed Successfully",
          description: "Your password has been updated. Please use your new password for future logins.",
        });
        setShowPasswordForm(false);
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast({
      title: twoFactorEnabled ? "2FA Disabled" : "2FA Enabled",
      description: twoFactorEnabled 
        ? "Two-factor authentication has been disabled." 
        : "Two-factor authentication has been enabled.",
    });
  };

  const loginHistory = [
    { id: 1, device: "Chrome on MacOS", location: "San Francisco, CA", time: "2 hours ago", current: true },
    { id: 2, device: "Safari on iPhone", location: "San Francisco, CA", time: "1 day ago", current: false },
    { id: 3, device: "Chrome on Windows", location: "New York, NY", time: "3 days ago", current: false },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value
                  })}
                />
                {passwordForm.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={getPasswordStrength(passwordForm.newPassword)} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-muted-foreground">
                        {getPasswordStrengthLabel(passwordForm.newPassword)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {getPasswordRequirements(passwordForm.newPassword).map((req, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-red-500" />
                          )}
                          <span className={req.met ? "text-green-500" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value
                  })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange}>
                  Update Password
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-medium">Enable 2FA</div>
              <div className="text-sm text-muted-foreground">
                Require a verification code in addition to your password
              </div>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={handleToggle2FA}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Scan the QR code with your authenticator app to set up 2FA
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Login History
          </CardTitle>
          <CardDescription>
            Recent login activity on your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loginHistory.map((login) => (
              <div key={login.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="space-y-1">
                  <div className="font-medium flex items-center gap-2">
                    {login.device}
                    {login.current && (
                      <Badge variant="outline" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {login.location} • {login.time}
                  </div>
                </div>
                {!login.current && (
                  <Button variant="ghost" size="sm">
                    Sign Out
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;