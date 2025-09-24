import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSignalR } from "../../hooks/useSignalR";
import { useToast } from "../../hooks/use-toast";
import { Send, Users, User as UserIcon } from "lucide-react";

export function NotificationManager() {
  const { sendNotificationToUser, sendNotificationToRole, isConnected } = useSignalR();
  const { toast } = useToast();
  const [notificationType, setNotificationType] = useState<"user" | "role">("role");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>("Student");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please enter both title and message",
        variant: "destructive",
      });
      return;
    }

    if (notificationType === "user" && !userId) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      if (notificationType === "user") {
        await sendNotificationToUser(userId, title, message);
      } else {
        await sendNotificationToRole(role, title, message);
      }

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });

      // Reset form
      setTitle("");
      setMessage("");
      setUserId("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Notification</CardTitle>
        <CardDescription>
          Send real-time notifications to users or roles
          {!isConnected && (
            <span className="text-destructive ml-2">(Not connected to server)</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Notification Type</Label>
            <Select
              value={notificationType}
              onValueChange={(value) => setNotificationType(value as "user" | "role")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Specific User
                  </div>
                </SelectItem>
                <SelectItem value="role">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Role-based
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {notificationType === "user" ? (
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Instructor">Instructor</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Notification message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!isConnected || isSending}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}