const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Lead name is required"],
        trim : true,
        minlength : [2, "Lead name must be at least 2 characters"],
        maxlength : [100, "Lead name cannot exceed 100 characters"]
    },
    email : {
        type : String,
        required : [true, "Lead email is required"],
        lowercase : true,
        trim : true
    },
    phone : {
        type : String,
        required : [true, "Lead phone number is required"],
        trim : true
    },
    company : {
        type : String,
        trim : true,
        maxlength : [100, "Company name cannot exceed 100 characters"]
    },
    source : {
        type : String,
        enum : [
            "website",
            "referral",
            "social-media",
            "advertisement",
            "cold-call",
            "other"
        ],
        default : "other"
    },
    status : {
        type : String,
        enum : [
            "new", 
            "contacted",
            "qualified",
            "proposal",
            "converted",
            "lost"
        ],
        default : "new"
    },
    notes : {
        type : String,
        trim : true,
        maxlength : [1000, "Notes cannot exceed 1000 characters"]
    },
    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null,
    }
}, { timestamps : true });

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;