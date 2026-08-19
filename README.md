<div align="center">
  <h1>✦ ZAAISH ✦</h1>
  <p><b>Luxury Fashion E-Commerce Platform</b></p>
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

<br />

A premium, full-stack e-commerce application built with the MERN stack. Zaaish delivers a sleek, responsive, and high-performance shopping experience with a modern "stone" aesthetic, complete with user authentication, cart management, and a dedicated administrative dashboard.

---

## ✨ Key Features

### 🛍️ Customer Experience
* **Dynamic Product Catalog:** Browse extensive clothing collections with real-time filtering (by category, gender, color, size, material, and brand) and sorting.
* **Detailed Product Pages:** View high-quality image galleries, product specifications, and dynamically calculated pricing.
* **Smart Shopping Cart:** Persistent cart state that seamlessly syncs upon user login.
* **Checkout & Order History:** Secure checkout flow, detailed order tracking, and downloadable/printable PDF purchase invoices.
* **Responsive Luxury UI:** Fully responsive design built with Tailwind CSS, featuring seamless Light/Dark mode adaptation.

### 🛡️ Security & Authentication
* **JWT Authentication:** Secure login and registration with JSON Web Tokens.
* **Role-Based Access Control:** Protected routes to ensure only authorized administrators can access the backend management dashboard.
* **Encrypted Passwords:** User credentials securely hashed using bcrypt.

### 👔 Admin Dashboard
* **Inventory Management:** Add, edit, and delete products. Upload and manage product image galleries via Cloudinary.
* **Order Fulfillment:** Monitor global store orders, track payment statuses, and update fulfillment stages (Processing, Shipped, Delivered).
* **User Management:** View registered customers and manage administrative roles.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [Git](https://git-scm.com/) installed on your machine. You will also need a [MongoDB](https://www.mongodb.com/) account and a [Cloudinary](https://cloudinary.com/) account.

### 1. Clone the repository

```bash
git clone https://github.com/ResmalMubarakV/zaaish_ecommerce.git
cd zaaish_ecommerce

2. Install Dependencies
Backend:

Bash
cd backend
npm install
Frontend:

Bash
cd ../frontend
npm install
3. Environment Variables
Create a .env file in your backend directory and add the following configuration:

Code snippet
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
4. Running the Application
Start the Backend Server:
Open a terminal in the root directory and run:

Bash
cd backend
npm run dev
(Server will start on http://localhost:3000)

Start the Frontend Client:
Open a new terminal, navigate to the frontend folder, and run:

Bash
cd frontend
npm run dev
(Client will start on http://localhost:5173)

📂 Project Structure

zaaish_ecommerce/
├── backend/                # Node.js & Express API
│   ├── config/             # DB & Cloudinary configurations
│   ├── middleware/         # Auth, Upload, & Error handling
│   ├── models/             # Mongoose schemas (User, Product, Order)
│   ├── routes/             # API endpoints
│   └── server.js           # Backend entry point
│
├── frontend/               # React UI
│   ├── src/
│   │   ├── assets/         # Static images
│   │   ├── components/     # Reusable UI components
│   │   ├── Pages/          # Main application views
│   │   └── App.jsx         # Routing configuration
│   └── tailwind.config.js  # Theme styling