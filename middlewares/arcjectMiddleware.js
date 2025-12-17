import aj from "../config/arcject.js";

const arcjectm = async(req,res,next) =>{
    const decision = await aj.protect(req, { requested: 1 });
try {
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "No bots allowed." });
      } else {
        return res.status(403).json({ message: "Access denied." });
      }
    
        req.arcjet = decision;
        next();

    }
}catch(err){
        console.log(`Arcjet Middle erroe ${err}`);
        next(error);
    }

}
export default arcjectm;