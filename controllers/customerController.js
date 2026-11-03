const Customer = require('../models/Customer');
const asyncHandler = require('../util/asyncHandler');

//create Customer
const createCustomer = asyncHandler( async (req, res) =>{
    const { name, email, phone, company, status, notes } = req.body;

    const existingCustomer = await Customer.findOne({ email });

    if(existingCustomer){
        return res.json(409).json({
            success : false,
            message : "Customer with this email already exists"
        });
    }

    const customer = await Customer.create({
        name, 
        email,
        phone,
        company, 
        status, 
        notes,
        assignedTo : req.user.userId
    });

    res.status(201).json({
        success : true,
        message : "Customer created successfully",
        customer
    })
});


//filtering, pagination for customer and get customers
const getAllCustomers = asyncHandler( async (req, res) =>{
    const {
        search = "",
        status,
        page = 1,
        limit = 10
    } = req.query;

    //validate pagination inputs
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    //Enforce role-based-visibility
    const filter = req.user.role == "admin" ? {} : { assignedTo : req.user.userId };

    //Filter by customer status
    if(status){
        const allowedStatuses = ["active", "inactive", "prospect"];
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                success : false,
                message : "Invalid customer status"
            });
        }
        filter.status = status;
    }

    //search by name, email or company
    if(search.trim()){
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

        filter.$or = [
        { name : { $regex : escapedSearch, $options : "i" } },
        { email : { $regex : escapedSearch, $options : "i" } },
        { company : { $regex : escapedSearch, $options : "i" } }
    ];
    }

    const [customers, totalCustomers] = await Promise.all([
        Customer.find(filter)
        .populate("assignedTo", "name email role")
        .sort( { createAt : -1 } )
        .skip((pageNumber  - 1) * pageSize)
        .limit(pageSize),
        Customer.countDocuments(filter)
    ])

    res.status(200).json({
        success  : true,
        customers,
        pagination : {
            totalCustomers,
            currentPage : pageNumber,
            totalPages : Math.ceil(totalCustomers / pageSize),
            pageSize
        }
    });
});

//customer by id
const getCustomerById = asyncHandler( async (req, res) =>{
    const customer = await Customer.findById(req.params.id)
    .populate("assignedTo", "name email role");

    if(!customer){
        return res.status(404).json({
            success : false,
            message : "Customer not found"
        });
    }

    //user can see only assigned customers
    if(req.user.role !== "admin" && customer.assignedTo?._id.toString() !== req.user.userId){
        return res.status(403).json({
            success : false,
            message : "Access denied. You can access only your assigned customers/"
        });
    }

    res.status(200).json({
        success : true,
        customer
    });
});

//update customer
const updateCustomer = asyncHandler( async (req, res) =>{
    const customer = await Customer.findById(req.params.id);

    if(!customer){
        return res.status(404).json({
            success : false,
            message : "Customer not found"
        });
    }

    // if(!customer){
    //     res.status(404);
    //     throw new Error("Customer not found");
    // }

    //Normal user can update only assigned customers
    if(req.user.role !== "admin" && customer.assignedTo?.toString() !== req.user.userId){
        return res.status(403).json({
            success : false,
            message : "Access denied. You can update only your assigned customers."
        })
    }

    //Prevent normal users from changing assignment
    if(req.user.role !== "admin" && req.body.assignedTo){
        return res.status(403).json({
            success : false,
            message : "You are not allowed to  change customer assignment."
        })
    }

    const allowedFields = [
        "name",
        "email",
        "phone",
        "company",
        "status",
        "notes"
    ];


    //admin can update assignedTo
    if(req.user.role === "admin"){
        allowedFields.push("assignedTo");
    }

    const updateData = {};

    allowedFields.forEach((field) =>{
        if(req.body[field] !== undefined){
            updateData[field] = req.body[field];
        }
    });

    const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            new : true,
            runValidators : true
        }
    ).populate("assignedTo", "name email role");

    res.status(200).json({
        success : true,
        message : "Customer updated successfully",
        customer : updatedCustomer
    });
});

//Delete Customer
const deleteCustomer = asyncHandler(async (req, res) =>{

    if(req.user.role !== "admin"){
        return res.status(403).json({
            success : false,
            message : "Access denied. Only admins can delete customers"
        });
    }

    const customer = await Customer.findById(req.params.id);

    if(!customer){
        return res.status(404).json({
            success : false,
            message : "Customer not found"
        });
    }

    await customer.deleteOne();

    res.status(200).json({
        success : true,
        message : "Customer deleted successfully"
    });
});

module.exports ={
    createCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
}


