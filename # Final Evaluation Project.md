# Final Evaluation Project

This project is a MERN stack application that includes user authentication, profile management, and link analytics. Below is a brief overview of the project structure and how to set it up.

## Project Structure

### Client

- `client/src/Pages/`

  - `UserLinks.jsx`: Displays user links and allows searching through them.
  - `Signup.jsx`: User registration page.
  - `Login.jsx`: User login page.
  - `Settings.jsx`: User profile settings page.
  - `Home.jsx`: Dashboard displaying analytics.
  - `Analytics.jsx`: Detailed analytics page.

- `client/src/assets/`: Contains images and logos used in the project.
- `client/src/components/`: Contains reusable components like `Greet`, `SearchComponent`, and `TableComponent`.
- `client/src/context/`: Contains context providers for user data.

### Backend

- `backend/routes/user.route.js`: Contains all user-related routes including registration, login, profile management, and URL management.
- `backend/models/user.model.js`: Defines the user schema and model.
- `backend/models/shortUrl.model.js`: Defines the short URL schema and model.
- `backend/middlewares/auth.middleware.js`: Middleware for authenticating requests.

## Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd final-eval-project-2
   ```

2. **Install Dependencies:**

   ```bash
   cd client
   npm install
   cd ../backend
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in both the `client` and `backend` directories and add the following:

   **Client:**

   ```env
   VITE_BACKEND_URL=<your-backend-url>
   ```

   **Backend:**

   ```env
   JWT_SECRET=<your-jwt-secret>
   MONGO_URI=<your-mongodb-uri>
   ```

4. **Run the Application:**
   **Client:**

   ```bash
   cd client
   npm run dev
   ```

   **Backend:**

   ```bash
   cd backend
   npm start
   ```

## Component Overview

### UserLinks.jsx

- Fetches and displays user links.
- Allows searching through links.
- Handles user logout.

### Signup.jsx

- User registration form.
- Validates passwords and handles form submission.

### Login.jsx

- User login form.
- Handles authentication and redirects to the dashboard.

### Settings.jsx

- User profile settings.
- Allows updating user details and deleting the account.

### Home.jsx

- Dashboard displaying date-wise and device-wise click analytics.
- Fetches and aggregates data for visualization.

### Analytics.jsx

- Displays detailed analytics in a tabular format.

## Backend Overview

### Routes

- **Register a new user:**

  - `POST /api/user/register`
  - Registers a new user with username, email, mobile, and password.

- **User login:**

  - `POST /api/user/login`
  - Authenticates a user and returns a JWT token.

- **Fetch user profile:**

  - `GET /api/user/profile`
  - Retrieves the profile details of the authenticated user.

- **Create a short URL:**

  - `POST /api/user/url`
  - Creates a short URL for the authenticated user.

- **Update a short URL:**

  - `PUT /api/user/url/:id`
  - Updates the details of a short URL.

- **Delete a short URL:**

  - `DELETE /api/user/url/:id`
  - Deletes a short URL.

- **Fetch all short URLs:**

  - `GET /api/user/url`
  - Retrieves all short URLs for the authenticated user.

- **Redirect to original URL:**

  - `GET /:shortId`
  - Redirects to the original URL based on the short ID.

- **Delete user profile:**

  - `DELETE /api/user/delete`
  - Deletes the authenticated user's profile and related data.

- **Update user profile:**

  - `PUT /api/user/update`
  - Updates the authenticated user's profile details.

- **Search URLs:**
  - `GET /api/user`
  - Searches URLs based on remarks.

### Models

- **User Model:**

  - Defines the schema for user data including username, email, mobile, and password.

- **Short URL Model:**
  - Defines the schema for short URLs including short ID, redirect URL, clicks, user reference, remarks, and expiration date.

### Middleware

- **Auth Middleware:**
  - Verifies the JWT token and authenticates the user for protected routes.

## Styling

- Custom CSS files for each page are located in the same directory as the components.
- Responsive design is implemented using media queries.

## Libraries Used

- `react-router-dom`: For routing.
- `axios`: For making HTTP requests.
- `toastify-js`: For displaying notifications.
- `recharts`: For rendering charts and graphs.

## Notes

- Ensure the backend server is running and accessible at the URL specified in the `.env` file.
- The application uses local storage to manage authentication tokens.

Feel free to explore and modify the project as needed. If you encounter any issues, please refer to the documentation or raise an issue in the repository.
