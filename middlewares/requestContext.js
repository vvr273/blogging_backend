import { randomUUID } from "crypto";

export const requestContext = (req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader("x-request-id", req.requestId);
  const originalJson = res.json.bind(res);

  res.apiSuccess = (data = null, message = "OK", meta = {}) =>
    originalJson({
      success: true,
      message,
      data,
      requestId: req.requestId,
      ...meta,
    });

  res.apiError = (status = 400, message = "Request failed", code = "REQUEST_ERROR", details = [], data = null) =>
    res.status(status).json({
      success: false,
      message,
      code,
      details,
      data,
      requestId: req.requestId,
    });

  res.json = (body) => {
    const statusCode = res.statusCode || 200;
    const isError = statusCode >= 400;

    if (body && typeof body === "object" && Object.prototype.hasOwnProperty.call(body, "success")) {
      return originalJson({
        requestId: req.requestId,
        ...body,
      });
    }

    if (isError) {
      const message = body?.message || "Request failed";
      const code = body?.code || (statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR");
      const details = Array.isArray(body?.details) ? body.details : [];
      return originalJson({
        success: false,
        message,
        code,
        details,
        data: body || null,
        requestId: req.requestId,
      });
    }

    if (body === null || body === undefined) {
      return originalJson({
        success: true,
        message: "OK",
        data: null,
        requestId: req.requestId,
      });
    }

    if (Array.isArray(body)) {
      return originalJson({
        success: true,
        message: "OK",
        data: body,
        requestId: req.requestId,
      });
    }

    if (typeof body === "object") {
      const message = typeof body.message === "string" ? body.message : "OK";
      const rest = { ...body };
      if (typeof rest.message === "string") delete rest.message;
      return originalJson({
        success: true,
        message,
        data: rest,
        requestId: req.requestId,
      });
    }

    return originalJson({
      success: true,
      message: "OK",
      data: body,
      requestId: req.requestId,
    });
  };

  next();
};
