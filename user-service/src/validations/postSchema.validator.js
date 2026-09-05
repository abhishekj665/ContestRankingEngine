import Joi from "joi";
export const postSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  caption: Joi.string().min(10).max(5000),
  category: Joi.string()
    .valid(
      "Technology",
      "Education",
      "Sports",
      "Entertainment",
      "Travel",
      "Food",
      "Fashion",
      "Fitness",
      "Business",
      "Lifestyle",
    )
    .required(),
  media: Joi.string().uri().required(),
});
