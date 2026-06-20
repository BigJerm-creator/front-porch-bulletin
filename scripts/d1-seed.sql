-- D1 Seed File generated 2026-06-20T02:44:36.413Z
-- Import with: npx wrangler d1 execute front-porch-bulletin-db --file=scripts/d1-seed.sql --remote

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  page2_featured INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  show_in_events INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_time TEXT,
  location TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS churches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  pastor TEXT NOT NULL,
  service_times TEXT NOT NULL,
  phone TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  group_type TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_spotlight (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_credit TEXT,
  photos TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clerk_user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'approved_user',
  granted_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  founding_year TEXT NOT NULL DEFAULT '1924',
  body TEXT NOT NULL DEFAULT '',
  editorial_staff TEXT NOT NULL DEFAULT '[]',
  office_location TEXT NOT NULL DEFAULT 'Main Street',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS issue_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  issue_number TEXT NOT NULL DEFAULT '01',
  issue_year INTEGER NOT NULL DEFAULT 2026,
  issue_month INTEGER NOT NULL DEFAULT 5,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS comics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image_url TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crossword_url TEXT,
  word_search_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- categories (9 rows)
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (1, 'Front Page', 'front-page', 'The biggest stories of the week', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (7, 'Church & Faith', 'church-faith', 'Announcements from local congregations', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (11, 'Letters From the Editor', 'letters-from-the-editor', NULL, 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (2, 'Local News', 'local-news', 'What''s happening around town', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (3, 'Community', 'community', 'Neighbor spotlights and community events', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (10, 'School News', 'school-news', 'Learn about new thing happening with our Schools', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (5, 'Letters to the Editor', 'letters', 'Reader letters and opinions', 0);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (12, '4H News', '4h-news', '4H club updates and activities', 1);
INSERT INTO categories (id, name, slug, description, show_in_events) VALUES (13, 'Library News', 'library-news', 'News and events from the Rieger Memorial Library', 1);

-- articles (10 rows)
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (22, 'Library Program Summary ', 'Rieger Memorial Library''s Summer Reading Program', '2026 Summer Reading Program, coming soon to your Library! 

Get ready to dig into a season of stories, fun, and adventure at Rieger Memorial Library!

 READ & LOG FROM HOME
Our Summer Reading Program is hosted on Beanstack!
Start your reading on May 26
Start picking up prizes on June 1st
The more you read, the more prizes you earn& and yesthere are grand prizes too! 

KICKOFF EVENT
Join us for our BIG launch:
Picnic in the Park! 
June 6th at 11 AM | All Ages
Sponsored by the Friends of Rieger Memorial Library, we will have games and hotdogs, free for the whole community! 

DINOSAUR-THEMED FUN ALL SUMMER LONG!
Weve got an incredible lineup of programs, including:
Storyteller Fran Stallings!
Dino-themed Magic Show!
Live animal shows!
Special fossil presentations from Greenleaf & Sequoyah State Parks! 
Crafternoons with Ronelle Baker!
America250th Roping Show!
A Jurassic Meat&Greet with live dinos! 
And a SUMMER FINALE PARTY to wrap it all up!

Theres something for everyonekids, teens, and adults!

A huge THANK YOU to our sponsors, especially
The Friends of Rieger Memorial Library for helping make this program possible for our community!

Stop by, scan the QR code, or visit Beanstack to sign up todayand get ready to UNEARTH A STORY with us this summer! ', 'Sarah Jackson', 'Library News', 0, '2026-05-31T00:00:00.000Z', '2026-05-31T19:01:13.688Z', '2026-06-01T13:21:30.045Z', 1, '/api/storage/objects/uploads/7bc2a69c-909f-442c-9757-5189f471d8df', NULL, 0, 'published', '[{"url":"/api/storage/objects/uploads/7bc2a69c-909f-442c-9757-5189f471d8df","credit":""},{"url":"/api/storage/objects/uploads/2ca23066-3f7e-487f-bde3-0d623afc5743","credit":""}]');
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (21, 'Engagement Announcement', '', 'Looks like Jade and Jakob are making it official. The couple got engaged on June 23rd, 2025. 

Jade Thomas, the child of Carla and Ryan Voyles of Haskell, Ok. Jakob Dinelli, the child of Kristin Mcoy and Tony Dinelli of Mounds, Ok.

The couple met through a high school friend who introduced the two, who went and rode scooters one night, and just never stopped hanging out and have been together for 3 years.

A wedding is planned for August 29th, 2026.

Friends, family, and the community join in congratulating the happy couple as they begin this exciting new chapter together! ', 'Ashley Morgan', 'Community', 0, '2026-06-01T00:00:00.000Z', '2026-05-29T19:39:41.681Z', '2026-06-01T13:19:11.163Z', 0, '/api/storage/objects/uploads/a44432ef-3cc5-4004-a71f-aa496e0ffc58', NULL, 0, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (17, 'What Would You Bring Back to Town If You Could?', '', 'If you gather folks long enough on any front porch, eventually the conversation turns to this question: What would you bring back to town if you could?

Maybe it would be an old business with creaky wood floors and a bell on the front door. Maybe it would be the diner where everybody knew your order before you sat down. Maybe it would be Saturday nights downtown when the streets stayed busy, and there was always somewhere to go.

Some would bring back the movie theater, where a trip to town felt like an event. Others might choose the family-owned grocery store where credit was built on a handshake, and neighbors lingered in the aisles, catching up on the weeks news. A few would say they miss the sound of kids playing outside until the porch lights came on.

And truth be told, many people wouldnt bring back a place at all. Theyd bring back a feeling. The feeling of doors left unlocked. The feeling of everyone showing up when someone needed help. The feeling that town wasnt just where you lived, but who you belonged to.

Every community has changed. Thats the way of the world. Buildings close, roads widen, faces come and go. But memories have a way of reminding us what mattered most in the first place. Sometimes looking back helps us decide whats worth building again.

Maybe the better question is not only what we would bring back, but what we can create now. A new tradition. A new gathering place. A new reason for neighbors to know each other by name.

So Id love to hear from you: What would you bring back to town if you could? An old store? A special event? A sense of community?

Stop us on the street, send us a message, or tell us from your own front porch. Chances are, someone else misses it too.', 'Ashley Morgan', 'Local News', 1, '2026-05-01T00:00:00.000Z', '2026-04-28T13:24:03.849Z', '2026-06-01T13:21:04.988Z', 1, NULL, NULL, 0, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (23, 'Sidewalks, Water Improvements Aim to Support Haskells Growth', '', 'Residents in Haskell can expect to see progress on two major infrastructure projects in the coming months as the city moves forward with plans for new sidewalks and a new water pump system designed to improve water pressure and reduce ongoing water quality notices.

City Manager Michael Keene says both projects are part of a larger effort to modernize infrastructure as the town continues to grow. Weve had several people ask us about the sidewalk from the apartments, the city manager explained. Not just people wanting to use the sidewalk, but drivers saying they were seeing people walking on the road, sometimes in the dark, because they didnt have anywhere else to go.

The new sidewalk project is expected to improve pedestrian safety. Funding for the project came through a grant typically used for road resurfacing, but city leaders chose to prioritize sidewalks and related improvements. Construction is expected to begin sometime in late July, which aligns with the start of the citys new fiscal year.

The project will be a collaborative effort involving city crews, local contractors, county assistance, and even students from the schools FFA program. According to the city manager, students will help build several bridges needed along portions of the sidewalk route. Its really become a community-wide project, he said.

Alongside the sidewalk work, the city is also preparing for a major water system upgrade centered around a new water pump expected to arrive later this summer. The project aims to address repeated TTHM notices that many residents have received over the past several years. TTHMs are chemical compounds that can form in treated surface water after it sits in pipelines for extended periods of time.

Michael Kenne explained that the issue is not caused by contamination within Haskells well water system itself, but rather by treated surface water purchased from Muskogee that travels long distances through pipelines before reaching town. The new pump is designed to increase water pressure and allow more of Haskells well water to move further through the system. City leaders hope this will reduce or eliminate the elevated TTHM readings that have triggered state-required notices. Were hoping once the pump is installed, we wont have these TTHM problems anymore, the city manager said. The pump project was funded through a grant worth more than $70,000. He said the custom-built pump is currently being manufactured and could be installed sometime between July and August.

City leaders also recently approved changes to water rates that will affect residents on the Muskogee water line. Beginning July 1, all residents living inside city limits will pay the same city water rate regardless of which water line serves them.

Beyond infrastructure, city officials say they are optimistic about Haskells future growth. New housing additions, a new gas station, and a developing medical facility are all expected to bring additional services and opportunities to the town in the near future.

Were growing, the city manager said. A lot of things are finally starting to move forward.', 'Ashley Morgan', 'Front Page', 1, '2026-06-01T00:00:00.000Z', '2026-06-01T16:12:30.230Z', '2026-06-03T02:02:17.275Z', 0, NULL, NULL, 0, 'published', '[]');
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (14, 'Library Program Summary ', 'Rieger Memorial Library''s Summer Reading Program', '
2026 Summer Reading Program, coming soon to your Library! 

Get ready to dig into a season of stories, fun, and adventure at Rieger Memorial Library!

 READ & LOG FROM HOME
Our Summer Reading Program is hosted on Beanstack!
Start your reading on May 26
Start picking up prizes on June 1st
The more you read, the more prizes you earn& and yesthere are grand prizes too! 

KICKOFF EVENT
Join us for our BIG launch:
Picnic in the Park! 
June 6th at 11 AM | All Ages
Sponsored by the Friends of Rieger Memorial Library, we will have games and hotdogs, free for the whole community! 

DINOSAUR-THEMED FUN ALL SUMMER LONG!
Weve got an incredible lineup of programs, including:
Storyteller Fran Stallings!
Dino-themed Magic Show!
Live animal shows!
Special fossil presentations from Greenleaf & Sequoyah State Parks! 
Crafternoons with Ronelle Baker!
America250th Roping Show!
A Jurassic Meat&Greet with live dinos! 
And a SUMMER FINALE PARTY to wrap it all up!

Theres something for everyonekids, teens, and adults!

A huge THANK YOU to our sponsors, especially
The Friends of Rieger Memorial Library for helping make this program possible for our community!

Stop by, scan the QR code, or visit Beanstack to sign up todayand get ready to UNEARTH A STORY with us this summer! ', 'Sarah Jackson', 'Library News', 0, '2026-06-01T00:00:00.000Z', '2026-04-22T16:20:49.885Z', '2026-05-31T18:59:20.203Z', 0, '/api/storage/objects/uploads/3a34fb7e-bddf-4e05-8667-6b3eec88aa84', NULL, 0, 'published', '[{"url":"/api/storage/objects/uploads/3a34fb7e-bddf-4e05-8667-6b3eec88aa84","credit":""},{"url":"/api/storage/objects/uploads/dbd36c25-8f80-4527-b810-3ca9761c868f","credit":""}]');
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (13, 'Letter From The Editor', '', 'Well, hey there, neighbor. Pull up a chair, pour yourself a cup of coffee, and sit a spell, because we''ve got some catching up to do.

My name is Ashley Morgan. I was born and raised right down the road in Bixby, but when I married my husband Jeremy back in 2003, a Haskell man through and through, I made the move south and never looked back. We''ve been raising our two kids here ever since, and somewhere along the way, Haskell stopped being the town I moved to and became the town I belong to.

Like a lot of you, I''ve felt the quiet that settled in after our local paper shut down. That particular kind of quiet that shows up when a community loses the place where its stories live. Life kept happening here, good things, hard things, funny things, important things, and there wasn''t a front page to put them on. The idea of bringing back the community newspaper started as a little whisper, just a tiny thought in the back of my head. Then, at a chamber of commerce meeting, Jodie Hampton mentioned she''d love to see a chamber newsletter. It was a passing thought, tossed into the room like a seed. The meeting moved on. But after it was over, Sarah Jackson, the wonderful manager over at Rieger Memorial Library, and I kept talking. Something just clicked: Why not now? Why not me? So here we are.

The Front Porch Bulletin is exactly what the name says. It''s not a formal publication from some faraway editorial board. It''s neighbor to neighbor. It''s the news, the stories, the updates, and the little moments that make this community worth talking about, the kind of things you''d lean over the fence to share, or swap over coffee on a Saturday morning. Spotlights on our students, our businesses, and the groups that make our community strong. We''ve got a church directory so you know where to find your faith community, and a calendar so you never miss a moment that matters. 

I am not a journalist. I''m just a woman who loves this town and thinks its stories deserve to be told. I''m figuring this out as I go, and I hope you''ll be patient with me and maybe even jump in and help. If you''ve got a story to share, an announcement to make, or something you think the community needs to know about, my door and my inbox are always open.

Thank you for picking this up. Thank you for being the kind of community worth writing about.

Now let''s get to talking.

With love from my front porch to yours,
Ashley Morgan,
Editor, The Front Porch Bulletin,
Haskell, Oklahoma.', 'Ashley Morgan', 'Letters From the Editor', 0, '2026-05-01T00:00:00.000Z', '2026-04-15T22:03:33.714Z', '2026-06-01T13:21:09.980Z', 1, '/api/storage/objects/uploads/a0d5854c-8214-4bd7-9d64-526900fb7927', NULL, 1, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (16, 'Haskell 4-H Club Helps Youth Learn, Grow, and Connect ', '', 'The Haskell 4-H Club is giving local youth a chance to learn new skills, make friends, and be part of something meaningful right here in the community.

The club meets once each month to discuss upcoming events and projects, while also taking time for games, crafts, and hands-on activities. Meetings are designed to be both educational and fun, helping members build confidence and leadership skills along the way.

Many people know the name 4-H, but may not know what it stands for. The four Hs represent Head, Heart, Hands, and Health. These values guide members as they participate in programs that encourage learning, service, responsibility, and personal growth.

Youth may enroll in 4-H if they are 8 years old and in the 3rd grade by September 1. Enrollment opens each year on August 1 and must be renewed annually. Registration is completed online through ZSuite at 4h.zsuite.org.

Children do not have to attend Haskell Public Schools to participate. The club welcomes homeschooled students as well as youth from surrounding school districts.
Families interested in learning more can find meeting dates and times on Facebook by searching Haskell 4-H Club.

For additional information, contact the Haskell 4-H Club at 918-520-0156 or the Muskogee County Extension Office at 918-686-7200.

If you have a child who enjoys learning, creating, and trying new things, Haskell 4-H may be a great place to start.', 'Ashley Morgan', '4H News', 0, '2026-04-26T00:00:00.000Z', '2026-04-26T00:35:22.655Z', '2026-06-01T13:21:13.290Z', 1, NULL, NULL, 0, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (19, 'County Commissioner Candidate Focuses on Transparency, Roads, and Rural Communities', '', 'Muskogee County Commissioner candidate Chadwick Cochran says transparency in county government is the driving force behind his campaign, along with improving rural roads, supporting emergency services, and protecting opportunities for small businesses.

During a recent interview, Mr. Cochran repeatedly emphasized that many county decisions are happening behind closed doors, leaving residents unaware of major developments until after they are already underway. The biggest issue is transparency with the county, he said. We just find out about things when theyre happening, and its too late to do anything about it. According to Mr. Cochran, county meetings and discussions should be more accessible to the public through social media updates and live-streamed meetings so residents can stay informed and involved.

Road conditions and emergency response were also major topics throughout the interview. Chadwick shared that volunteer firefighters once saved his life, making support for first responders deeply personal to him. He believes county spending should prioritize emergency services and road maintenance, particularly in rural areas where flooding and deteriorating roads can delay emergency responders. We cant fix everything perfectly overnight, he said, but we can focus on what it takes for responders to safely and reliably get to people during emergencies. 

Mr. Cochran also discussed concerns about how smaller communities such as Haskell, Boynton, Council Hill, and Wainwright are supported compared to more populated areas closer to Muskogee. He said rural communities often feel overlooked despite still paying taxes and relying heavily on county services. He suggested stronger cooperation between the county government and small towns, particularly for maintaining roads and improving emergency access.

Another major issue Chadwick raised involved recently adopted county permit and inspection fees. He argued the current fee structure creates significant financial barriers for small businesses trying to build or expand in the county. Using his own experience in commercial construction and plumbing, Chadwick said he calculated permit costs for a 6,000 square foot building and estimated the county fees could exceed $10,000. Weve pretty much killed small business as far as bringing them in, he said. Were only inviting big business.

Throughout the interview, Chadwick highlighted his professional background in construction, infrastructure, and commercial projects as preparation for the role. He described growing up around road and bridge projects before later attending welding and pipefitting programs through OSUIT and working as a contractor on hospitals, industrial facilities, and infrastructure projects across Oklahoma.

Looking ahead, Mr. Cochran said one of his first goals would be identifying projects already in development throughout the county, including solar farms, data centers, and other large-scale developments, while giving residents more opportunities to voice their opinions before decisions are finalized.

He also stressed the importance of improving dangerous rural roads that impact school buses, emergency responders, and daily travel for county residents.

When asked what he would say to voters frustrated with local government, Chadwick encouraged residents to stay involved and vote.

Vote and be patient, he said. It takes the process to elect someone new, get them into office, and start implementing changes.', 'Ashley Morgan', 'Community', 0, '2026-06-01T00:00:00.000Z', '2026-05-14T12:59:15.053Z', '2026-06-01T13:19:11.163Z', 0, '/api/storage/objects/uploads/4d11e01a-685c-4776-8aa0-d75b8429d916', NULL, 0, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (15, 'Congratulations Wyatt Cole', '2026 Coweta Graduate', '"Congratulations on graduating with the Class of 2026, Wyatt Fisher Cole!!! We pray God''s blessings in your life, and that you go far in life. We want you to know we are so proud of you & love you so very much! - Dad, Mom & Weston Gunner."', 'Stacy Cole', 'Community', 0, '2026-05-01T00:00:00.000Z', '2026-04-23T15:25:50.647Z', '2026-06-01T13:21:00.695Z', 1, '/api/storage/objects/uploads/ff2241e3-814b-4602-ab26-d330aaad2393', NULL, 0, 'published', NULL);
INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit, page2_featured, status, photos) VALUES (20, 'Magyn''s Kitchen Brings Homemade Comfort to the Farmers Market', '', 'If youve stopped by the local Farmers Market lately, chances are youve seen the delicious baked goods at Magyns Kitchen. From classic banana bread to unique flavors like jalape�o bread and chocolate chip coconut bread, Magyn Dutton has quickly become a favorite among locals looking for homemade treats.

What started as a simple Christmas project for her church has now grown into a thriving small business entering its third summer season. One Christmas, I made small canned gifts for everyone at church, Magyn explained. My pastor told me I should try selling them at the Farmers Market, so I did. Alongside her canned goods, Magyn brought a few loaves of cinnamon bread. They sold out quickly, and customers immediately began asking for more varieties. Before the year was over, I was making around 20 loaves a week and getting invited to different events, she said.

Today, Magyns Kitchen offers a growing selection of homemade breads that keep customers coming back week after week. While banana bread remains her most popular item, her jalape�o bread has become a crowd favorite this year. Personally, though, Magyn says her favorite is the chocolate chip coconut bread. That one happened by accident, she laughed. I found coconut in the freezer and added it to a recipe, and it just worked.

Beyond the bread, Magyn says what she loves most is being part of the community itself. I really love the small-town feeling here, she said. Ive never experienced that before, and I just love being part of it. As a busy mother of five with chickens, pets, and a full household to care for, Magyn spends most days balancing family life while baking bread in between daily tasks.

One surprising fact about Magyn? Despite her baking talent, there is one thing she cannot master. I cannot make sourdough bread, she admitted with a laugh. Any other bread product, I can make no problem. But sourdough? Its just not me.

Magyn currently sells at the Farmers Market every Saturday, weather permitting, and is expanding into taking custom bread orders throughout the week.

She encourages community members to continue supporting local businesses whenever possible. If were not supporting local businesses, were not going to keep that small-town feel, Magyn said. People here work here, serve the community here, and their kids go to school here. We need to support each other.

Customers can also support Magyns Kitchen by leaving reviews on her Facebook page and sharing their experiences with others.

At the heart of Magyns Kitchen is more than just homemade bread. Its a reminder of the warmth, connection, and support that make small-town communities special.', 'Ashley Morgan', 'Community', 0, '2026-06-01T00:00:00.000Z', '2026-05-29T00:39:49.051Z', '2026-06-01T13:19:11.163Z', 0, '/api/storage/objects/uploads/5486d2f9-42e4-4873-91ea-6068977cebfb', NULL, 0, 'published', NULL);

-- calendar_events (63 rows)
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (9, 'Kentucky Derby', '2026-05-02T00:00:00.000Z', '16:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:19:05.240Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (10, 'AARP Webinar', '2026-05-14T00:00:00.000Z', '09:30', 'Rieger Memorial Library', 'Q and A session over AI.', '2026-04-11T16:19:59.143Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (11, 'OSU AG Class', '2026-05-28T00:00:00.000Z', '16:00', 'Rieger Memorial Library', 'Agriculture and 4-H classes offered by OSU Extension office for children K-12.', '2026-04-11T16:20:40.229Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (12, 'Adult Craft', '2026-05-21T00:00:00.000Z', '15:00', 'Rieger Memorial Library', 'Make a book vase.', '2026-04-11T16:23:06.364Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (13, 'Sequoyah State Park', '2026-05-20T00:00:00.000Z', '14:00', 'Rieger Memorial Library', 'Explorations in nature featuring paleontology and fossils.', '2026-04-11T16:25:27.492Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (14, 'Dinosaurs Among Us', '2026-05-27T00:00:00.000Z', '14:00', 'Rieger Memorial Library', 'Hear facts and fiction about dinosaurs from storytelling biologist Fran Stallings.', '2026-04-11T16:27:40.151Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (15, 'Diabetes Undone', '2026-05-05T00:00:00.000Z', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11T16:32:24.261Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (64, 'Flag Day', '2026-06-14T00:00:00.000Z', NULL, NULL, NULL, '2026-05-31T20:06:47.367Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (17, 'Masterpiece Makers 3rd Annual Student Art Show', '2026-05-22T00:00:00.000Z', '18:00', 'Church of Christ 402 W. Main St. Haskell, Ok', NULL, '2026-04-11T16:37:32.857Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (65, 'Father''s Day', '2026-06-21T00:00:00.000Z', NULL, NULL, NULL, '2026-05-31T20:07:01.828Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (19, 'Cinco de Mayo', '2026-05-05T00:00:00.000Z', NULL, NULL, NULL, '2026-04-11T16:40:13.190Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (20, 'Farmers Market', '2026-05-02T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:41:48.409Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (37, 'Storytime', '2026-06-02T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:01:00.106Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (22, 'City Hall Meeting', '2026-05-12T00:00:00.000Z', '18:00', 'City Hall', NULL, '2026-04-11T16:43:14.892Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (23, 'Memorial Day', '2026-05-25T00:00:00.000Z', NULL, NULL, NULL, '2026-04-11T16:43:41.109Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (24, 'Diabetes Undone', '2026-05-12T00:00:00.000Z', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11T16:52:59.689Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (25, 'Diabetes Undone', '2026-05-19T00:00:00.000Z', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11T16:52:59.847Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (26, 'Diabetes Undone', '2026-05-26T00:00:00.000Z', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11T16:52:59.953Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (27, 'Farmers Market', '2026-05-09T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11T19:11:53.975Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (28, 'Farmers Market', '2026-05-16T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11T19:11:54.065Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (36, 'Post 56 American Legion Meeting', '2026-06-25T00:00:00.000Z', '19:00', 'American Legion 100 E Commercial', 'Monthly Meeting', '2026-04-29T15:19:31.880Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (38, 'Storytime', '2026-06-09T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:01:00.231Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (39, 'Storytime', '2026-06-16T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:01:00.367Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (40, 'Storytime', '2026-06-23T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:01:00.463Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (41, 'Storytime', '2026-06-30T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:01:00.591Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (42, 'Tulsa Zoo 2 U', '2026-06-03T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:02:25.374Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (43, 'Roarday Activites', '2026-06-04T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:04:12.145Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (44, 'Roarday Activites', '2026-06-11T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:04:12.359Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (45, 'Roarday Activites', '2026-06-18T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:04:12.538Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (47, 'Dino Pictures', '2026-06-11T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:05:36.062Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (48, 'Picnic in the Park', '2026-06-06T00:00:00.000Z', '11:00', 'Blue Park', NULL, '2026-05-24T18:31:06.155Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (49, 'Funky Monkey Magic', '2026-06-08T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:31:49.134Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (50, 'PAWSitively Wild Animals', '2026-06-09T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:32:34.392Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (51, '2News Weather', '2026-06-15T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:33:04.357Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (52, 'Greenleaf State Park', '2026-06-17T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:33:53.484Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (53, 'Juneteenth', '2026-06-19T00:00:00.000Z', NULL, NULL, NULL, '2026-05-24T18:34:23.079Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (54, 'Crafternoon with Ronelle Baker', '2026-06-24T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:35:09.178Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (55, 'OSU Ag in the Classroom', '2026-06-25T00:00:00.000Z', '14:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:35:46.236Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (2, 'Bulletin submission deadline', '2026-06-25T00:00:00.000Z', '17:00', 'thefrontporchbulletin@gmail.com', NULL, '2026-04-11T15:34:05.988Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (29, 'Farmers Market', '2026-06-06T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11T19:11:54.174Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (56, 'Farmers Market', '2026-06-13T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:39:45.252Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (57, 'Farmers Market', '2026-06-20T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:39:45.564Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (58, 'Farmers Market', '2026-06-27T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-05-24T18:39:45.765Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (18, 'Pa-A-Linn', '2026-06-01T00:00:00.000Z', '18:30', NULL, NULL, '2026-04-11T16:39:45.392Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (21, 'Friends of the Library Meeting', '2026-06-15T00:00:00.000Z', '18:00', 'Rieger Memorial Library', 'Monthly Meeting', '2026-04-11T16:42:34.906Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (16, 'Chamber of Commerce Meeting', '2026-06-22T00:00:00.000Z', '12:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:34:29.285Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (35, 'Stone Bluff Senior Center Lunch', '2026-06-11T00:00:00.000Z', '11:00', 'Stone Bluff Senior Center', '11-12:30 
Eat in $5  Take Out $6
Everyone welcome!', '2026-04-26T00:42:52.043Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (60, 'GO VOTE!', '2026-06-16T00:00:00.000Z', NULL, NULL, NULL, '2026-05-24T18:46:58.619Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (31, 'All Sports Camp', '2026-05-12T00:00:00.000Z', '08:00', 'Haskell High School', '1-12 grades', '2026-04-13T16:16:44.363Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (1, 'High School Graduation', '2026-05-03T00:00:00.000Z', '15:00', 'Franklin Event Center', NULL, '2026-04-10T15:12:12.235Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (3, 'Storytime', '2026-05-01T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11T15:51:25.430Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (4, 'Storytime', '2026-05-08T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11T15:51:49.371Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (5, 'Storytime', '2026-05-15T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:10:01.776Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (6, 'Last Day of School', '2026-05-07T00:00:00.000Z', NULL, NULL, NULL, '2026-04-11T16:14:33.283Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (7, 'Storytime', '2026-05-22T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:15:40.243Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (8, 'Storytime', '2026-05-29T00:00:00.000Z', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11T16:17:07.918Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (30, 'Farmers Market', '2026-05-30T00:00:00.000Z', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11T19:11:54.237Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (32, 'Mother''s Day', '2026-05-10T00:00:00.000Z', NULL, NULL, NULL, '2026-04-15T18:40:58.716Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (33, 'Basketball Camp', '2026-05-21T00:00:00.000Z', NULL, 'Franklin Event Center', '1st-8th grade $30', '2026-04-22T16:28:01.961Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (34, 'Basketball Camp', '2026-05-22T00:00:00.000Z', NULL, 'Franklin Event Center', '1st-8th grade $30', '2026-04-22T16:28:37.150Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (61, 'Haskell Public Safety Complex Groundbreaking Ceremony', '2026-06-05T00:00:00.000Z', '10:30', '300 E Main St', NULL, '2026-05-24T19:01:07.251Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (62, 'Cooking Class', '2026-06-14T00:00:00.000Z', '15:00', 'All Nations Seventh Day Adventist 1192 S Haskell Blvd', NULL, '2026-05-31T20:03:12.412Z');
INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES (63, 'God''s Treasure Quest', '2026-06-08T00:00:00.000Z', '18:00', 'All Nations Seventh Day Adventist', 'Week long epic adventure.', '2026-05-31T20:05:02.132Z');

-- churches (10 rows)
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (3, 'First Assembly of God', '409 W. Cedar St., Haskell, Ok', 'Rev. Donald Jr. Hogue & Cathy Hogue', 'Sunday School 9:30 am Worship and Kids Zone 10:30 am |Wednesday Adult Bible Study, Live Loud (ages 2-11) and Amplified Uth (6th-12th grade)  7:00 pm', '(918) 482-5645', 3, '2026-04-09T20:37:40.772Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (14, 'All Nations Seventh-Day Adventist', '1192 S. Haskell Blvd., Haskell, Ok', 'Pastor Unknown', 'Saturday Sabbath School 9:30 am Worship 11:00 am| Youth Meetings 1st & 3rd Saturday 2:00 pm| Clothes Closet Thursday 5-7 pm| Thursday Bible Study 6:30 pm| Women''s Ministry & Book Club 4th Sunday 3:00 pm', '(918) 736-9771', 15, '2026-04-12T15:03:07.136Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (13, 'Stone Bluff Baptist', '19141 Us-64 Haskell, Ok', 'Pastor Josh Willinger', 'Sunday  School 10:00 am Service 11:00 am Evening 6:00 pm| Pot Luck 6:00 pm Bible study 6:30 pm Team Kids 6:30 pm', '(918) 313-3599', 13, '2026-04-12T14:47:53.718Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (2, 'First Free Will Baptist', '500 W. Skelly Road', 'Pastor Jay Dixon', 'Sun. Small Groups 10:00 am Worship 10:50 am Night Service 6:00 pm | Wed. 6:30 pm', '(918) 482-3410', 2, '2026-04-09T20:37:40.772Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (15, 'Pleasant Valley Church of Christ', '22858 W 40th Street N, Haskell Ok', 'Pastor Unknown', 'Sunday Service 11am and 6pm ', '918-000-0000', 17, '2026-05-24T18:51:29.968Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (1, 'First Baptist Church', '1401 N Haskell Blvd., Haskell, Ok', 'Pastor Tim Hare', 'Sunday Breakfast 9:00 am Small Groups 9:45 am Worship 10:45 am| Wednesday Golden Agers 10:00 am  Hot meal 5:15 pm (During the school year) Kingdom Kids 6:00 pm (During the school year) Youth Group 6:00 pm', '(918) 482-3225', 1, '2026-04-09T20:37:40.772Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (10, 'United Pentecostal', '126 W. Franklin St. Haskell, Ok', 'Pastor James Stewart', 'Sunday Groups 10:00 am Service 10:45 am| Wednesday 7:30 pm', '(918) 482-3389', 10, '2026-04-12T14:37:16.799Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (4, 'Central Church of Christ', '402 W. Main St., Haskell, Ok', 'Pastor Unknown', 'Sunday Bible Class 9:30 am & Worship10:30am Evening Worship 5:00 pm | Wed. 7:00 pm', '(918) 482-9999', 4, '2026-04-09T20:37:40.772Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (5, 'Landmark Bible Church', '221 N. Broadway, Haskell, Ok', 'Pastor Unknown', 'Sun. 10:30am & 6pm | Wed. 7pm', '(918) 482-9289', 5, '2026-04-09T20:37:40.772Z', NULL, NULL, NULL);
INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit, photos) VALUES (6, 'Voice of Hope Training Center', '520 S Cherokee Ave. Haskell, Ok', 'Pastor Bryan Londagin', 'Sunday 10:30 am |Wednesday Youth 6:00 pm Dinner 6:30 pm Bible Study 7:00 pm ', '918-232-3597', 6, '2026-04-12T01:05:41.893Z', NULL, NULL, NULL);

-- business_spotlight (1 rows)
INSERT INTO business_spotlight (id, name, business_type, description, photo_url, photo_credit, created_at, updated_at, status, photos) VALUES (1, 'Joe''s Tire and Body Shop', 'Auto repair shop', 'For many people in Haskell, Take it to Joes is more than just a slogan. Its a piece of local wisdom passed around whenever someone needs help with a tire, trailer, repair, or just about anything with an engine. This story is rooted in family, perseverance, and a deep connection to the community.

Joes journey into the tire business started at a young age while working alongside his uncle at a small used tire shop near Andrews Accounting. After his uncle passed away during Joes freshman year of high school, the shop was left to him. I started down there and it just kind of evolved into what it is today, Joe shared.

After graduating high school, Joe stayed with the business while many of his classmates pursued other careers. Though he studied welding at Vo-Tech, job opportunities were scarce in the early 1990s. Instead, he continued building the tire business, and before long, the shop began to grow.

That growth eventually led Joe to build the current location that many Haskell residents know today.

One of the most memorable parts of Joes story actually started years before he ever owned the property. As a teenager, he helped sell watermelons under a large tree near the highway where the tire shop now stands. While watching traffic pass by, he remembered thinking it would be the perfect location for a business someday.

Years later, after the railroad shut down and the property became available, Joe purchased the land from Union Pacific while still only 18 or 19 years old. It was a cool full-circle moment, he said.

Since opening at the current location, business has stayed busy, thanks largely to the loyalty of the Haskell community. You take care of people, theyll come back to you, Joe explained.

That support has allowed the business to grow far beyond tires alone. While oil changes and tire services remain the shops most popular offerings, Joes Tire and Body Shop also handles brakes, batteries, trailer repairs, tractor air conditioning, welding, paint and body work, and even farm tire service in the field. The business motto, Take it to Joes, reflects that wide variety of services.

We arent just fixing peoples cars, Angel Walker shared. Were helping people get where they need to go. Whether its work, a doctors appointment, or the ball field, were helping them get there.

In addition to the tire shop, the family has also expanded into other ventures around town, including a car wash and an ice house. Joe says the communitys support has made every project successful. Anything weve tried has worked, he said. But you have to give it time. Those first years can be tough.

Even with the long hours and hectic days, Angel says one of the best parts of the job is watching local families grow up over the years. Children who once sat in the waiting room now return driving vehicles of their own. Its been fun seeing families grow up, she shared.

As summer approaches, the shop is preparing for another busy season filled with vacation vehicle checkups, hay field repairs, and air conditioning fixes during Oklahomas hottest months. Joe also hopes to add a few new employees to the team this year.

Above all, Joe says he remains grateful to the people who continue supporting local businesses in Haskell. From the day I opened, the community has backed us, he said. I appreciate the support.', '/api/storage/objects/uploads/56972bcb-48cc-426b-817d-37103bb67e67', 'Joe''s Tire and Body Shop', '2026-04-11T17:57:15.807Z', '2026-05-29T00:56:26.279Z', 'published', NULL);

-- group_spotlight (1 rows)
INSERT INTO group_spotlight (id, name, group_type, description, photo_url, photo_credit, created_at, updated_at, status, photos) VALUES (1, 'Pa-A-Linn Women''s Club', 'Volunteer Organization', 'For nearly seven decades, the GFWC-OK Pa-A-Linn Women''s Club has quietly made a lasting impact on the Haskell community through volunteerism, charitable giving, and a commitment to improving the lives of others.

The club''s roots date back to the 1950s when ten local women began meeting with a shared vision of serving their community. They chose the name "Pa-A-Linn," which means "ten" in the Creek language. In 1957, the group officially became federated with the General Federation of Women''s Clubs (GFWC), making this year its 69th year of service. 

As part of the international GFWC organization, Pa-A-Linn focuses on community improvement through volunteer service. The organization supports projects involving the arts, conservation, education, home life, international affairs, public affairs, and other community-focused initiatives.

Membership is open to any area woman interested in volunteering and helping improve the community. The club meets on the first Monday of each month during the school year, typically in members'' homes.

Over the years, Pa-A-Linn has become known for its generous support of local organizations and families. The club provides annual donations to the Haskell Fire Department, Friends of Rieger Memorial Library, Post 56 American Legion, and the Backpack for Kids program. Members also support local benefit efforts, recognize graduating Haskell High School seniors through scholarships, gifts, and special events, and assist Haskell Public Schools with various needs throughout the year.

Beyond Haskell, the club contributes to Women in Safe Homes (WISH) in Muskogee and supports Operation Smile by funding surgeries for children with cleft conditions. Members also participate in holiday giving efforts through the Haskell Care Center and sponsor the town''s annual Christmas Parade.

One of the club''s most anticipated annual events is the Christmas Home Tour, which serves as its only fundraiser. The 15th annual tour is scheduled for December 5-6, 2026.

When asked what they are most proud of, members pointed to their willingness to serve. "Our volunteering spirit, always ready to help," was their simple but meaningful response.

Looking ahead, the club remains focused on a single goal: continuing to improve the community they call home. One thing many residents may not know is that Pa-A-Linn makes a point to support local businesses whenever possible.

For nearly 70 years, the women of Pa-A-Linn have demonstrated that a small group of dedicated volunteers can make a big difference. Their legacy of service continues to strengthen Haskell, one project, donation, and helping hand at a time.', '/api/storage/objects/uploads/446d83f1-6f16-4bad-90f2-54d174c99a62', 'Facebook', '2026-04-11T17:59:40.392Z', '2026-05-31T19:59:17.142Z', 'published', '[{"url":"/api/storage/objects/uploads/446d83f1-6f16-4bad-90f2-54d174c99a62","credit":"Facebook"}]');

-- student_spotlight (1 rows)
INSERT INTO student_spotlight (id, name, school, grade, description, photo_url, created_at, updated_at, photo_credit, status, photos) VALUES (1, 'Meet Your 2026 Haskell Valedictorians!', 'Haskell High School', 'Grade 12', 'Congratulations graduates! 
Back Row (left to right):
Ryker Fagg, Jeffrey Bonebrake, Blastadeo Salazar, Ryker Porter, Noah Ellis, Cooper Votaw
Bottom Row (left to right):
Natalee Deckard, Amy Ortega, Cheyanna Morgan, Hayden Wentworth, Josie Enkey', '/api/storage/objects/uploads/ae4c547a-b2c7-4ec0-bfb1-c5df507e7ffb', '2026-04-09T20:37:40.772Z', '2026-05-31T19:43:20.718Z', 'Haskell High School', 'pending-disable', NULL);

-- newsletter_subscribers (8 rows)
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (1, 'Michael Jones', 'mjones@haskellps.org', '2026-05-01T14:21:41.281Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (2, 'Chelsea Pernell', 'pernell.chelsea@gmail.com', '2026-05-01T14:54:36.606Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (3, 'Laurie Gibson', 'laurie448@yahoo.com', '2026-05-01T15:19:26.430Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (4, 'Bobby Gist', 'bgist3@hotmail.com', '2026-05-01T15:50:15.504Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (5, 'Beverly Howard', 'annieok59@yahoo.com', '2026-05-04T16:21:11.815Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (6, 'Shelley Forbed', 'sforbes78@icloud.com', '2026-05-05T04:31:41.801Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (7, 'Kathy Rose', 'kr7130@gmail.com', '2026-05-17T21:02:25.223Z');
INSERT INTO newsletter_subscribers (id, name, email, subscribed_at) VALUES (8, 'Faye Miller', 'faye.miller@rocketmail.com', '2026-06-03T23:08:48.427Z');

-- user_roles (5 rows)
INSERT INTO user_roles (id, clerk_user_id, role, granted_at) VALUES (5, 'user_3CEicPyK7pQPWCYbXyPIYXLYjOE', 'admin', '2026-04-13T14:13:21.746Z');
INSERT INTO user_roles (id, clerk_user_id, role, granted_at) VALUES (6, 'user_3CEhzkcABoa4GQPljap2ehF4eFu', 'admin', '2026-04-13T14:13:57.276Z');
INSERT INTO user_roles (id, clerk_user_id, role, granted_at) VALUES (3, 'user_3C8RieDe4Djrw09MjSZ0AUxFFsG', 'admin', '2026-04-12T03:21:51.799Z');
INSERT INTO user_roles (id, clerk_user_id, role, granted_at) VALUES (4, 'user_3CEgXdUUZMPdfE25P7SdrAip8Vp', 'admin', '2026-04-12T03:21:51.799Z');
INSERT INTO user_roles (id, clerk_user_id, role, granted_at) VALUES (7, 'user_3DDQwsH4oowlQGTgEZG5OFzcNTH', 'admin', '2026-05-03T13:22:35.015Z');

-- about_content (1 rows)
INSERT INTO about_content (id, founding_year, body, editorial_staff, office_location, updated_at) VALUES (1, '2026', 'Well, hey there, neighbor. Pull up a chair, pour yourself a cup of coffee, and sit a spell, because we''ve got some catching up to do.

My name is Ashley Morgan. I was born and raised right down the road in Bixby, but when I married my husband Jeremy back in 2003, a Haskell man through and through, I made the move south and never looked back. We''ve been raising our two kids here ever since, and somewhere along the way, Haskell stopped being the town I moved to and became the town I belong to.

Like a lot of you, I''ve felt the quiet that settled in after our local paper shut down. That particular kind of quiet that shows up when a community loses the place where its stories live. Life kept happening here, good things, hard things, funny things, important things, and there wasn''t a front page to put them on. The idea of bringing back the community newspaper started as a little whisper, just a tiny thought in the back of my head. Then, at a chamber of commerce meeting, Jodie Hampton mentioned she''d love to see a chamber newsletter. It was a passing thought, tossed into the room like a seed. The meeting moved on. But after it was over, Sarah Jackson, the wonderful manager over at Rieger Memorial Library, and I kept talking. Something just clicked: Why not now? Why not me? So here we are.

The Front Porch Bulletin is exactly what the name says. It''s not a formal publication from some faraway editorial board. It''s neighbor to neighbor. It''s the news, the stories, the updates, and the little moments that make this community worth talking about, the kind of things you''d lean over the fence to share, or swap over coffee on a Saturday morning. Spotlights on our students, our businesses, and the groups that make our community strong. We''ve got a church directory so you know where to find your faith community, and a calendar so you never miss a moment that matters. 

I am not a journalist. I''m just a woman who loves this town and thinks its stories deserve to be told. I''m figuring this out as I go, and I hope you''ll be patient with me and maybe even jump in and help. If you''ve got a story to share, an announcement to make, or something you think the community needs to know about, my door and my inbox are always open.

Thank you for picking this up. Thank you for being the kind of community worth writing about.

Now let''s get to talking.

With love from my front porch to yours,
Ashley Morgan
Editor, The Front Porch Bulletin
Haskell, Oklahoma', '[{"role":"Editor in Chief","name":"Ashley Morgan"},{"role":"Developmemnt","name":"Jeremy Morgan"}]', '607 S. Broadway', '2026-04-26T00:38:08.353Z');

-- issue_settings (1 rows)
INSERT INTO issue_settings (id, issue_number, issue_year, issue_month, updated_at) VALUES (1, '02', 2026, 6, '2026-06-01T16:07:51.820Z');

-- comics (1 rows)
INSERT INTO comics (id, image_url, caption, status, created_at, updated_at) VALUES (1, '/api/storage/objects/uploads/d4ca8da5-a5f6-4e92-a2ea-c78a7ac123a9', 'Bob + Marley by Keely Dutton', 'published', '2026-05-31T17:31:00.658Z', '2026-05-31T17:37:39.165Z');

-- puzzles (1 rows)
INSERT INTO puzzles (id, crossword_url, word_search_url, status, created_at, updated_at) VALUES (1, '/api/storage/objects/uploads/b1a031f1-0883-4a73-92b9-4bf770a4186d', '/api/storage/objects/uploads/39c64664-5bc4-4db2-8cb7-608f631bbb34', 'published', '2026-05-31T18:48:00.107Z', '2026-05-31T18:48:00.107Z');

PRAGMA foreign_keys = ON;
