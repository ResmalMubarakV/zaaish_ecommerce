const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const products = require("./data/products");
const connectDB = require("./config/db");

dotenv.config();

// Connect to MongoDB using your config module
connectDB();

// Function to seed the data
const seedData = async () => {
    try {
        // Clear existing data
        await Product.deleteMany();
        await User.deleteMany();

        // Create a default admin User
        const createdUser = await User.create({
            name: "Admin User",
            email: "admin@example.com",
            password: "123456", // Ensure your User model handles hashing if necessary
            role: "admin"
        });

        // Assign the default user ID to each product
        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userID };
        });

        // Insert the products into the database
        await Product.insertMany(sampleProducts);

        console.log("Data seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding the data: ", error);
        process.exit(1);
    }
};

seedData();