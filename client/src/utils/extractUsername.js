export const extractUsername = (input) => {
  if (!input) return "";

  if (input.includes("github.com")) {
    const parts = input.split("github.com/")[1];
    return parts.split("/")[0]; // 🔥 FIX
  }

  return input.trim();
};