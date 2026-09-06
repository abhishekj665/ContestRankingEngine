import Joi from "joi";
import { CONTEST_CATEGORIES } from "../config/contest.config.js";

export const postQuerySchema = Joi.object({
  category: Joi.string().valid(...CONTEST_CATEGORIES),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});
