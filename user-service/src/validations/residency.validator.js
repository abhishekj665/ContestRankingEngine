import Joi from "joi";

export const residency = Joi.object({
  residency: Joi.string().min(2).max(100).required(),
});
