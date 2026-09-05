import Joi from "joi";

export const adminLoginSchema = Joi.object({
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(1).required(),
});
