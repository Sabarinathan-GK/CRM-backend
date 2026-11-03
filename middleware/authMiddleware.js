const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const asyncHandler = require("../util/asyncHandler");

const protect = asyncHandler( async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        res.status(401);
        
        throw new Error("Not authorized. token is required.")
    }

    const token = authHeader.split(" ")[1];

    let decoded;

    try{
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    }catch(error){
        res.status(401);
        throw new Error("Invalid or expired token");
    }

    //verify that the user still exists and is active
    const user = await User.findById(decoded.userId).select("_id role isActive");

    if(!user){
        res.status(401);
        throw new Error("User account no longer exists");
    }

    if(!user.isActive){
        res.status(403);
        throw new Error("Your account has been deactivatd.");
    }

    //Always use current database role, not the token's old role
    req.user = {
        userId : user._id.toString(),
        role : user.role
    }

    next();
});

module.exports = protect;