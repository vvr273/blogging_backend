import { randomUUID } from "crypto";

export const requestContext = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);

  res.apiSuccess = (data = null, message = "OK", meta = {}) =>
    res.json({
      success: true,
      message,
      data,
      requestId: req.requestId,
      ...meta,
    });

  next();
};
