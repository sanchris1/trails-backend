import { Router } from "express";
import { bookExpedition } from "../controllers/booking/bookExpedition.js";
import { cancelBooking } from "../controllers/booking/cancelBooking.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchAllBookings } from "../controllers/booking/fetchAllBookings.js";
import { fetchUserBookings } from "../controllers/booking/fetchUserBookings.js";
import { fetchBookingDetails } from "../controllers/booking/fetchBookingDetails.js";
import { fetchUserMpesaReceiptNumber } from "../controllers/booking/fetchMpesaReceiptInformation.js";

export const bookingRoute = Router();

bookingRoute.post("/book", bookExpedition);
bookingRoute.put("/cancel/:bookingId", cancelBooking);
bookingRoute.get("/fetch/:bookingId", fetchBookingDetails);
bookingRoute.get(
  "/fetch",

  requireRole,
  fetchAllBookings,
);
bookingRoute.get("/fetch", fetchUserBookings);
bookingRoute.post("/receipt", fetchUserMpesaReceiptNumber);
