export const globalErrorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ success: false, message: "Videos must be 50 MB or smaller" });
  }
  err.statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
