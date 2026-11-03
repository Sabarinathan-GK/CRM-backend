const app = require("./app");
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db')

const PORT = process.env.PORT;


//Connect to MongoDB
connectDB();

app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})