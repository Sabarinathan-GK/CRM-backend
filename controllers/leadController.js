const Lead = require('../models/Lead');
const User = require("../models/Users");
const asyncHandler = require("../util/asyncHandler");

//CreateLead
const createLead = asyncHandler( async (req, res) => {
    const { name, email, phone, company, source, status, notes } = req.body;

    let assignedTo = req.user.userId;

    //Only admin can assign a lead to another user
    if(req.user.role === "admin" && req.body.assignedTo){
        const assignedUser = await User.findOne({
            _id : req.body.assignedTo,
            isActive : true
        });

        if(!assignedUser){
            return req.status(400).json({
                success : false,
                message : "Assigned user not found or inactive"
            });
        }
        assignedTo = assignedUser._id;
    }

    const lead = await Lead.create({
        name,
        email,
        phone,
        company,
        source,
        status, 
        notes,
        assignedTo
    });

    res.status(201).json({
        success : true,
        message : "Lead created successfully",
        lead
    });
});

//Get all leads
const getLeads = asyncHandler( async (req, res) => {
    const {
        search = "",
        status,
        source,
        page = 1,
        limit = 10
    } = req.query;

    //validate pagination
    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min( 100, Math.max(1, parseInt(limit, 10) || 10));

    //admin sees all leads users see their assigned leads
    const filter = req.user.role === "admin" ? {} : { assignedTo : req.user.userId };

    //Filter by status
    const allowedStatuses = [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "converted",
        "lost"
    ];

    if(status){
        if(!allowedStatuses.includes(status)){
            return res.status(400).json({
                success : false,
                message : "Invalid lead status"
            });
        }
        filter.status = status;
    }

    //Filter by source
    const allwoedSources = [
        "website",
        "referral",
        'social-media',
        "advertisment",
        "cold-call",
        "other"
    ];

    if(source){
        if(!allwoedSources.includes(sources)){
            return res.statux(400).json({
                success : false,
                message : "Invalid lead source"
            });
        }
        filter.source = source;
    }

    //Search by name, email, or company
    if(search.trim()){
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

         filter.$or = [
        { name : { $regex : escapedSearch, $options : "i" } },
        { email : { $regex : escapedSearch, $options : "i" } },
        { company : { $regex : escapedSearch, $options : "i" } }
        ]
    }

    const [leads, totalLeads] = await Promise.all([
        Lead.find(filter)
        .populate("assignedTo", "name email role")
        .sort({ createAt : -1 })
        .skip((pageNumber - 1)*pageSize)
        .limit(pageSize),

        Lead.countDocuments(filter)
    ])

    res.status(200).json({
        success : true,
        leads,
        pagination : {
            totalLeads,
            currentPage : pageNumber,
            totalPages : Math.ceil(totalLeads / pageSize),
            pageSize
        }
    });
});


//Get lead by Id
const getLeadById = asyncHandler( async () => {
    const filter = 
        (req.user.role === "admin") 
        ? { _id : req.params.id } 
        : { _id : req.params.id, assignedTo : req.user.userId };

    const lead = await Lead.findOne(filter).populate("assignedTo", "name email role");

    if(!lead){
        return res.status(404).json({
            success : false,
            message : "Lead not found"
        });
    }

    res.status(200).json({
        success : true,
        lead
    });
});


//update lead
const updateLead = asyncHandler( async (req, res) => {
    const filter = req.user.role == "admin"
        ? { _id : req.params.id }
        : {
            _id : req.params.id,
            assignedTo : req.user.userId
        };
    
    const lead = await Lead.findOne(filter);

    if(!lead){
        return res.status(404).json({
            success : false,
            message : "Lead not found"
        });
    }

    const allowedFields = [
        "name",
        "email",
        "phone",
        "company",
        "source",
        "status",
        "notes"
    ]

    const updateData = {};

    allowedFields.forEach((field) =>{
            if(req.body[field] !== undefined ){
                updateData[field] = req.body[field];
            }
        });

    //Only admin can reassign a lead
    if(req.user.role === "admin" && req.body.assignedTo !== undefined ){
        if(req.body.assignedTo === null || req.body.assignedTo === ""){
            updateData.assignedTo = null;
        }else{
            const assignedUser = await User.findOne({
                _id : req.body.assignedTo,
                isActive : true
            });

            if(!assignedUser){
                return res.status(400).json({
                    success : false,
                    message : "Assigned user not found or inactive"
                });
            }
            updateData.assignedTo = assignedUser._id;
        }
    }

    const updatedLead = await Lead.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
            returnDocument  : true,
            runValidators : true
        }
    ).populate("assignedTo", "name email role");

    res.status(200).json({
        success : true,
        message : "Lead updated successfully",
        lead : updatedLead
    });
});



//Delete Lead 
const deleteLead = asyncHandler(async (req, res) =>{
    if(req.user.role !== "admin"){
        return res.status(403).json({
            success : false,
            message : "Only admins can delete leads"
        });
    }

    const lead = await Lead.findById(req.params.id);

    if(!lead){
        return res.status(404).json({
            success : false,
            message : "Lead not found"
        });
    }

    await lead.deleteOne();

    res.status(200).json({
        success : true,
        message : "Lead deleted successfully"
    });
});

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
}