import aj from "../config/arcject.js";

const arcjectm = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res
          .status(429)
          .json({ message: "Too many requests. Please try again later." });
      }
      if (decision.reason.isBot()) {
        return res.status(403).json({ message: "No bots allowed." });
      }
      return res.status(403).json({ message: "Access denied." });
    }

    req.arcjet = decision;
    return next();
  } catch (err) {
    console.log(`Arcjet middleware error: ${err.message}`);
    return next(err);
  }
};
export default arcjectm;
