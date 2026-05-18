import Nav from './components/Nav';
import Hero from './components/Hero';
import Work from './components/Work';
import About from './components/About';
import Skills from './components/Skills';
import GitHubSection from './components/GitHubSection';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="hairline max-w-6xl mx-auto" />
        <Work />
        <div className="hairline max-w-6xl mx-auto" />
        <About />
        <div className="hairline max-w-6xl mx-auto" />
        <Skills />
        <div className="hairline max-w-6xl mx-auto" />
        <GitHubSection />
        <div className="hairline max-w-6xl mx-auto" />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
