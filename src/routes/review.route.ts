import { Router } from "express";
import { addReview } from "../controllers/reviews/addReviews.js";
import { checkUser } from "../middleware/checkUserMiddleware.js";
import { updateReview } from "../controllers/reviews/updateReviews.js";
import { deleteReviews } from "../controllers/reviews/deleteReviews.js";
import { fetchExpeditionReviews } from "../controllers/reviews/fetchExpeditionReviews.js";

export const reviewRoute = Router();

reviewRoute.post("/add/:expeditionId", checkUser, addReview);
reviewRoute.get("/fetch/:expeditionId", fetchExpeditionReviews);
reviewRoute.put("/update/:expeditionId", checkUser, updateReview);
reviewRoute.delete("/delete/:expeditionId", checkUser, deleteReviews);
