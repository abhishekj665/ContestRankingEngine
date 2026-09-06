import Joi from "joi";
export const authSchema = Joi.object({
  email: Joi.string().email(),
  username: Joi.string().alphanum().min(3).max(30),
  password: Joi.string().min(6).max(72).required(),
}).xor("email", "username");
