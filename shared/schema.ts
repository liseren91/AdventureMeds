import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean } from "drizzle-orm/pg-core";
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
  category: text("category").notNull(),
  price: text("price").notNull(),
  rating: text("rating").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertAiServiceSchema = createInsertSchema(aiServices).omit({
  id: true,
});

export type InsertAiService = z.infer<typeof insertAiServiceSchema>;
export type AiService = typeof aiServices.$inferSelect;
