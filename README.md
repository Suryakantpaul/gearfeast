# ⚙️ GearFeast - Integrated Food Delivery Platform

A full-stack food delivery and dine-out platform built with the MERN stack, featuring real-time order tracking, geospatial restaurant discovery, and a gamified review system.

## 🚀 Live Demo
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## ✨ Features

### Customer
- 🔐 JWT Authentication (Register/Login)
- 📍 Geospatial restaurant discovery using MongoDB 2dsphere index
- 🔍 Search restaurants by cuisine or name
- 🛒 Add to cart and place orders
- 🛵 Real-time order tracking via Socket.io
- ⭐ Gamified review system with loyalty points
- 📦 Order history

### Restaurant Owner
- 🍴 Dedicated merchant dashboard
- 📊 Revenue and order statistics
- ✅ Accept and manage orders in real-time
- 🔄 Update order status live

### Technical
- 🌍 MongoDB GeoJSON with 2dsphere indexing
- ⚡ WebSocket real-time communication (Socket.io)
- 🔒 JWT + bcrypt authentication
- 📱 Responsive UI (Zomato/Swiggy inspired)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Cloud | AWS Ready |

## 📁 Project Structure