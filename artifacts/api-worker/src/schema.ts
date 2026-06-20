import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const articlesTable = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  page2Featured: integer("page2_featured", { mode: "boolean" }).notNull().default(false),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  status: text("status").notNull().default("published"),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: text("photos", { mode: "json" }).$type<{ url: string; credit?: string }[]>(),
  publishedAt: text("published_at").notNull().$defaultFn(() => new Date().toISOString()),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const categoriesTable = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  showInEvents: integer("show_in_events", { mode: "boolean" }).notNull().default(false),
});

export const calendarEventsTable = sqliteTable("calendar_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  eventDate: text("event_date").notNull(),
  eventTime: text("event_time"),
  location: text("location"),
  description: text("description"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const churchesTable = sqliteTable("churches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  pastor: text("pastor").notNull(),
  serviceTimes: text("service_times").notNull(),
  phone: text("phone").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: text("photos", { mode: "json" }).$type<{ url: string; credit?: string }[]>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const businessSpotlightTable = sqliteTable("business_spotlight", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: text("photos", { mode: "json" }).$type<{ url: string; credit?: string }[]>(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const groupSpotlightTable = sqliteTable("group_spotlight", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  groupType: text("group_type").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: text("photos", { mode: "json" }).$type<{ url: string; credit?: string }[]>(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const studentSpotlightTable = sqliteTable("student_spotlight", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  school: text("school").notNull(),
  grade: text("grade").notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  photoCredit: text("photo_credit"),
  photos: text("photos", { mode: "json" }).$type<{ url: string; credit?: string }[]>(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const newsletterSubscribersTable = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  subscribedAt: text("subscribed_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const userRolesTable = sqliteTable("user_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  role: text("role").notNull().default("approved_user"),
  grantedAt: text("granted_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const aboutContentTable = sqliteTable("about_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  foundingYear: text("founding_year").notNull().default("1924"),
  body: text("body").notNull().default(""),
  editorialStaff: text("editorial_staff").notNull().default("[]"),
  officeLocation: text("office_location").notNull().default("Main Street"),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const issueSettingsTable = sqliteTable("issue_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  issueNumber: text("issue_number").notNull().default("01"),
  issueYear: integer("issue_year").notNull().default(2026),
  issueMonth: integer("issue_month").notNull().default(5),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const comicsTable = sqliteTable("comics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url"),
  caption: text("caption"),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const puzzlesTable = sqliteTable("puzzles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  crosswordUrl: text("crossword_url"),
  wordSearchUrl: text("word_search_url"),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});
