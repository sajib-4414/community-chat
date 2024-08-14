import { useState } from "react"

export const DiscoverUsers:React.FC = ()=>{
    const [radius,setRadius] = useState(0)
    return (<div className="container-lg">
        <h3>
            Discover users in your area
        </h3>
        <div className="pb-3">
            <label htmlFor="customRange1" className="form-label ml-3">Choose a radius</label>
            <div className="row mx-1 justify-content-center align-items-center">
                <div className="col-8">
                    <input type="range" min="0" value={radius} max="100" style={{width:"100%"}} className="form-range" onChange={(e)=>setRadius(e.target.value)} id="customRange1"/>
                </div>
                <div className="col-4">
                    <p className="border rounded p-2">{radius} Km</p>
                </div>
                
            </div>
            <button className="btn btn-primary ml-3">Search</button>
            
        </div>
        <>
        <h5>5 Users found</h5>
        <ul className="list-group">
        <li className="list-group-item">
            <div className="row px-2">
                <p className="col-10">Alice Jonson</p>
                <button className="btn btn-success col-2">Add Connection</button>
            </div>
        </li>
        <li className="list-group-item">
            <div className="row px-2">
                <p className="col-10">Rowana johnson</p>
                <button className="btn btn-danger col-2">Remove Connection</button>
            </div>
        </li>
        
        </ul>
        <div className="py-3">
            <nav aria-label="Page navigation example">
            <ul className="pagination">
                <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                <li className="page-item"><a className="page-link" href="#">1</a></li>
                <li className="page-item"><a className="page-link" href="#">2</a></li>
                <li className="page-item"><a className="page-link" href="#">3</a></li>
                <li className="page-item"><a className="page-link" href="#">Next</a></li>
            </ul>
            </nav>
        </div>
        </>
        
        
    </div>)
}