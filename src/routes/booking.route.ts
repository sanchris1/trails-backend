import { Router } from "express";
import { bookExpedition } from "../controllers/booking/bookExpedition.js";
import { addBookingParticipants } from "../controllers/booking/addBookingParticipants.js";
import { cancelBooking } from "../controllers/booking/cancelBooking.js";

export const bookingRoute = Router();

bookingRoute.post("/book/:expeditionId", bookExpedition);
bookingRoute.post("/participants/:bookingId", addBookingParticipants);
bookingRoute.put("/cancel/:bookingId", cancelBooking);
