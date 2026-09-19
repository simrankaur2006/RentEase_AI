# 🏠 RentEase AI

> An AI-powered rental property platform built with the MERN stack to simplify property discovery, rental management, and tenant-landlord interaction.

![RentEase AI](https://img.shields.io/badge/Project-RentEase%20AI-blue)
![MERN](https://img.shields.io/badge/Stack-MERN-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Express.js](https://img.shields.io/badge/Backend-Express.js-black)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-green)

---

## 📌 Overview

**RentEase AI** is a full-stack rental property management and discovery platform designed to make the rental process easier for both tenants and landlords.

The platform provides a centralized space where users can explore rental properties, publish listings, manage properties, and interact with the rental ecosystem through a modern and intuitive interface.

The application combines the **MERN stack** with **Clerk authentication** and AI-powered functionality to create a smarter rental experience.

---

## 🎯 Problem Statement

Finding and managing rental properties can often involve:

- 🔎 Difficulty discovering suitable properties
- 📄 Scattered property information
- 🤝 Limited communication between tenants and landlords
- 🏠 Difficulties managing rental listings
- ⏱️ Time-consuming property searches
- 📊 Lack of centralized rental management

RentEase AI aims to address these challenges through a single digital platform.

---

## ✨ Features

### 👤 Authentication

- Secure user authentication using **Clerk**
- User registration and login
- Protected routes
- User session management
- Role-based functionality for different users

### 🏠 Property Listings

- Create rental property listings
- Upload property images
- Add property details
- Set rental prices
- Specify location and amenities
- Edit and delete listings

### 🔍 Property Discovery

- Browse available rental properties
- Search properties
- Filter properties based on relevant criteria
- View detailed property information
- Responsive property cards

### 🤝 Tenant-Landlord Interaction

- Separate workflows for tenants and landlords
- Property inquiry functionality
- Manage rental-related interactions
- User-friendly dashboard

### 🤖 AI-Powered Assistance

RentEase AI is designed to incorporate AI-based assistance for:

- Property recommendations
- Rental-related queries
- Smart property discovery
- User assistance
- Personalized rental experience

### 📊 Dashboard

Users can manage their rental activities through a centralized dashboard.

**Landlords can:**

- Manage properties
- Add new listings
- Update listings
- Remove properties
- View property activity

**Tenants can:**

- Explore properties
- View property details
- Save/interact with properties
- Manage rental inquiries

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router

### Backend

- Node.js
- Express.js
- REST APIs
- Mongoose

### Database

- MongoDB Atlas

### Authentication

- Clerk

### AI

- AI-powered recommendation and assistance modules

### Development Tools

- Git
- GitHub
- VS Code
- npm

---

## 🏗️ Project Architecture

```text
RentEase AI
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── seed/
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
