# Ethera AI Task Manager

This project is a sophisticated Task Management application built as an assignment for **Ethera.ai**. It features a modern tech stack with a robust backend and a highly responsive frontend.

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend**: Hono (Node.js server)
- **Database**: Drizzle ORM with MySQL
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, Lucide Icons, Embla Carousel
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom JWT-based authentication

## ✨ Key Features

- **Project Management**: Create, view, and organize projects.
- **Task Tracking**: Manage tasks within projects with ease.
- **Admin Dashboard**: Specialized views for administrative tasks.
- **Modern UI/UX**: Clean, premium design with smooth animations and responsive layouts.
- **Type-Safe API**: Integration with tRPC/Zod for end-to-end type safety.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL Database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/UtkarshSingh-1/etheraai-task-manager.git
   cd etheraai-task-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`. 
   
   **Google OAuth Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a project and set up OAuth credentials.
   - **Authorized JavaScript Origin**: `http://localhost:3000`
   - **Authorized Redirect URI**: `http://localhost:3000/api/oauth/callback`
   - Copy `Client ID` and `Client Secret` to your `.env`.

   **SMTP Setup**:
   - Use your Gmail address and a [Google App Password](https://myaccount.google.com/apppasswords) for `SMTP_USER` and `SMTP_PASS`.

4. Run database migrations:
   ```bash
   npm run db:push
   ```

### Running the App

- **Development Mode**:
  ```bash
  npm run dev
  ```

- **Build for Production**:
  ```bash
  npm run build
  npm start
  ```

## 🔐 Demo Accounts

To test the application without creating a new account, you can use the following pre-seeded credentials:

### Admin Account
- **Email**: `admin@ethera.com`
- **Password**: `EtheraAdmin@2026`
- **Permissions**: Full access to all dashboards, user performance tracking, and project management.

### Member Account
- **Email**: `arjun.sharma@ethera.com`
- **Password**: `EtheraUser@2026`
- **Permissions**: Access to assigned projects and personal task tracking.

*Other available member accounts (using the same password):*
- `priya.patel@ethera.com`
- `rohan.gupta@ethera.com`
- `ananya.singh@ethera.com`

---

## 📂 Project Structure

- `src/`: React frontend components, pages, and hooks.
- `api/`: Hono backend routers and server logic.
- `db/`: Database schema and Drizzle configuration.
- `contracts/`: Type definitions and shared constants.

## 📝 License

This project is for evaluation purposes as part of the Ethera.ai assignment.
