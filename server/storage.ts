import {
  type User,
  type InsertUser,
  type AiService,
  type InsertAiService,
  type Favorite,
  type InsertFavorite,
  type ViewHistory,
  type InsertViewHistory,
  type Comparison,
  type InsertComparison,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getAllServices(): Promise<AiService[]>;
  getService(id: string): Promise<AiService | undefined>;
  createService(service: InsertAiService): Promise<AiService>;

  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, serviceId: string): Promise<void>;

  getViewHistory(userId: string): Promise<ViewHistory[]>;
  addViewHistory(viewHistory: InsertViewHistory): Promise<ViewHistory>;

  getComparisons(userId: string): Promise<Comparison[]>;
  saveComparison(comparison: InsertComparison): Promise<Comparison>;

  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private services: Map<string, AiService>;
  private favorites: Map<string, Favorite>;
  private viewHistory: Map<string, ViewHistory>;
  private comparisons: Map<string, Comparison>;
  private notifications: Map<string, Notification>;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.favorites = new Map();
    this.viewHistory = new Map();
    this.comparisons = new Map();
    this.notifications = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllServices(): Promise<AiService[]> {
    return Array.from(this.services.values());
  }

  async getService(id: string): Promise<AiService | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertAiService): Promise<AiService> {
    const id = randomUUID();
    const service: AiService = {
      ...insertService,
      id,
      website: insertService.website ?? null,
      popularity: insertService.popularity ?? 0,
      createdAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (fav) => fav.userId === userId,
    );
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = {
      ...insertFavorite,
      id,
      createdAt: new Date(),
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, serviceId: string): Promise<void> {
    const favorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.serviceId === serviceId,
    );
    if (favorite) {
      this.favorites.delete(favorite.id);
    }
  }

  async getViewHistory(userId: string): Promise<ViewHistory[]> {
    return Array.from(this.viewHistory.values())
      .filter((view) => view.userId === userId)
      .sort((a, b) => b.viewedAt.getTime() - a.viewedAt.getTime());
  }

  async addViewHistory(insertViewHistory: InsertViewHistory): Promise<ViewHistory> {
    const id = randomUUID();
    const viewHistory: ViewHistory = {
      ...insertViewHistory,
      id,
      viewedAt: new Date(),
    };
    this.viewHistory.set(id, viewHistory);
    return viewHistory;
  }

  async getComparisons(userId: string): Promise<Comparison[]> {
    return Array.from(this.comparisons.values()).filter(
      (comp) => comp.userId === userId,
    );
  }

  async saveComparison(insertComparison: InsertComparison): Promise<Comparison> {
    const id = randomUUID();
    const comparison: Comparison = {
      ...insertComparison,
      id,
      createdAt: new Date(),
    };
    this.comparisons.set(id, comparison);
    return comparison;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      category: insertNotification.category ?? null,
      isRead: insertNotification.isRead ?? false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.isRead = true;
    }
  }
}

export const storage = new MemStorage();
