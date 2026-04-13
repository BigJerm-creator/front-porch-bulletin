import { db, pool } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./lib/logger";

export async function seedIfEmpty(): Promise<void> {
  logger.info("Running seed — inserting any missing base records...");

  // ── Categories ──────────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO categories (id, name, slug, description, show_in_events) VALUES
    (1,  'Front Page',            'front-page',   'The biggest stories of the week',          false),
    (2,  'Local News',            'local-news',   'What''s happening around town',            true),
    (3,  'Community',             'community',    'Neighbor spotlights and community events', true),
    (5,  'Letters to the Editor', 'letters',      'Reader letters and opinions',              false),
    (7,  'Church & Faith',        'church-faith', 'Announcements from local congregations',   false),
    (10, 'School News',           'school-news',  'Learn about new thing happening with our Schools', true)
    ON CONFLICT (id) DO NOTHING
  `);

  // ── Articles ─────────────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO articles (id, title, subtitle, content, author, category, featured, published_at, created_at, updated_at, archived, photo_url, photo_credit) VALUES
    (1,
      'Water Tower Repair Finally Scheduled for Elm Street Reservoir',
      'Residents asked to conserve water during two-week maintenance window',
      'After nearly three years of petitions from residents on the east side of town, the Municipal Water Authority has confirmed that repairs to the aging Elm Street water tower will begin the week of April 14th. The tower, which was constructed in 1961, has shown significant rust deterioration along its lower support struts and has been the subject of ongoing concern from the county health inspector.

Public Works Director Harold Finney told the Bulletin on Wednesday that the project will require partial drainage of the reservoir during the first week of work. "We''re asking folks to be mindful of their water use," said Finney. "Morning showers, yes. Washing the car, let''s hold off."

The two-week project is expected to cost the town approximately $84,000, a portion of which will be offset by a state infrastructure grant secured last fall by Councilwoman Dolores Hutchins. Work is set to begin at 7 a.m. and conclude by 4 p.m. on weekdays, with no weekend operations planned in consideration of the Elm Street neighborhood.',
      'Ruth Ellen Kasprowicz', 'Front Page', true,
      '2026-04-03 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (2,
      'Dairy Queen Announces Return of Dilly Bar — With a Twist',
      NULL,
      'After a winter hiatus that many residents called "too long," the Dairy Queen on Route 9 has confirmed that Dilly Bars will return to the menu starting Saturday, April 5th — but with a new flavor in tow: strawberry cheesecake.

Owner and operator Frank Gunderson said the new flavor was the result of a suggestion box he placed near the register last October. "Somewhere around forty people wrote ''strawberry cheesecake,'' so we figured there was something to it," Gunderson said with a laugh.

The original chocolate Dilly Bar will remain available. Hours are 11 a.m. to 9 p.m. Sunday through Thursday, and 11 a.m. to 10 p.m. on Fridays and Saturdays.',
      'Staff Reporter', 'Local News', false,
      '2026-04-02 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (3,
      'Vera Shipley, 89, Remembered as Heart of the Quilting Circle',
      'She never missed a Thursday meeting in twenty-two years',
      'Vera Louise Shipley, born March 2nd, 1936, and a resident of Millbrook her entire life, passed away peacefully at home on the evening of Monday, March 31st, surrounded by her children and grandchildren.

Vera was, by all accounts, a woman who expressed love through her hands. She joined the Millbrook Ladies Quilting Circle in 1979 and did not miss a single Thursday meeting for twenty-two years, until her health made the walks to the church hall difficult. Her quilts hang in the homes of more than sixty families in this town, and three of them are on permanent display at the county historical museum.

She is survived by her daughter Carol Shipley-Marsh of Millbrook, her son Douglas Shipley of Prescott, four grandchildren, and one great-grandchild on the way.

A memorial service will be held at First Lutheran Church on Saturday, April 12th, at 2 p.m. In lieu of flowers, the family asks for donations to the Millbrook Public Library children''s reading fund.',
      'Submitted by the Shipley Family', 'Obituaries', false,
      '2026-04-01 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (5,
      'Potluck Dinner at St. Michael''s to Benefit Food Pantry',
      NULL,
      'St. Michael''s Catholic Church is hosting its annual spring potluck dinner on Saturday, April 19th, beginning at 5:30 p.m. in the fellowship hall. All proceeds from the $8 suggested donation at the door will go directly to the Millbrook Community Food Pantry.

Parishioners and community members alike are encouraged to bring a dish to share. The church asks that you bring enough for eight to ten servings and label any items containing common allergens. Desserts are especially welcome.

"We had over 200 people last year," said event organizer Sister Margaret Flannery. "Every single dollar we raised bought groceries for our neighbors. That''s what this community does."

For more information, call the church office at 555-0142.',
      'Staff Reporter', 'Church & Faith', false,
      '2026-03-30 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (7,
      'A Letter of Thanks to Our Postal Carriers',
      NULL,
      'To the Editor:

I want to use this space to say something that perhaps does not get said enough: thank you to our postal carriers. I am an 81-year-old widow living on the north end of Calloway Street, and every single day, rain, snow, or blistering July heat, my mail arrives. My carrier, whose name I will not print without his permission, always makes sure my packages are left under the awning when it rains. He waves to me when I''m at the window.

These are small things. But when you live alone, small things are not small at all.

Thank you.

— Mildred Oakes, Millbrook',
      'Mildred Oakes', 'Letters to the Editor', false,
      '2026-03-28 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (10,
      'Library Spring Book Sale Returns — Hardcovers $1, Paperbacks 50 Cents',
      NULL,
      'The Millbrook Public Library''s Spring Book Sale will be held April 25th through April 27th in the library''s community room. Books are donated by residents and past sales have included everything from bestselling fiction to cookbooks, local history, and children''s picture books.

Hardcovers are priced at $1, paperbacks at 50 cents, and children''s books at 25 cents. Library volunteers ask that buyers bring their own bags.

The sale runs from 9 a.m. to 5 p.m. Friday and Saturday, and 12 p.m. to 4 p.m. on Sunday. Proceeds support new acquisitions for the library''s adult and juvenile collections.',
      'Staff Reporter', 'Community', false,
      '2026-04-01 18:22:23.52855', '2026-04-04 18:22:23.52855', '2026-04-04 18:22:23.52855', false, NULL, NULL),

    (11,
      'School Board Receives Grant!',
      'Haskell School Board is set to receive a nominal grant to apply to some new construction plans.',
      'The Haskell School Board is set to receive a large grant for an upcoming construction project expected to start the summer of 2027. The construction project is set to finish fall of 2029 and will comprise of a 200,000 sq ft two story addition to the Highschool proving over 100 new classrooms and a new state of the art cafeteria.',
      'Janice Dody', 'School News', false,
      '2026-04-10 00:00:00', '2026-04-10 14:53:19.905739', '2026-04-10 14:53:19.905739', false, NULL, NULL)

    ON CONFLICT (id) DO NOTHING
  `);

  // ── Churches ─────────────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO churches (id, name, address, pastor, service_times, phone, sort_order, created_at, photo_url, photo_credit) VALUES
    (1,  'First Baptist Church',               '1401 N Haskell Blvd., Haskell, Ok',        'Pastor Tim Hare',
      'Sunday Breakfast 9:00 am Small Groups 9:45 am Worship 10:45 am| Wednesday Golden Agers 10:00 am  Hot meal 5:15 pm (During the school year) Kingdom Kids 6:00 pm (During the school year) Youth Group 6:00 pm',
      '(918) 482-3225', 1, '2026-04-09 20:37:40.772752', NULL, NULL),
    (2,  'First Free Will Baptist',             '500 W. Skelly Road',                       'Pastor No one',
      'Sun. Small Groups 10:00 am Worship 10:50 am  & 6:00 pm | Wed. 7 pm',
      '(918) 482-3410', 2, '2026-04-09 20:37:40.772752', NULL, NULL),
    (3,  'First Assembly of God',               '409 W. Cedar St., Haskell, Ok',            'Rev. Donald Jr. Hogue & Cathy Hogue',
      'Sat. 5:30pm | Sun. 8am & 10:30am',
      '(918) 482-5645', 3, '2026-04-09 20:37:40.772752', NULL, NULL),
    (4,  'Central Church of Christ',            '402 W. Main St., Haskell, Ok',             'Rev. Sandra Hobbs',
      'Sunday Bible Class 9:30 am & Worship10:30am Evening Worship 5:00 pm | Wed. 7:00 pm',
      '(918) 482-9999', 4, '2026-04-09 20:37:40.772752', NULL, NULL),
    (5,  'Landmark Bible Church',               '221 N. Broadway, Haskell, Ok',             'Pastor Kevin Troup',
      'Sun. 10:30am & 6pm | Wed. 7pm',
      '(918) 482-9289', 5, '2026-04-09 20:37:40.772752', NULL, NULL),
    (6,  'Voice of Hope Training Center',       '123 main st',                              'Bryan Londagin',
      'Sunday 10a.m.',
      '918-232-3597', 6, '2026-04-12 01:05:41.89381', NULL, NULL),
    (7,  'Eastside First Baptist',              'W. Main St. Haskell, Ok',                  'Pastor Unknown',
      'Sunday Unknown',
      '(918) 482-1223', 7, '2026-04-12 14:11:02.888651', NULL, NULL),
    (8,  'First United Methodist',              '301 W Main St.',                           'Pastor Unknown',
      'Service Times Unknown',
      '(918) 482-3325', 8, '2026-04-12 14:25:15.678564', NULL, NULL),
    (9,  'Lighthouse Free Will Baptist',        '200 E Skelly Rd.',                         'Pastor Unknown',
      'Service Times Unknown',
      '(918) 482-6068', 9, '2026-04-12 14:30:21.440199', NULL, NULL),
    (10, 'United Pentecostal',                  '126 W. Franklin St. Haskell, Ok',          'Pastor James Stewart',
      'Sunday Groups 10:00 am Service 10:45 am| Wednesday 7:30 pm',
      '(918) 482-3389', 10, '2026-04-12 14:37:16.799445', NULL, NULL),
    (11, 'Jubilee Worship Center International','300 W. Commercial, Haskell, Ok',           'Pastor Unknown',
      'Service Times Unknown',
      '(918) 852-4207', 11, '2026-04-12 14:40:12.263839', NULL, NULL),
    (12, 'Mount Zion',                          '7298 214th St. W. Haskell, Ok',            'Pastor Unknown',
      'Service Times Unknown',
      '(918) 555-5555', 12, '2026-04-12 14:45:37.810241', NULL, NULL),
    (13, 'Stone Bluff Baptist',                 '19141 Us-64 Stonebluff, Ok',               'Pastor Unknown',
      'Service Times Unknown',
      '(918) 555-5555', 13, '2026-04-12 14:47:53.718412', NULL, NULL),
    (14, 'All Nations Seventh-Day Adventist',   '1192 S. Haskell Blvd., Haskell, Ok',      'Pastor Unknown',
      'Saturday Sabbath School 9:30 am Worship 11:00 am| Youth Meetings 1st & 3rd Saturday 2:00 pm| Clothes Closet Thursday 5-7 pm| Thursday Bible Study 6:30 pm| Women''s Ministry & Book Club 4th Sunday 3:00 pm',
      '(918) 736-9771', 15, '2026-04-12 15:03:07.136936', NULL, NULL)
    ON CONFLICT (id) DO NOTHING
  `);

  // ── Student Spotlight ────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO student_spotlight (id, name, school, grade, description, photo_url, created_at, updated_at, photo_credit) VALUES
    (1, 'Haskell Valedictorians', 'Haskell High School', 'Grade 12',
      'Back Row (left to right):
Ryker Fagg, Jeffrey Bonebrake, Blastadeo Salazar, Ryker Porter, Noah Ellis, Cooper Votaw
Bottom Row (left to right):
Natalee Deckard, Amy Ortega, Cheyanna Morgan, Hayden Wentworth, Josie Enkey',
      '/api/storage/objects/uploads/ae4c547a-b2c7-4ec0-bfb1-c5df507e7ffb',
      '2026-04-09 20:37:40.772752', '2026-04-11 17:16:08.223', 'Haskell High School')
    ON CONFLICT (id) DO NOTHING
  `);

  // ── Business Spotlight ───────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO business_spotlight (id, name, business_type, description, photo_url, photo_credit, created_at, updated_at) VALUES
    (1, 'El Jalepeno', 'Restaurant', 'Join us in celebrating the success of this hometown delight.',
      '/api/storage/objects/uploads/7e449328-84cf-4300-ac8e-05b9d53202f2', 'EL Jalepeno',
      '2026-04-11 17:57:15.807511', '2026-04-11 17:57:15.807511')
    ON CONFLICT (id) DO NOTHING
  `);

  // ── Group Spotlight ──────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO group_spotlight (id, name, group_type, description, photo_url, photo_credit, created_at, updated_at) VALUES
    (1, 'Pa-A Linn Club', 'Volunteer Organization', 'Pa-A Linn Club. Old ladies having fun.',
      '/api/storage/objects/uploads/d12b0235-895a-4bcd-8442-5aee50e3b70b', 'Facebook',
      '2026-04-11 17:59:40.392546', '2026-04-11 17:59:40.392546')
    ON CONFLICT (id) DO NOTHING
  `);

  // ── Calendar Events ──────────────────────────────────────────────────────────
  await db.execute(sql`
    INSERT INTO calendar_events (id, title, event_date, event_time, location, description, created_at) VALUES
    (1,  'High School Graduation',                 '2026-05-03', '15:00', 'Franklin Event Center', NULL, '2026-04-10 15:12:12.235291'),
    (2,  'Bulletin submission deadline',           '2026-05-25', '17:00', 'thefrontporchbulletin@gmail.com', NULL, '2026-04-11 15:34:05.988662'),
    (3,  'Storytime',                              '2026-05-01', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11 15:51:25.430226'),
    (4,  'Storytime',                              '2026-05-08', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11 15:51:49.371174'),
    (5,  'Storytime',                              '2026-05-15', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:10:01.776055'),
    (6,  'Last Day of School',                     '2026-05-07', NULL,    NULL, NULL, '2026-04-11 16:14:33.283512'),
    (7,  'Storytime',                              '2026-05-22', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:15:40.243263'),
    (8,  'Storytime',                              '2026-05-29', '11:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:17:07.918366'),
    (9,  'Kentucky Derby',                         '2026-05-02', '16:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:19:05.240016'),
    (10, 'AARP Webinar',                           '2026-05-14', '09:30', 'Rieger Memorial Library', 'Q and A session over AI.', '2026-04-11 16:19:59.143399'),
    (11, 'OSU AG Class',                           '2026-05-28', '16:00', 'Rieger Memorial Library', 'Agriculture and 4-H classes offered by OSU Extension office for children K-12.', '2026-04-11 16:20:40.229255'),
    (12, 'Adult Craft',                            '2026-05-21', '15:00', 'Rieger Memorial Library', 'Make a book vase.', '2026-04-11 16:23:06.364146'),
    (13, 'Sequoyah State Park',                    '2026-05-20', '14:00', 'Rieger Memorial Library', 'Explorations in nature featuring paleontology and fossils.', '2026-04-11 16:25:27.492353'),
    (14, 'Dinosaurs Among Us',                     '2026-05-27', '14:00', 'Rieger Memorial Library', 'Hear facts and fiction about dinosaurs from storytelling biologist Fran Stallings.', '2026-04-11 16:27:40.15116'),
    (15, 'Diabetes Undone',                        '2026-05-05', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11 16:32:24.261884'),
    (16, 'Chamber of Commerce Meeting',            '2026-05-19', '12:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:34:29.285354'),
    (17, 'Masterpiece Makers 3rd Annual Student Art Show', '2026-05-22', '18:00', 'Church of Christ 402 W. Main St. Haskell, Ok', NULL, '2026-04-11 16:37:32.857627'),
    (18, 'Pa-A-Linn',                              '2026-05-04', '18:30', NULL, NULL, '2026-04-11 16:39:45.392095'),
    (19, 'Cinco de Mayo',                          '2026-05-05', NULL,    NULL, NULL, '2026-04-11 16:40:13.190708'),
    (20, 'Farmers Market',                         '2026-05-02', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:41:48.409507'),
    (21, 'Friends of the Library Meeting',         '2026-05-11', '18:00', 'Rieger Memorial Library', NULL, '2026-04-11 16:42:34.906145'),
    (22, 'City Hall Meeting',                      '2026-05-12', '18:00', 'City Hall', NULL, '2026-04-11 16:43:14.892049'),
    (23, 'Memorial Day',                           '2026-05-25', NULL,    NULL, NULL, '2026-04-11 16:43:41.109427'),
    (24, 'Diabetes Undone',                        '2026-05-12', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11 16:52:59.689653'),
    (25, 'Diabetes Undone',                        '2026-05-19', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11 16:52:59.847'),
    (26, 'Diabetes Undone',                        '2026-05-26', '18:15', 'Rieger Memorial Library', 'An 8-week course on healthy habits with diabetes.', '2026-04-11 16:52:59.953608'),
    (27, 'Farmers Market',                         '2026-05-09', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11 19:11:53.975756'),
    (28, 'Farmers Market',                         '2026-05-16', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11 19:11:54.065994'),
    (29, 'Farmers Market',                         '2026-05-23', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11 19:11:54.174001'),
    (30, 'Farmers Market',                         '2026-05-30', '08:00', 'Rieger Memorial Library', NULL, '2026-04-11 19:11:54.237326')
    ON CONFLICT (id) DO NOTHING
  `);

  // ── User Roles — always upsert so admin access is never accidentally lost ───
  await db.execute(sql`
    INSERT INTO user_roles (clerk_user_id, role) VALUES
    ('user_3C8RieDe4Djrw09MjSZ0AUxFFsG', 'admin'),
    ('user_3CEgXdUUZMPdfE25P7SdrAip8Vp',  'admin')
    ON CONFLICT (clerk_user_id) DO UPDATE SET role = EXCLUDED.role
  `);

  // ── Reset sequences so new admin entries don't collide with seed IDs ─────────
  await db.execute(sql`
    SELECT setval('articles_id_seq',          (SELECT MAX(id) FROM articles));
    SELECT setval('categories_id_seq',        (SELECT MAX(id) FROM categories));
    SELECT setval('churches_id_seq',          (SELECT MAX(id) FROM churches));
    SELECT setval('calendar_events_id_seq',   (SELECT MAX(id) FROM calendar_events));
    SELECT setval('student_spotlight_id_seq', (SELECT MAX(id) FROM student_spotlight));
    SELECT setval('business_spotlight_id_seq',(SELECT MAX(id) FROM business_spotlight));
    SELECT setval('group_spotlight_id_seq',   (SELECT MAX(id) FROM group_spotlight));
    SELECT setval('user_roles_id_seq',        (SELECT MAX(id) FROM user_roles));
  `);

  logger.info("Seed complete");
}
