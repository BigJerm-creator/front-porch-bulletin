import { Layout } from "@/components/layout/Layout";

export default function About() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-headline text-5xl md:text-6xl font-bold uppercase tracking-widest text-center border-b-4 border-double border-foreground pb-6 mb-10">
          About The Bulletin
        </h1>

        <div className="prose prose-stone prose-lg max-w-none font-serif leading-loose column-gap md:columns-2">
          <p className="first-letter-drop">
            Founded in 1924, <span className="italic">The Front Porch Bulletin</span> has been the steady heartbeat of our community for nearly a century. We believe that local news is the most important news. While the big city papers might carry stories from across the ocean, we bring you the stories from across the street.
          </p>
          <p className="indent-8">
            Whether it's the results of the high school football game, the announcement of a new local business, or the solemn obituaries of those who built this town, we record the history of our home, week by week, edition by edition.
          </p>
          <p className="indent-8">
            In an age of instant digital gratification, we preserve the dignity of the printed word. We take pride in our typesetting, our thorough fact-checking, and our commitment to serving you, the reader.
          </p>
          
          <div className="border-t border-b border-foreground py-6 my-8 break-inside-avoid">
            <h3 className="font-headline font-bold text-2xl uppercase tracking-widest text-center mb-4">
              Editorial Staff
            </h3>
            <ul className="text-center space-y-2 font-mono text-sm uppercase tracking-wider">
              <li><span className="font-bold">Editor in Chief:</span> Margaret "Peggy" Vance</li>
              <li><span className="font-bold">Managing Editor:</span> Thomas Harrison</li>
              <li><span className="font-bold">Sports Desk:</span> Coach Bill Jenkins</li>
              <li><span className="font-bold">Typesetter:</span> Samuel Vance Jr.</li>
            </ul>
          </div>

          <p className="indent-8">
            We are always looking for community contributions. If you have a story, a photograph, or a classified ad, please use our submission form or drop by the office on Main Street. The coffee is always on.
          </p>
        </div>
      </div>
    </Layout>
  );
}
