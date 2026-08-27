# Zaaish E-Commerce: Production Deployment & Environment Checklist

This checklist contains all environment variables, service configurations, and step-by-step instructions required to deploy the **Zaaish** MERN Stack platform to production using **Render** (Backend) and **Vercel** (Frontend).

---

## 1. Backend Environment Checklist (Render / Railway / Heroku)

### Environment Variables required in Backend host settings:

| Variable Name | Description | Example / Format |
|---|---|---|
| `PORT` | Web server listening port | `3000` or `8080` (auto-set by Render) |
| `NODE_ENV` | Application environment mode | `production` |
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<user>:<password>@cluster.mongodb.net/zaaish?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing JWT tokens | High-entropy random 64-char string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret Key | `your_cloudinary_api_secret` |
| `CLOUDINARY_FOLDER` | Designated upload folder | `zaaish_products` |
| `FRONTEND_URL` | Production Frontend Domain for CORS | `https://zaaish-ecommerce.vercel.app` |

### Backend Render Deployment Steps:
1. Connect your repository to **Render** and create a **Web Service**.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to: `npm install`
4. Set **Start Command** to: `node server.js`
5. Add all Environment Variables listed above in the Render Environment settings tab.

---

## 2. Frontend Environment Checklist (Vercel / Netlify)

### Environment Variables required in Frontend host settings:

| Variable Name | Description | Example / Format |
|---|---|---|
| `VITE_BACKEND_URL` | Production Backend API Base URL | `https://zaaish-api.onrender.com` |

### Frontend Vercel Deployment Steps:
1. Import repository to **Vercel**.
2. Select **Framework Preset**: `Vite`.
3. Set **Root Directory**: `frontend`.
4. Add `VITE_BACKEND_URL` environment variable pointing to your deployed Render API URL.
5. Deploy project.

---

## 3. Post-Deployment Verification Checklist

- [ ] **Database Indexes**: Verify MongoDB Atlas indexes are active for Product and Order collections.
- [ ] **Cloudinary Pipeline**: Upload a product image from the Admin panel; verify image streams to Cloudinary `zaaish_products` folder and generates `f_auto,q_auto` optimized URLs.
- [ ] **Authentication Rate Limiter**: Verify `/api/users/login` and `/api/users/register` block abusive rapid requests (>10 requests / 15 mins).
- [ ] **Wishlist & Stepper**: Verify Wishlist items save across sessions and order tracking timeline displays `Processing` ➔ `Shipped` ➔ `Delivered` states properly.
- [ ] **Error Handling**: Confirm Error Boundary catches UI runtime errors gracefully.
