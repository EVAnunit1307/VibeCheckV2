import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Work from './components/Work';
import Services from './components/Services';
import AiDirector from './components/AiDirector';
import Footer from './components/Footer';

function App() {
  return (
    <main className="bg-agency-black min-h-screen text-white selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <Hero />
      <Work />
      <Services />
      <AiDirector />
      <Footer />
    </main>
  );
}

export default App;
