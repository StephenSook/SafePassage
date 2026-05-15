import { Navbar } from './components/Navbar';
import { HeroScene } from './components/HeroScene';
import { HowItWorks } from './components/HowItWorks';
import { LiveDemo } from './components/LiveDemo';
import { TrustSection } from './components/TrustSection';
import { BuildClubCTA } from './components/BuildClubCTA';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="bg-bg text-white min-h-screen">
      <Navbar />
      <HeroScene />
      <HowItWorks />
      <LiveDemo />
      <TrustSection />
      <BuildClubCTA />
      <Footer />
    </div>
  );
}

export default App;
