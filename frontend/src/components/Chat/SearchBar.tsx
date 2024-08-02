import { useEffect, useState } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { axiosInstance } from "../../utility/axiosInstance";
import { User } from "../../models/user.models";


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
        const response = await axiosInstance.get(`/users/find?keyword=${searchTerm}`)
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
    const handleOnSelect = (item:User) => {
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

    // Bootstrap form-control height
    const styling = {
      border: "1px solid #ced4da",
      borderRadius: ".25rem",
      backgroundColor: "#fff",
      boxShadow: "none",
      fontSize: "1rem",
      lineHeight: "1.5",
      color: "#495057",
      fontFamily: "inherit",
      width: "100%",
      zIndex:1000
    }
      return (
        <div className="px-4 d-none d-md-block mt-3">
						<div className="d-flex align-items-center">
				 			<div className="flex-grow-1">
              <ReactSearchAutocomplete
                // className="form-control my-3"
                items={suggestions}
                onSearch={handleOnSearch}
                onHover={handleOnHover}
                onSelect={handleOnSelect}
                onClear={handleOnClear}
                placeholder="Type to search"
                inputSearchString={searchTerm}
                styling={styling}
              />
							
					 		</div>
						</div>
					 </div>
          
       
      );
}
export {SearchBar}