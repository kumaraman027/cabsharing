import React from "react";
import cabImage from "../img/img.png";
import backgroundImage from "../img/cabimp.png";


const LandingPage = () => {
  return (
    <main className="landing-container">
      <div className="landing-left">
        <h1 className="logo-name">Cab Clique</h1>
        <p className="quote-text">"Why ride alone? Split the fare and the fun!"</p>
      </div>
      <div className="landing-right">
        <img src={cabImage} alt="Cab" className="cab-image" />
      </div>
    </main>
    
  );
};

export default LandingPage;
