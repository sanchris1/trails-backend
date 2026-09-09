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
  uniqueIndex,
  jsonb,
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

export const merchandiseSizesEnum = pgEnum("merchandise_sizes_enum", [
  "Small",
  "Medium",
  "Large",
  "XL",
  "XXL",
  "Custom",
]);

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  role: UserRole("role").default("user"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

export const refreshTokens = pgTable("refresh_token", {
  id: uuid("refresh_token_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
    expeditionTitle: text("expedition_title"),
    departureDate: date("departure_date").notNull(),
    departureTime: timestamp("departure_time").notNull(),
    returnDate: date("return_date").notNull(),
    returnTime: timestamp("return_time"),
    meetingPoint: text("meeting_point").notNull(),
    guide: text("guide").notNull(),
    guideContact: text("guide_contact").notNull(),
    featured: boolean("featured").default(false),
    expeditionStatus: expeditionStatusEnum("expedition_status")
      .default("scheduled")
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("expedition_index").on(table.id)],
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("bookings_id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => user.id),
    expeditionId: uuid("expedition_id")
      .notNull()
      .references(() => expedition.id, { onDelete: "cascade" }),
    bookingStatus: bookingStatusEnum("booking_status").default("pending"),
    numberOfParticipants: integer("number_of_participants").default(1),
    paymentStatus: paymentStatusEnum("payment_status").default("pending"),
    totalAmount: integer("total_amount").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("booking_id_index").on(table.id)],
);

export const bookingParticipants = pgTable(
  "booking_participants",
  {
    id: uuid("booking_participants_id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: varchar("phone").notNull(),
    medicalNotes: text("medical_notes"),
    emergencyContact: varchar("emergency_contact").notNull(),
  },
  (table) => [index("booking_participants_booking_idx").on(table.bookingId)],
);

export const notification = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
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
    .references(() => expedition.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id").notNull(),
  caption: text("caption").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const favorites = pgTable("favorites", {
  id: uuid("favorites_id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  adventureId: uuid("adventure_id")
    .notNull()
    .references(() => adventure.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("reviews_id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expeditionId: uuid("expedition_id")
      .notNull()
      .references(() => expedition.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull().default(1),
    comment: text("comment").default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [uniqueIndex("review_index").on(table.expeditionId, table.userId)],
);

export const merchandise = pgTable(
  "merchandise",
  {
    id: uuid("merchandise").primaryKey().defaultRandom(),
    title: text("merchandise_title").notNull(),
    price: integer("merchandise_price").notNull(),
    category: text("category").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index("merchandise_index").on(table.id)],
);

export const merchandiseColors = pgTable("merchandise_colors", {
  id: uuid("merchandise_color_id").primaryKey().defaultRandom(),
  colors: text("merchandise_colors").array().notNull(),
  merchandiseId: uuid("merchandise_id")
    .notNull()
    .references(() => merchandise.id, { onDelete: "cascade" }),
});

export const merchandiseImages = pgTable("merchandise_images", {
  id: uuid("merchandise_images_id").primaryKey().defaultRandom(),
  images: jsonb("merchandise_images")
    .$type<{ url: string; publicId: string }[]>()
    .notNull()
    .default([]),

  merchandiseId: uuid("merchandise_id")
    .notNull()
    .references(() => merchandise.id, { onDelete: "cascade" }),
});

export const favoriteMerchandise = pgTable(
  "favorite_merchandise",
  {
    id: uuid("favorite_merchandise_id").defaultRandom().primaryKey(),
    merchandiseId: uuid("merchandise_id")
      .notNull()
      .references(() => merchandise.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index("favorite_merchandise_index").on(table.id)],
);
