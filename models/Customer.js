const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Customer name is required"],
        trim : true,
        minlength : [2, "Customer name must be at lease 2 Characters"],
        maxlength : [100, "Customer name cannot exceed 100 characters"]
    },
    email : {
        type : String,
        required :  [true, "Customer email is required"],
        unique : true,
        lowercase : true, 
        trim : true
    }, 
    phone : {
        type : String,
        required : [true, "Customer Phoen number is required"],
        trim : true
    },
    company : {
        type : String,
        trim : true,
        maxlength : [100, "Company name cannot exceed 100 characters"]
    },

    status : {
        type : String,
        enum : ["active", "inactive", "prospect"],
        default : "prospect"
    },
    notes : {
        type : String,
        trim : true,
        maxlength : [1000, "Notes cannot exceed 1000 characters"]
    },
    assignedTo : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null
    }
}, {
    timestamps : true
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;