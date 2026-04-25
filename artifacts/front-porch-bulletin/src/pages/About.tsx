import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type StaffMember = { role: string; name: string };

type AboutData = {
  foundingYear: string;
  body: string;
  editorialStaff: string;
  officeLocation: string;
};

const FALLBACK: AboutData = {
  foundingYear: "1924",
  body: "Founded in 1924, The Front Porch Bulletin has been the steady heartbeat of our community for nearly a century. We believe that local news is the most important news. While the big city papers might carry stories from across the ocean, we bring you the stories from across the street.\n\nWhether it's the results of the high school football game, the announcement of a new local business, or the stories of those who built this town, we record the history of our home, week by week, edition by edition.\n\nIn an age of instant digital gratification, we preserve the dignity of the printed word. We take pride in our typesetting, our thorough fact-checking, and our commitment to serving you, the reader.\n\nWe are always looking for community contributions. If you have a story, a photograph, or a classified ad, please use our submission form or drop by the office on Main Street. The coffee is always on.",
  editorialStaff: "[]",
  officeLocation: "Main Street",
};

export default function About() {
  const [data, setData]       = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/about`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const about = data ?? FALLBACK;

  let staff: StaffMember[] = [];
  try {
    const parsed = JSON.parse(about.editorialStaff ?? "[]");
    staff = Array.isArray(parsed) ? parsed : [];
  } catch {
    staff = [];
  }

  const paragraphs = about.body
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-5xl md:text-6xl font-bold uppercase tracking-widest text-center border-b-4 border-double border-foreground pb-6 mb-10">
          About The Bulletin
        </h1>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="font-mono text-sm uppercase tracking-widest text-foreground/30 animate-pulse">Loading…</p>
          </div>
        ) : (
          <div className="prose prose-stone prose-lg max-w-none font-serif leading-loose md:columns-2 column-gap">
            {paragraphs.map((para, i) => (
              <p key={i} className={i === 0 ? "first-letter-drop" : "indent-8"}>
                {para}
              </p>
            ))}

            {staff.length > 0 && (
              <div className="border-t border-b border-foreground py-6 my-8 break-inside-avoid">
                <h3 className="font-headline font-bold text-2xl uppercase tracking-widest text-center mb-4">
                  Editorial Staff
                </h3>
                <ul className="text-center space-y-2 font-mono text-sm uppercase tracking-wider">
                  {staff.map((m, i) => (
                    <li key={i}>
                      <span className="font-bold">{m.role}:</span> {m.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
