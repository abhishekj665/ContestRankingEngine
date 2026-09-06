import Joi from "joi";
import { CONTEST_CATEGORIES } from "../config/contest.config.js";
export const postSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  caption: Joi.string().min(10).max(5000),
  category: Joi.string()
    .valid(...CONTEST_CATEGORIES)
    .required(),
});
