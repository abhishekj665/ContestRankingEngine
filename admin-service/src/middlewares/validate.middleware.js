import { errorResponse } from "../utils/response.util.js";

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source]);

    if (error) {
      return errorResponse(res, error.message, 400);
    }

    if (source === "query") {
      Object.keys(req.query).forEach((key) => delete req.query[key]);
      Object.assign(req.query, value);
    } else {
      req[source] = value;
    }

    next();
  };
