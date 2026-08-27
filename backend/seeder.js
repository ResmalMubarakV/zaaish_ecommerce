const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const products = require("./data/products");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const seedData = async () => {
    try {
        console.log("Clearing existing products, users, and orders...");
        await Product.deleteMany();
        await User.deleteMany();
        await Order.deleteMany();

        console.log("Creating default administrator and demo user accounts...");
        const adminUser = await User.create({
            name: "Zaaish Administrator",
            email: "administrator@zaaish.com",
            password: "zaaishadmin@2026",
            role: "admin"
        });


        const demoUser = await User.create({
            name: "John Doe",
            email: "user@example.com",
            password: "userpassword123",
            role: "user"
        });

        console.log(`Admin Created: ${adminUser.email}`);
        console.log(`Demo User Created: ${demoUser.email}`);

        // Assign Admin user ID to products
        const sampleProducts = products.map((product) => ({
            ...product,
            user: adminUser._id
        }));

        console.log(`Inserting ${sampleProducts.length} luxury products...`);
        const createdProducts = await Product.insertMany(sampleProducts);

        console.log("Creating sample orders for admin dashboard analytics...");
        const sampleOrder = new Order({
            user: demoUser._id,
            orderItems: [
                {
                    product: createdProducts[0]._id,
                    name: createdProducts[0].name,
                    image: createdProducts[0].images[0].url,
                    sku: createdProducts[0].sku,
                    price: createdProducts[0].price,
                    quantity: 1,
                    size: createdProducts[0].sizes[0],
                    color: createdProducts[0].colors[0]
                }
            ],
            shippingAddress: {
                firstName: "John",
                lastName: "Doe",
                address: "742 Evergreen Terrace",
                city: "New York",
                state: "NY",
                postalCode: "10001",
                country: "United States",
                phone: "+15550192834"
            },
            paymentMethod: "PayPal",
            itemsPrice: createdProducts[0].price,
            shippingPrice: 0,
            taxPrice: 0,
            totalPrice: createdProducts[0].price,
            isPaid: true,
            paidAt: new Date(),
            status: "Shipped",
            shippedAt: new Date()
        });

        await sampleOrder.save();

        console.log("Database seeded successfully with 45 products, users, and sample orders!");
        process.exit();
    } catch (error) {
        console.error("Error seeding the database: ", error);
        process.exit(1);
    }
};

seedData();