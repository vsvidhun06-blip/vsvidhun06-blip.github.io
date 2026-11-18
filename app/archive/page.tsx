import type { Metadata } from "next";
import ArchiveBrowser from "@/components/archive-browser";

export const metadata: Metadata = {
  title: "Project archive",
  description: "Every project, from research systems to coursework, filterable by category, type and technology.",
  alternates: { canonical: "/archive/" },
};

export default function Page() {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <p className="eyebrow">Archive</p>
      <h1 className="display mt-6 text-[clamp(3rem,9vw,8rem)]">
        All the <em>work</em>
      </h1>
      <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[var(--fg-2)]">
        Research, personal projects and coursework. Each entry was written from its source code, report or repository,
        which is named at the bottom of the entry. Open one for details.
      </p>
      <div className="mt-14">
        <ArchiveBrowser />
      </div>
    </div>
  );
}
