// utils/auth.js
export const isLoggedIn = () => {
  return !!localStorage.getItem("username");
};

export const loginUser = (username) => {
  localStorage.setItem("username", username);
};

export const logoutUser = () => {
  localStorage.removeItem("username");
};
