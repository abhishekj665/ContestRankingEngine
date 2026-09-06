export const globalErrorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ status: "error", message: "Media files must be 10 MB or smaller" });
  }
  err.statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
