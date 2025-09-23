import iithLogo from  "../../assets/krc.png";
import "./header.css";

export default function Header() {
  return (


<>
      <header className="dashboard-header">
        <div className="header-content">
          <a href="https://library.iith.ac.in" target="_blank" rel="noopener noreferrer">
            <img src={iithLogo} alt="IIT Hyderabad Logo" className="logo" />
          </a>
          <div className="header-text">
            <h1 className="main-title">Knowledge Resource Center</h1>
            <h2 className="sub-title">Research Data Visualization</h2>
            <p className="institute-name">Indian Institute of Technology Hyderabad</p>
          </div>
         
        </div>
      </header>
    </>

    );
}