import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Impact } from "@/components/impact";
import { Research } from "@/components/research";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { Projects } from "@/components/projects";
import { Footer } from "@/components/footer";

/**
 * The Contact section is below the fold and ships interactive form logic, so it
 * is code-split into its own chunk. SSR stays enabled so the markup is still in
 * the initial HTML for SEO and no-JS users.
 */
const Contact = dynamic(() =>
  import("@/components/contact").then((m) => m.Contact),
);

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Impact />
        <Research />
        <Experience />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
