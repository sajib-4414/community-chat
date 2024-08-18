export const ConnectionGroups = ()=>{
    return(<div className="container-xl">
        <div>
        <h3>
            Your connections
        </h3>
        <ul className="nav nav-tabs">
            <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="#">Connections</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" href="#">Connection Requests</a>
            </li>
            <li className="nav-item">
                <a className="nav-link disabled" href="#" tabIndex={-1} aria-disabled="true">Groups</a>
            </li>
        </ul>
        </div>

        
        
       
    </div>)
}