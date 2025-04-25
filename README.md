# Message Exchange System

A full-stack message exchange system using **Node.js**, **Express**, and **MongoDB Atlas**.  
Users can register, log in, subscribe to topics, post messages, and view the two most recent messages per subscribed topic.  
Implements **MVC**, **Observer**, and **Singleton** design patterns.  

---

## 🚀 Features

- User registration and login (with hashed passwords)
- Topic creation and automatic subscription
- Manual topic subscription and unsubscription
- Posting messages under subscribed topics
- Viewing 2 most recent messages per subscribed topic
- Topic access statistics endpoint
- Follows MVC, Singleton, and Observer patterns
- Ready for deployment on Render

---

## 🧱 Technologies Used

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- bcrypt
- dotenv

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/message-exchange-system.git
cd message-exchange-system

##Install dependencies
- npm install

Create a .env file in the root directory:
PORT=3000
MONGO_URI=your-mongodb-uri-here

For development:
npm run dev
