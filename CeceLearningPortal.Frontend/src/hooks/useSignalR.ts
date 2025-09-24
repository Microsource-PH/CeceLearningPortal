import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { signalRService } from "../services/signalrService";
import { useToast } from "./use-toast";

interface Notification {
  id?: number;
  title: string;
  message: string;
  timestamp: Date;
  isRead?: boolean;
}

export function useSignalR() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Connect to SignalR when user logs in
  useEffect(() => {
    if (user && token) {
      signalRService
        .connect(token)
        .then(() => {
          setIsConnected(true);
        })
        .catch((err) => {
          console.error("Failed to connect to SignalR:", err);
          toast({
            title: "Connection Error",
            description: "Failed to connect to real-time notifications",
            variant: "destructive",
          });
        });

      return () => {
        signalRService.disconnect();
        setIsConnected(false);
      };
    }
  }, [user, token, toast]);

  // Listen for notifications
  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (notification: Notification) => {
      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    const handleNotificationRead = (notificationId: number) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    };

    signalRService.onNotification(handleNotification);
    signalRService.onNotificationRead(handleNotificationRead);

    return () => {
      signalRService.offNotification(handleNotification);
    };
  }, [isConnected, toast]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await signalRService.markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const sendNotificationToUser = useCallback(
    async (userId: string, title: string, message: string) => {
      try {
        await signalRService.sendNotificationToUser(userId, title, message);
      } catch (err) {
        console.error("Failed to send notification:", err);
        toast({
          title: "Error",
          description: "Failed to send notification",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const sendNotificationToRole = useCallback(
    async (role: string, title: string, message: string) => {
      try {
        await signalRService.sendNotificationToRole(role, title, message);
      } catch (err) {
        console.error("Failed to send notification:", err);
        toast({
          title: "Error",
          description: "Failed to send notification",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  return {
    isConnected,
    notifications,
    markAsRead,
    sendNotificationToUser,
    sendNotificationToRole,
  };
}