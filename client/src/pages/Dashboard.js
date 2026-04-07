import { useState } from "react";
import SearchBar from "../components/SearchBar";

const Dashboard = () => {
  const [username, setUsername] = useState("");

  const handleSearch = (user) => {
    console.log("Searching for:", user);
    setUsername(user);
  };

  return (
    <div>
      <h1>DevTrack Dashboard</h1>
      <SearchBar onSearch={handleSearch} />

      {username && <p>Fetching data for: {username}</p>}
    </div>
  );
};

export default Dashboard;