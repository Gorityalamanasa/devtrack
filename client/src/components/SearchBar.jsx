import { useState } from "react";
import { extractUsername } from "../utils/extractUsername";

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    const username = extractUsername(input);
    if (username) {
      onSearch(username);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-800 p-3 rounded-xl shadow-lg">
      <input
        type="text"
        placeholder="Enter GitHub username or profile URL..."
        className="flex-1 bg-transparent outline-none text-white"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        🔍
      </button>
    </div>
  );
};

export default SearchBar;