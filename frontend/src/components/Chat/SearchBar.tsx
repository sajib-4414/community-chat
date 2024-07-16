import { useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";

function SearchBar(
    // {onSearchItemSelected}

) {
    const [items,setItems] = useState([
        { id: 0, name: 'HTML' },
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'Basic' },
        { id: 3, name: 'PHP' },
        { id: 4, name: 'Java' }
    ])
    const handleOnSearch = (string, results) => {
        // Triggered when the user types in the search input
        console.log(string, results);
    };
    const handleOnHover = (item) => {
        // Triggered when the user hovers over an item in the suggestions list
        console.log('Item hovered:', item);
    };
    const handleOnSelect = (item) => {
        // Triggered when the user selects an item from the suggestions list
        console.log('Item selected:', item);
        // onSearchItemSelected(item);
      };
      return (
        <div className="search-bar-container">
          <ReactSearchAutocomplete
            items={items}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
          />
        </div>
      );
}
export {SearchBar}