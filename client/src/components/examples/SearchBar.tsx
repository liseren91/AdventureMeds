import { useState } from "react";
import SearchBar from "../SearchBar";

export default function SearchBarExample() {
  const [value, setValue] = useState("");

  return (
    <SearchBar 
      value={value} 
      onChange={setValue}
      onSearch={() => console.log('Search triggered:', value)}
    />
  );
}
