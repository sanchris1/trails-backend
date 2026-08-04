import { Router } from "express";
import { bookExpedition } from "../controllers/booking/bookExpedition.js";
import { addBookingParticipants } from "../controllers/booking/addBookingParticipants.js";
import { cancelBooking } from "../controllers/booking/cancelBooking.js";
import { requireRole } from "../middleware/requireRoleMiddleware.js";
import { fetchAllBookings } from "../controllers/booking/fetchAllBookings.js";
import { fetchUserBookings } from "../controllers/booking/fetchUserBookings.js";
import { fetchBookingDetails } from "../controllers/booking/fetchBookingDetails.js";

export const bookingRoute = Router();

bookingRoute.post("/book/:expeditionId", bookExpedition);
bookingRoute.post("/participants/:bookingId", addBookingParticipants);
bookingRoute.put("/cancel/:bookingId", cancelBooking);
bookingRoute.get("/fetch/:bookingId", fetchBookingDetails);
bookingRoute.get(
  "/fetch-all",

  requireRole("admin"),
  fetchAllBookings,
);
bookingRoute.get("/fetch", fetchUserBookings);
