
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
        notificationId: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now(),
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
 * Simulates market change notification logic.
 */
export const formatMarketAlert = (asset: string, change: number, price: number) => {
  const direction = change > 0 ? "🚀 Mooning" : "📉 Dipping";
  return {
    title: `${asset} ${direction}`,
    body: `${asset} just moved ${change > 0 ? '+' : ''}${change.toFixed(1)}% to $${price.toLocaleString()}. Check your positions on Base.`
  };
};

export const simulateFarcasterNotificationOptIn = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    notificationDetails: {
      url: "https://api.farcaster.xyz/v1/frame-notifications",
      token: "sim_" + Math.random().toString(36).substring(7)
    }
  };
};
