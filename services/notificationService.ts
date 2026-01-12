
export interface FarcasterNotificationDetails {
  url: string;
  token: string;
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendSystemNotification = (title: string, body: string, icon?: string) => {
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon: icon || 'https://bsambh.app/icon.png',
        badge: 'https://bsambh.app/icon.png',
        tag: 'bsambh-alert'
      });
    } catch (e) {
      console.warn("System notification failed to trigger", e);
    }
  }
};

/**
 * Sends a notification via the Farcaster/Base Mini App protocol.
 * In a real app, the server would handle this. Here we simulate the POST request.
 */
export const sendFarcasterNotification = async (
  details: FarcasterNotificationDetails,
  title: string,
  body: string
) => {
  const appUrl = window.location.origin;
  
  try {
    const response = await fetch(details.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title: title.slice(0, 32),
        body: body.slice(0, 128),
        targetUrl: appUrl,
        tokens: [details.token],
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to send Farcaster notification:", error);
    return false;
  }
};

/**
 * Simulates the Farcaster/Base Mini App SDK notification opt-in.
 * Returns mock notification details as defined in Base documentation.
 */
export const simulateFarcasterNotificationOptIn = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    notificationDetails: {
      url: "https://api.farcaster.xyz/v1/frame-notifications",
      token: "sim_" + Math.random().toString(36).substring(7)
    }
  };
};
