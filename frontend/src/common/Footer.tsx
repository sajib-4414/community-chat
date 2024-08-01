import { FC } from "react";

const Footer:FC = ()=>{
    return <div className="bg-dark">
    <div className="container">
    <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
      <div className="col-md-4 d-flex align-items-center">
        <a href="/" className="mb-3 me-2 mb-md-0  lh-1 text-decoration-none text-white">
          bbb
        </a>
        <span className="mb-3 mb-md-0 text-body-secondary text-white">© 2024 Company, Inc</span>
      </div>
  
      <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
        <li className="ms-3"><a className="text-body-secondary" href="#"><i className="bi bi-twitter"></i></a></li>
        <li className="ms-3"><a className="text-body-secondary" href="#"><i className="bi bi-instagram"></i></a></li>
        <li className="ms-3"><a className="text-body-secondary" href="#"><i className="bi bi-facebook"></i></a></li>
      </ul>
    </footer>
  </div>
    </div>
}
export default Footer