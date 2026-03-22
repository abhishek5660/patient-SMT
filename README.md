# Patient Management System

A full-stack MERN application for managing hospital patients, doctors, and appointments.

## Features
- **Authentication**: Role-based login (Patient, Doctor, Admin).
- **Dashboards**: Dedicated dashboards for each role.
- **Appointments**: (Data models ready, UI placeholders).
- **Tech Stack**: MongoDB, Express, React, Node.js, Tailwind CSS, Vite.

## Prerequisites
- Node.js installed
- MongoDB installed and running locally

## Setup Instructions

### 1. Backend Setup
1. Navigate to `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   - Copy `env.example` to `.env`.
   - Update `MONGO_URI` if needed.
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000.

### 2. Frontend Setup
1. Navigate to `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173.

## Usage
1. Open http://localhost:5173.
2. Register a new user (Select Role: Patient, Doctor, or Admin).
3. System will redirect to the appropriate Dashboard.
4. Logout using the Navbar button.

## Folder Structure
- **backend/**: API server, models, controllers, routes.
- **frontend/**: React application, pages, components, context.

## Models
- User
- Appointment
- Prescription
- MedicalRecord
- Department
- Payment
