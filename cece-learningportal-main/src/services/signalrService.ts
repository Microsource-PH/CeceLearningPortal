import * as signalR from "@microsoft/signalr";
import { api } from "./api";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionPromise: Promise<void> | null = null;

  async connect(token: string): Promise<void> {
    if (this.connection) {
      return;
    }

    const baseUrl = import.meta.env.VITE_API_URL || "";
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Setup event handlers
    this.connection.onreconnecting(() => {
      console.log("SignalR reconnecting...");
    });

    this.connection.onreconnected(() => {
      console.log("SignalR reconnected");
    });

    this.connection.onclose(() => {
      console.log("SignalR connection closed");
    });

    // Start connection
    this.connectionPromise = this.connection.start();
    
    try {
      await this.connectionPromise;
      console.log("SignalR connected");
    } catch (err) {
      console.error("SignalR connection failed:", err);
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionPromise = null;
    }
  }

  onNotification(callback: (notification: any) => void): void {
    if (!this.connection) {
      console.error("SignalR not connected");
      return;
    }

    this.connection.on("ReceiveNotification", callback);
  }

  offNotification(callback: (notification: any) => void): void {
    if (!this.connection) {
      return;
    }

    this.connection.off("ReceiveNotification", callback);
  }

  async sendNotificationToUser(userId: string, title: string, message: string): Promise<void> {
    if (!this.connection) {
      console.error("SignalR not connected");
      return;
    }

    await this.connectionPromise;
    await this.connection.invoke("SendNotificationToUser", userId, title, message);
  }

  async sendNotificationToRole(role: string, title: string, message: string): Promise<void> {
    if (!this.connection) {
      console.error("SignalR not connected");
      return;
    }

    await this.connectionPromise;
    await this.connection.invoke("SendNotificationToRole", role, title, message);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    if (!this.connection) {
      console.error("SignalR not connected");
      return;
    }

    await this.connectionPromise;
    await this.connection.invoke("MarkNotificationAsRead", notificationId);
  }

  onNotificationRead(callback: (notificationId: number) => void): void {
    if (!this.connection) {
      console.error("SignalR not connected");
      return;
    }

    this.connection.on("NotificationRead", callback);
  }

  getConnectionState(): signalR.HubConnectionState {
    return this.connection?.state || signalR.HubConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
export default signalRService;