const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const User = require("../models/Users");

const createAdmin = async () =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB is connected : ${connection.connection.host}`);
        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
        const password = process.env.ADMIN_PASSWORD;
        if(!name || !email || !password){
            throw new Error(
                "Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env"
            );
        }

        if(password.length < 12){
            throw new Error("Admin password must be at least 12 characters");
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            existingUser.role = "admin";
            existingUser.isActive = true;
            await existingUser.save();
            console.log(`Existing account promoted to admin: ${email}`);
        }else{
            const hashedPassword = await bcrypt.hash(password, 12);

            await User.create({
                name,
                email,
                password : hashedPassword,
                role : "admin",
                isActive: true
            });
            console.log(`Admin account created : ${email}`);
        }
    }catch(error){
        console.error("Admin setup failed:", error.message);
        process.exitCode = -1;
    }finally{
        await mongoose.disconnect();
    }
}

createAdmin();