const churches = [
  {
    name: "First Baptist Church of Haskell",
    address: "112 N. Avenue C, Haskell, TX",
    pastor: "Pastor Dale Whitmore",
    times: "Sun. 9:30am & 11am | Wed. 6:30pm",
    phone: "(940) 864-2241",
  },
  {
    name: "Haskell Church of Christ",
    address: "600 S. 1st Street, Haskell, TX",
    pastor: "Minister Roy Elkins",
    times: "Sun. 10am & 6pm | Wed. 7pm",
    phone: "(940) 864-3105",
  },
  {
    name: "St. Mary's Catholic Church",
    address: "319 W. Young Street, Haskell, TX",
    pastor: "Fr. Miguel Sandoval",
    times: "Sat. 5:30pm | Sun. 8am & 10:30am",
    phone: "(940) 864-2978",
  },
  {
    name: "First United Methodist Church",
    address: "400 N. Avenue D, Haskell, TX",
    pastor: "Rev. Sandra Hobbs",
    times: "Sun. 8:45am & 11am | Wed. 6pm",
    phone: "(940) 864-2546",
  },
  {
    name: "Haskell Assembly of God",
    address: "1107 W. Elsmere Street, Haskell, TX",
    pastor: "Pastor Kevin Troup",
    times: "Sun. 10:30am & 6pm | Wed. 7pm",
    phone: "(940) 864-3812",
  },
];

export function ChurchDirectory() {
  return (
    <div className="mt-8 border-t-2 border-foreground pt-4">
      <h2 className="font-headline text-xs uppercase tracking-widest font-bold border-b border-foreground pb-1 mb-4">
        Church Directory
      </h2>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {churches.map((church) => (
          <div key={church.name} className="border-l-2 border-foreground/30 pl-3">
            <p className="font-headline font-bold text-sm leading-tight mb-0.5">{church.name}</p>
            <p className="font-mono text-xs text-foreground/70 uppercase tracking-wide mb-0.5">{church.pastor}</p>
            <p className="font-serif text-xs text-foreground/80 leading-snug">{church.times}</p>
            <p className="font-mono text-xs text-foreground/60 mt-0.5">{church.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
