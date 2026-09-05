import Joi from "joi";
export const commentSchema = Joi.object({
    content: Joi.string().min(1).max(500).required(),
});