import Joi from "joi";
import { CONTEST_CATEGORIES, WINNER_TIERS } from "../../../contest.config.mjs";

export const winnerSchema = Joi.object({
  userId: Joi.string().required(),
  tier: Joi.string().valid(...WINNER_TIERS).required(),
  category: Joi.string().valid(...CONTEST_CATEGORIES).allow(null),
  score: Joi.number().required(),
});

export const winnerQuerySchema = Joi.object({
  tier: Joi.string().valid(...WINNER_TIERS),
});

export const idParamSchema = Joi.object({
  id: Joi.string().min(1),
  rankingRunId: Joi.string().min(1),
}).or("id", "rankingRunId");
