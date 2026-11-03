const User = require("../models/Users");
const asyncHandler = require("../util/asyncHandler");


const getProfile = async (req, res, next) => {
    try{
        res.status(200).json({
            success : true, 
            message : "Protected Profile API accessed Successfully",
            user : req.user
        });
    } catch(error){
        next(error);
    }
}



//get all users - admin only
const getAllUsers = asyncHandler( async (req, res) =>{
    const users = await User.find()
    .select("-password")
    .sort({ createAt : -1 });

    res.status(200).json({
        success : true,
        count : user.length,
        users
    });
});

//Activate or deactivate a user - admin only
const updateUserStatus = asyncHandler(async (req, res)=>{
    const { isActive } = req.body;
    
    if(typeof isActive !== "boolean"){
        return res.status(400).json({
            success : false,
            message : "isActive must be true or false"
        });
    }
    
    const user = await User.findById(req.params.id);

    if(!user){
        return res.status(404).json({
            success : false,
            message : "User not found"
        });
    }

    //Prevent an admin from deactivating their own account
    if(user._id.toString() === req.user.userId && isActive === false){
        return res.status(400).json({
            success : false,
            message : "You cannot deactivate your own account"
        });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
        success : true,
        message : `User ${isActive ? "activated" : "deactivated"} successfully`,
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            isActive : user.isActive
        }
    });
})

module.exports = {
    getProfile,
    getAllUsers,
    updateUserStatus
};