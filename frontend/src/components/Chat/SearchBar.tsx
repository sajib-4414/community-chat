import { useEffect, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { axiosInstance } from "../../utility/axiosInstance";
import { IUser } from "../../interfaces/MessageInterfaces";

function SearchBar(
    {onSearchResultContactSelected}

) {

    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    useEffect(()=>{
      if(searchTerm.trim() === ''){
        // setSuggestions([])
      }
      else{
        
        fetchAndSetSuggestions(searchTerm)
      }
    },[searchTerm])
    const fetchAndSetSuggestions = async(searchTerm:string)=>{
      try{
        const response = await axiosInstance.get(`/auth/users/find?keyword=${searchTerm}`)
        const users = response.data;
        setSuggestions(users)
      }catch(err){
        console.log('Error fetching suggestions',err)
      }
      
    }

    const handleOnSearch = (term:string) => {
        setSearchTerm(term)
    };
    const handleOnHover = (item) => {
        // Triggered when the user hovers over an item in the suggestions list
        console.log('Item hovered:', item);
    };
    const handleOnSelect = (item:IUser) => {
        // Triggered when the user selects an item from the suggestions list
        console.log('Item selected:', item);
        onSearchResultContactSelected(item)
        setSearchTerm("")
        // onSearchItemSelected(item);
      };
    const handleOnClear = () => {
      console.log('The search input is cleared');
      setSuggestions([]);
    };
      return (
        <div className="search-bar-container">
          <ReactSearchAutocomplete
            items={suggestions}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onClear={handleOnClear}
            placeholder="Type to search"
            inputSearchString={searchTerm}
          />
        </div>
      );
}
export {SearchBar}