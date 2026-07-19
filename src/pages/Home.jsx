import React, { useEffect } from 'react';
import wtsLogo from '../assets/images/wtslogo.png';
import '../App.css';

export default function Home() {
  useEffect(() => {
    document.title = 'Wild Tuskers Sri Lanka | Home';
  }, []);
  return (
    <main className="main-content">
      <section id="home" className="hero-section">
        <div className="hero-bg-overlay" />
        <div className="container hero-container">
          <div className="hero-logo-wrapper">
            <img src={wtsLogo} alt="Wild Tusker Sri Lanka" className="hero-logo-img" />
          </div>
          <p className="hero-description">
            Wild Tuskers Sri Lanka is a dedicated team of wildlife researchers and conservationists
            committed to identifying and protecting the rare tusked elephants of Sri Lanka —
            guardians of one of Asia's most endangered natural treasures.
          </p>
        </div>
      </section>
    </main>
  );
}
