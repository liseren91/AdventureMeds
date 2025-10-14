import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const aiServices = pgTable("ai_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description").notNull(),
  category: text("category").notNull(),
  price: text("price").notNull(),
  rating: text("rating").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  features: text("features").array().notNull(),
  pricingTiers: jsonb("pricing_tiers").notNull(),
  useCases: text("use_cases").array().notNull(),
  website: text("website"),
  popularity: integer("popularity").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAiServiceSchema = createInsertSchema(aiServices).omit({
  id: true,
  createdAt: true,
});

export type InsertAiService = z.infer<typeof insertAiServiceSchema>;
export type AiService = typeof aiServices.$inferSelect;

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

export const viewHistory = pgTable("view_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  serviceId: varchar("service_id").notNull(),
  viewedAt: timestamp("viewed_at").notNull().defaultNow(),
});

export const insertViewHistorySchema = createInsertSchema(viewHistory).omit({
  id: true,
  viewedAt: true,
});

export type InsertViewHistory = z.infer<typeof insertViewHistorySchema>;
export type ViewHistory = typeof viewHistory.$inferSelect;

export const comparisons = pgTable("comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  serviceIds: text("service_ids").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertComparisonSchema = createInsertSchema(comparisons).omit({
  id: true,
  createdAt: true,
});

export type InsertComparison = z.infer<typeof insertComparisonSchema>;
export type Comparison = typeof comparisons.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  message: text("message").notNull(),
  category: text("category"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
