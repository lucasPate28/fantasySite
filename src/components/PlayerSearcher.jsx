import React, { useState } from 'react';

const SearchBar = () => {
  // Sample data
  const initialData = ['Connor McDavid', 'Leon Draisaitl', 'Auston Matthews', 'Quinn Hughes', 'Nathan MacKinnon'];
  
  // State for the search query
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering logic: returns items that include the search term (case-insensitive)
  const filteredData = initialData.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search for a player"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {searchTerm && (
        <ul className="w-full mt-4 bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 shadow-sm">
            {filteredData.length > 0 ? (
            filteredData.map((fruit, index) => (
                <li key={index} className="px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors">
                {fruit}
                </li>
            ))
            ) : (
            <li className="px-4 py-2.5 text-gray-400 text-center italic">No results found</li>
            )}
        </ul>
        )}
    </div>
  );
};

export default SearchBar;