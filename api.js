////molipi1196@fanicle.com

const API_BASE_URL = "https://678ae011dd587da7ac2b9df4.mockapi.io/apis/";

// User API methods
const UserAPI = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      console.log("response", response);
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return await response.json();
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      return await response.json();
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      return await response.json();
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete user");
      return await response.json();
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

// Cars API methods
const CarAPI = {
  // Get all cars
  getAllCars: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`);
      if (!response.ok) throw new Error("Failed to fetch cars");
      return await response.json();
    } catch (error) {
      console.error("Error fetching cars:", error);
      throw error;
    }
  },

  // Get car by ID
  getCarById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`);
      if (!response.ok) throw new Error("Failed to fetch car");
      return await response.json();
    } catch (error) {
      console.error("Error fetching car:", error);
      throw error;
    }
  },

  // Create new car
  createCar: async (carData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error("Failed to create car");
      return await response.json();
    } catch (error) {
      console.error("Error creating car:", error);
      throw error;
    }
  },

  // Update car
  updateCar: async (id, carData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });
      if (!response.ok) throw new Error("Failed to update car");
      return await response.json();
    } catch (error) {
      console.error("Error updating car:", error);
      throw error;
    }
  },

  // Delete car
  deleteCar: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete car");
      return await response.json();
    } catch (error) {
      console.error("Error deleting car:", error);
      throw error;
    }
  },
};

export { UserAPI, CarAPI };
