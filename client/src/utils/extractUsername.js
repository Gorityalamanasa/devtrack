export const extractUsername = (input) => {
  if (!input) return "";

  // Extract from GitHub URL
  if (input.includes("github.com")) {
    const parts = input.split("github.com/")[1];
    return parts ? parts.split("/")[0].trim() : "";
  }

  // Sanitize: remove spaces and invalid characters
  // GitHub usernames: alphanumeric + hyphens only
  return input
    .trim()
    .replace(/\s+/g, "-")          // spaces → hyphens
    .replace(/[^a-zA-Z0-9-]/g, "") // remove invalid chars
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .toLowerCase();
};
