import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import userService from "@/services/userService";
import { Bell, Mail, MessageSquare, Calendar, Award, DollarSign, BookOpen, UserPlus, Star, Tag } from "lucide-react";

export const NotificationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email: {
      courseUpdates: true,
      newEnrollments: true,
      reviews: true,
      systemUpdates: false,
      marketing: false
    },
    inApp: {
      courseUpdates: true,
      newEnrollments: true,
      reviews: true,
      systemUpdates: true,
      marketing: true
    }
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await userService.getNotificationPreferences();
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (channel: 'email' | 'inApp', setting: string) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...(prev[channel] || {}),
        [setting]: !(prev[channel]?.[setting] ?? false)
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await userService.updateNotificationPreferences(preferences);
      if (response.data) {
        toast({
          title: "Preferences Updated",
          description: "Your notification preferences have been saved.",
        });
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { 
      key: 'courseUpdates', 
      label: 'Course Updates', 
      description: 'New lessons, content updates, and announcements',
      icon: <BookOpen className="w-4 h-4" />
    },
    { 
      key: 'newEnrollments', 
      label: 'New Enrollments', 
      description: 'When students enroll in your courses',
      icon: <UserPlus className="w-4 h-4" />
    },
    { 
      key: 'reviews', 
      label: 'Reviews & Ratings', 
      description: 'New reviews and ratings on your courses',
      icon: <Star className="w-4 h-4" />
    },
    { 
      key: 'systemUpdates', 
      label: 'System Updates', 
      description: 'Platform updates and maintenance notifications',
      icon: <Bell className="w-4 h-4" />
    },
    { 
      key: 'marketing', 
      label: 'Marketing & Promotions', 
      description: 'Special offers and promotional content',
      icon: <Tag className="w-4 h-4" />
    }
  ];

  if (loading) {
    return <div>Loading notification preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, label, description, icon }) => (
            <div key={key} className="flex items-center justify-between space-x-2">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 text-muted-foreground">{icon}</div>
                <div className="space-y-0.5">
                  <Label htmlFor={`email-${key}`} className="font-medium">
                    {label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                id={`email-${key}`}
                checked={preferences.email?.[key] ?? false}
                onCheckedChange={() => handleToggle('email', key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Choose which notifications you want to see in the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationTypes.map(({ key, label, description, icon }) => (
            <div key={key} className="flex items-center justify-between space-x-2">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 text-muted-foreground">{icon}</div>
                <div className="space-y-0.5">
                  <Label htmlFor={`inapp-${key}`} className="font-medium">
                    {label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                id={`inapp-${key}`}
                checked={preferences.inApp?.[key] ?? false}
                onCheckedChange={() => handleToggle('inApp', key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};