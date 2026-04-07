## 🌐 Live Demo
https://skill-swap-virid.vercel.app/
# SkillSwap

## 📌 Project Overview

SkillSwap is a web-based platform where users exchange skills instead of money. Users can list the skills they offer and the skills they want to learn, and the platform recommends suitable partners—creating a collaborative and cost-effective learning environment.

For example, a web developer can teach React.js in exchange for learning video editing from another user. The platform enables structured yet flexible skill exchanges based on interests and availability.

---

## 📚 Table of Contents

* Technologies Used
* Features
* Getting Started
* Installation
* Environment Variables
* Running the Application
* How to Use
* Contributing
* License

---

## 🛠️ Technologies Used

### Frontend

* React.js
* Redux (State Management)
* Vite (Bundler)
* TailwindCSS (Styling)
* Socket.io (Real-time communication)
* Framer Motion (Animations)

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (Authentication)
* bcrypt (Password hashing)
* Multer (File uploads)

---

## 🚀 Features

### 🔐 User Authentication

* Sign-up / Login (Email or Social Auth)
* Role-based access control

### 👤 User Profile & Skill Management

* Create and update profile
* Add skills you can teach and learn
* View ratings and past exchanges

### 🤝 Skill Matching Algorithm

* Matches users based on skills and availability
* Optimized recommendations system

### 💬 Real-Time Chat System

* Instant messaging using Socket.io
* Share media (images, videos, audio)
* Schedule sessions directly in chat

### 📅 Session Booking System

* Book and manage learning sessions
* Calendar-based scheduling
* Notifications and reminders

### ⭐ Peer Ratings & Reviews

* Rate and review users after sessions
* Helps maintain quality and trust

### 📊 Learning Progress Tracking

* Track completed sessions
* View learning history
* Personalized recommendations

### 🛠️ Admin Dashboard

* Manage users and reports
* Handle disputes
* Monitor platform analytics

---

## ⚙️ Getting Started

Make sure you have the following installed:

* Node.js
* MongoDB
* Git
* VS Code (recommended)

Clone the repository:

```bash
git clone https://github.com/gabadedibu/skill-swap.git
cd skill-swap
```

---

## 📥 Installation

### Backend Setup

```bash
cd backend
npm install
```

### Frontend Setup

```bash
cd client
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **backend** folder:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password


## ▶️ Running the Application

### Start Backend

```bash
cd backend
npm start
```

### Start Frontend

```bash
cd client
npm run dev
```

App will run on:

```
when you have successfully edited all
## ⚠️ Notes

* Replace all instances of:

  * `https://skill-swap-virid.vercel.app/` → with your deployed frontend
  * `https://skill-swap-9y9h.onrender.com/` → with your deployed backend
* Ensure CORS is properly configured on the backend for production
http://localhost:5173
```

---

## 📖 How to Use

### 1. Sign Up / Log In

Create an account or log in with existing credentials.

### 2. Set Up Profile

Add skills you want to teach and skills you want to learn.

### 3. Find Matches

Use the matching system to discover users for skill exchange.

### 4. Chat in Real-Time

Start conversations and share resources.

### 5. Book Sessions

Schedule and manage sessions directly in the chat.

### 6. Leave Feedback

Rate your experience after each session.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---



---
