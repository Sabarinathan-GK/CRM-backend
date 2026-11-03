const User = require("../models/Users");
const Customer = require("../models/Customer");
const Lead = require("../models/Lead");

const asyncHandler = require("../util/asyncHandler");

const getDashboardStats = asyncHandler( async (req, res) => {
    const [
        totalUsers,
        totalCustomers,
        totalLeads,
        newLeads,
        contactedLeads,
        qualifiedLeads,
        proposalLeads,
        convertedLeads,
        lostLeads
    ] = await Promise.all([
        User.countDocuments(),
        Customer.countDocuments(),
        Lead.countDocuments(),
        Lead.countDocuments({ status : "new" }),
        Lead.countDocuments({ status : "contacted" }),
        Lead.countDocuments({ status : "qualified" }),
        Lead.countDocuments({ status : "proposal" }),
        Lead.countDocuments({ status : "converted" }),
        Lead.countDocuments({ status : "lost" })
    ]);

    res.status(200).json({
        success : true,
        message : 'Dashboard statistics retrieved successfully',
        stats : {
            totalUsers,
            totalCustomers,
            totalLeads,
            leadsByStatus : {
                new : newLeads,
                contacted : contactedLeads,
                qualified : qualifiedLeads,
                proposal : proposalLeads,
                converted : convertedLeads,
                lost : lostLeads
            }
        }
    });
});

module.exports = {
    getDashboardStats
};