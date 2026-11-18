import Hero from "@/components/home/hero";
import { About, AlsoBuilt, AtAGlance, Contact, FeaturedWork, Journey, Research } from "@/components/home/sections";
import Skills from "@/components/home/skills";
import LeetCode from "@/components/home/leetcode";

export default function Home() {
  return (
    <>
      <Hero />
      <AtAGlance />
      <About />
      <FeaturedWork />
      <Research />
      <AlsoBuilt />
      <Skills />
      <LeetCode />
      <Journey />
      <Contact />
    </>
  );
}
