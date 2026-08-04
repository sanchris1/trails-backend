import { relations } from "drizzle-orm/_relations";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  uuid,
  varchar,
  integer,
  date,
} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("role", ["user", "admin"]);
export const expeditionStatusEnum = pgEnum("expedition_status", [
  "scheduled",
  "ongoing",
  "cancelled",
  "completed",
]);
export const bookingStatusEnum = pgEnum("booking_status_enum", [
  "pending",
  "cancelled",
  "confirmed",
]);

export const paymentStatusEnum = pgEnum("payment_status_enum", [
  "pending",
  "partially_paid",
  "paid",
  "failed",
  "refunded",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  role: UserRole("user_role").default("user"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const adventure = pgTable(
  "adventure",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    shortDescription: varchar("short_description", { length: 255 }),
    location: text("location").notNull(),
    duration: text("duration").notNull(),
    defaultPrice: integer("default_price").notNull(),
    defaultCapacity: integer("default_capacity").notNull(),
    isActive: boolean("is_active").default(true),
    coverImage: text("cover_image").notNull(),
    coverImagePublicId: text("cover_image_public_id").notNull(),
    elevationGain: integer("elevation_gain"),
    difficulty: text("difficulty").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("adventure_id_index").on(table.id),
    index("adventure_location_index").on(table.location),
  ],
);

export const expedition = pgTable(
  "expedition",
  {
    id: uuid("expedition_id").primaryKey().defaultRandom(),
    adventureId: uuid("adventure_id")
      .notNull()
      .references(() => adventure.id, { onDelete: "cascade" }),
    departureDate: date("departure_date").notNull(),
    departureTime: timestamp("departure_time").notNull(),
    returnDate: date("return_date").notNull(),
    returnTime: timestamp("return_time"),
    meetingPoint: text("meeting_point").notNull(),
    guide: text("guide").references(() => user.id, { onDelete: "cascade" }),
    expeditionStatus: expeditionStatusEnum("expedition_status")
      .default("scheduled")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("expedition_index").on(table.id)],
);

export const bookings = pgTable("bookings", {
  id: uuid("bookings_id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => user.id)
    .unique(),
  expeditionId: uuid("expedition_id")
    .notNull()
    .references(() => expedition.id, { onDelete: "cascade" }),
  bookingStatus: bookingStatusEnum("booking_status").default("pending"),
  numberOfParticipants: integer("number_of_participants").default(1),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),
  totalAmount: integer("total_amount").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookingParticipants = pgTable(
  "booking_participants",
  {
    id: uuid("booking_participants_id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: varchar("phone").notNull(),
    medicalNotes: text("medical_notes"),
    emergencyContact: varchar("emergency_contact").notNull(),
  },
  (table) => [index("booking_participants_booking_idx").on(table.bookingId)],
);

export const notification = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("notification_type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gallery = pgTable("gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  expeditionId: uuid("expedition_id")
    .notNull()
    .references(() => expedition.id),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id").notNull(),
  caption: text("caption").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});
