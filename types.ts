
import React from 'react';

export enum AppTab {
  SWAP = 'swap',
  EARN = 'earn',
  NFT = 'nft',
  AI_CHAT = 'ai_chat',
  AI_IMAGE = 'ai_image',
  BRIDGE = 'bridge'
}

export interface NFTItem {
  id: string;
  name: string;
  creator: string;
  price: string;
  image: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export type NotificationType = 'success' | 'info' | 'error';

export type AppIconName = 'zap' | 'rocket' | 'waves' | 'trending-up' | 'trending-down' | 'image' | 'check' | 'alert' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  iconName?: AppIconName;
  icon?: React.ReactNode;
}
