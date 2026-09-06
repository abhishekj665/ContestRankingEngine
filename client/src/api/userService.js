import axios from "axios";

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_SERVICE_URL,
});

userApi.interceptors.request.use((config) => {
  let session = null;
  try {
    session = JSON.parse(localStorage.getItem("contestSession") || "null");
  } catch {
  }
  const token = session?.role === "user" ? session.token : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

userApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.resolve(
      error.response?.data || {
        success: false,
        message: "Unable to connect to User Service",
      },
    );
  },
);

export const signup = async (name, username, email, password, residency) => {
  return await userApi.post("/api/users/register", {
    name,
    username,
    email,
    password,
    residency,
  });
};

export const login = async (identifier, password) => {
  const field = identifier.includes("@") ? "email" : "username";
  return await userApi.post("/api/users/login", { [field]: identifier, password });
};

export const updateResidency = async (residency) => {
  return await userApi.patch("/api/users/update/residency", { residency });
};

export const getPosts = async (page = 1, limit = 10, category = "") => {
  return await userApi.get("/api/posts", {
    params: { page, limit, ...(category ? { category } : {}) },
  });
};

export const createPost = async (postData) => {
  const formData = new FormData();
  formData.append("title", postData.title);
  if (postData.caption?.trim()) formData.append("caption", postData.caption);
  formData.append("category", postData.category);
  formData.append("media", postData.media);
  return await userApi.post("/api/posts", formData);
};

export const likePost = async (postId) => {
  return await userApi.post(`/api/posts/${postId}/like`);
};

export const commentOnPost = async (postId, content) => {
  return await userApi.post(`/api/posts/${postId}/comment`, { content });
};
