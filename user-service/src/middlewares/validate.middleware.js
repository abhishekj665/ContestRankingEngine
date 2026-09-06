export const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: true,
      stripUnknown: true,
    });

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
      });
    }

    if (property === "query") {
      req.validatedQuery = value;
    } else {
      req[property] = value;
    }
    next();
  };
