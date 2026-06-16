-- =============================================================
-- Mentoria Hub — Seed Data
-- Run AFTER supabase_schema.sql
-- Safe to re-run (ON CONFLICT DO NOTHING on all inserts)
-- UUID prefixes: a0 = opportunities, cc = courses, b0 = lessons
-- =============================================================


-- ─── Opportunities (10 rows) ──────────────────────────────────
INSERT INTO opportunities (id, title, category, direction, format, deadline, description, requirements, tags) VALUES

('a0000001-0000-0000-0000-000000000001',
 'Global STEM Olympiad 2026',
 'Competition', 'STEM', 'Online', '2026-10-15',
 'An international online competition testing students in Math, Physics, and Computer Science. Top performers receive medals and university recommendation letters.',
 'Open to grades 9–11. Basic algebra and physics required. Internet access needed.',
 ARRAY['Math', 'Physics', 'CS', 'International']),

('a0000002-0000-0000-0000-000000000002',
 'Future Leaders Scholarship',
 'Scholarship', 'Business', 'Hybrid', '2026-11-01',
 'Full scholarship covering tuition and accommodation for a two-week leadership program at a partner university in Europe. Includes mentorship from business executives.',
 'Grade 10–11. Essay (500 words) + two recommendation letters. B2 English required.',
 ARRAY['Leadership', 'Business', 'Scholarship', 'Europe']),

('a0000003-0000-0000-0000-000000000003',
 'Google Summer of Code — Student Track',
 'Internship', 'Coding', 'Online', '2026-07-20',
 'Contribute to open-source projects under Google mentors over 3 months. Paid stipend. Real-world software engineering experience.',
 'Must know at least one programming language (Python, Java, or Go). GitHub portfolio recommended.',
 ARRAY['Open Source', 'Python', 'Software Engineering', 'Paid']),

('a0000004-0000-0000-0000-000000000004',
 'Harvard Pre-College Summer Program',
 'Summer School', 'Science', 'Offline', '2026-07-25',
 'Six-week residential program on the Harvard campus. Students attend college-level courses in their chosen subject and live alongside Harvard students.',
 'Grade 10–11. Academic transcript, teacher recommendation, and personal statement. IELTS 6.5+.',
 ARRAY['Harvard', 'Residential', 'IELTS', 'Summer']),

('a0000005-0000-0000-0000-000000000005',
 'International Mathematical Olympiad (IMO) Qualifier',
 'Olympiad', 'STEM', 'Online', '2026-08-12',
 'National qualifier round for the IMO. Top scorers represent Kazakhstan at the international stage. Covers algebra, geometry, number theory, and combinatorics.',
 'Grade 8–11. No prior olympiad experience required, but strong Math background essential.',
 ARRAY['Math', 'Olympiad', 'Kazakhstan', 'IMO']),

('a0000006-0000-0000-0000-000000000006',
 'Chevening Youth Leadership Scholarship',
 'Scholarship', 'Social Impact', 'Online', '2026-09-05',
 'UK government-funded scholarship for outstanding young leaders in Central Asia. Covers a leadership development course plus travel to London.',
 'Age 16–19. Community involvement history. English B2+. Motivational letter required.',
 ARRAY['UK', 'Leadership', 'Community', 'Fully Funded']),

('a0000007-0000-0000-0000-000000000007',
 'MIT App Inventor Global Challenge',
 'Competition', 'Coding', 'Online', '2026-08-28',
 'Build a mobile app that solves a real-world problem using MIT App Inventor. Teams of 1–3 students. Winners featured on the MIT website and receive tech prizes.',
 'Open to all grades. No prior coding required — MIT App Inventor is beginner-friendly.',
 ARRAY['App Development', 'MIT', 'Beginner Friendly', 'Team']),

('a0000008-0000-0000-0000-000000000008',
 'World Scholar''s Cup — Kazakhstan Round',
 'Competition', 'Social Impact', 'Hybrid', '2026-09-18',
 'A global academic tournament covering science, social studies, arts, literature, and current events. Teams of 3 compete in debate, writing, and quiz rounds.',
 'Open to grades 8–11. Team of 3 required. Registration via school coordinator.',
 ARRAY['Debate', 'Academics', 'Team', 'Kazakhstan']),

('a0000009-0000-0000-0000-000000000009',
 'Astana Finance Forum — Youth Delegate Track',
 'Internship', 'Finance', 'Offline', '2026-10-30',
 'Attend the Astana Finance Forum as a youth delegate. Shadow senior economists, attend panel discussions, and present a policy brief to a panel of experts.',
 'Grade 10–11. Interest in economics/finance. Essay submission required. Held in Astana.',
 ARRAY['Finance', 'Economics', 'Astana', 'Policy']),

('a000000a-0000-0000-0000-000000000010',
 'Global Science Fair — Junior Division',
 'Competition', 'Science', 'Online', '2026-07-30',
 'Submit an original science experiment or research project. Judged on methodology, innovation, and presentation. Winners receive research grants.',
 'Open to grades 8–10. Project must be original. Submission includes a 5-minute video and written report.',
 ARRAY['Science', 'Research', 'Biology', 'Chemistry'])

ON CONFLICT (id) DO NOTHING;


-- ─── Courses (3 rows) ─────────────────────────────────────────
INSERT INTO courses (id, title, description, level, subject, tags) VALUES

('cc000001-0000-0000-0000-000000000001',
 'English for Academic Success',
 'Master the academic English skills you need for university applications, international exams (IELTS/SAT), and scholarship essays. Fully self-paced with quizzes after every lesson.',
 'Beginner', 'English',
 ARRAY['IELTS', 'Academic Writing', 'Reading', 'Scholarships']),

('cc000002-0000-0000-0000-000000000002',
 'Foundations of Physics',
 'Build a solid foundation in physics from Newton''s Laws to waves. Ideal for students preparing for olympiads or university entrance exams. Problem sets included.',
 'Intermediate', 'Physics',
 ARRAY['Olympiad', 'Mechanics', 'Waves', 'University Prep']),

('cc000003-0000-0000-0000-000000000003',
 'Introduction to Economics',
 'Understand how markets work, from supply and demand to macroeconomic policy. Essential for students interested in business, finance, or social sciences.',
 'Beginner', 'Economics',
 ARRAY['Business', 'Finance', 'Markets', 'University Prep'])

ON CONFLICT (id) DO NOTHING;


-- ─── Lessons (3 per course = 9 rows) ──────────────────────────
INSERT INTO lessons (id, course_id, title, position, content, video_url, summary) VALUES

-- English for Academic Success
('b0000001-0000-0000-0000-000000000001', 'cc000001-0000-0000-0000-000000000001',
 'Introduction to Academic Writing', 1,
 'Academic writing is formal, evidence-based, and structured. Every essay has three parts: an introduction (with a clear thesis statement), body paragraphs (each with a topic sentence, evidence, and analysis), and a conclusion. Avoid contractions, slang, and first-person unless instructed. Use hedging language ("research suggests") rather than absolute claims.',
 NULL,
 'Academic writing is formal and structured. Key elements: thesis statement, topic sentences, evidence, and a logical conclusion. Avoid informal language.'),

('b0000002-0000-0000-0000-000000000002', 'cc000001-0000-0000-0000-000000000001',
 'Reading Comprehension Strategies', 2,
 'Effective reading requires active strategies. Skimming gives you the general idea (read headings and first sentences). Scanning finds specific facts quickly. Careful reading is used for detail questions. Use context clues to infer unknown vocabulary. In IELTS Reading, answers appear in text order — use this to stay on track.',
 NULL,
 'Skimming, scanning, and careful reading each serve a different purpose. Context clues help with unknown words. IELTS answers follow text order.'),

('b0000003-0000-0000-0000-000000000003', 'cc000001-0000-0000-0000-000000000001',
 'IELTS Listening Skills', 3,
 'The IELTS Listening test has 4 sections, 10 questions each (40 total). Sections 1–2 cover everyday situations; Sections 3–4 are academic. You hear the recording once. Use preparation time to read questions ahead. Answers appear in order. Watch for spelling — wrong spelling costs marks. Common traps: changed answers, numbers, and proper nouns.',
 NULL,
 'IELTS Listening: 4 sections, heard once, answers in order. Read questions ahead during prep time. Spelling counts.'),

-- Foundations of Physics
('b0000004-0000-0000-0000-000000000004', 'cc000002-0000-0000-0000-000000000002',
 'Newton''s Laws of Motion', 1,
 'Newton''s First Law (Inertia): An object remains at rest or in uniform motion unless acted on by a net external force. Second Law: F = ma — force equals mass times acceleration. Third Law: Every action has an equal and opposite reaction. These three laws explain virtually all everyday motion, from a car braking to a rocket launching.',
 'https://www.youtube.com/watch?v=HSB-6XLXOQY',
 'F = ma. Objects resist changes in motion (inertia). Every force has an equal and opposite reaction force.'),

('b0000005-0000-0000-0000-000000000005', 'cc000002-0000-0000-0000-000000000002',
 'Energy and Work', 2,
 'Work is done when a force causes displacement: W = Fd·cosθ. Kinetic energy (energy of motion): KE = ½mv². Potential energy (stored energy): PE = mgh for gravity. The Law of Conservation of Energy: energy cannot be created or destroyed, only converted. In real systems, some energy is always lost to heat (friction).',
 'https://www.youtube.com/watch?v=2WS1sG9fhOk',
 'W = Fd. KE = ½mv². PE = mgh. Total energy is conserved; friction converts it to heat.'),

('b0000006-0000-0000-0000-000000000006', 'cc000002-0000-0000-0000-000000000002',
 'Waves and Sound', 3,
 'Waves transfer energy without transferring matter. Transverse waves (e.g. light) oscillate perpendicular to motion. Longitudinal waves (e.g. sound) oscillate parallel. Key properties: frequency (Hz), wavelength (m), amplitude, speed. Sound needs a medium — it cannot travel through a vacuum. The Doppler effect: perceived frequency changes when source and observer move relative to each other.',
 NULL,
 'Sound is a longitudinal wave. Speed, frequency, and wavelength are related. The Doppler effect shifts perceived pitch.'),

-- Introduction to Economics
('b0000007-0000-0000-0000-000000000007', 'cc000003-0000-0000-0000-000000000003',
 'Supply and Demand', 1,
 'The Law of Demand: as price rises, quantity demanded falls (inverse relationship). The Law of Supply: as price rises, quantity supplied increases (direct relationship). Equilibrium is where supply meets demand. A surplus (excess supply) pushes prices down; a shortage (excess demand) pushes prices up. Shifts in curves happen when non-price factors change (income, technology, preferences).',
 'https://www.youtube.com/watch?v=ewPNugIqCUM',
 'Demand curves slope down; supply curves slope up. Equilibrium is where they cross. Surplus → price falls; shortage → price rises.'),

('b0000008-0000-0000-0000-000000000008', 'cc000003-0000-0000-0000-000000000003',
 'Market Structures', 2,
 'Four main market structures: (1) Perfect Competition — many firms, identical products, no pricing power. (2) Monopoly — one seller, sets own price, high barriers to entry. (3) Oligopoly — few large firms, interdependent decisions, e.g. airlines. (4) Monopolistic Competition — many firms, differentiated products, some pricing power, e.g. restaurants. Real markets rarely fit one type perfectly.',
 NULL,
 'Perfect competition → no pricing power. Monopoly → one seller. Oligopoly → few large firms. Monopolistic competition → differentiated products.'),

('b0000009-0000-0000-0000-000000000009', 'cc000003-0000-0000-0000-000000000003',
 'Introduction to Macroeconomics', 3,
 'Macroeconomics studies the economy as a whole. Key indicators: GDP (total output), inflation (price level rise over time), unemployment rate (% of labor force without jobs). Fiscal policy = government spending and taxes (controlled by government). Monetary policy = interest rates and money supply (controlled by the central bank). The business cycle describes alternating periods of expansion and recession.',
 NULL,
 'GDP, inflation, and unemployment are the core macro indicators. Fiscal policy = government; monetary policy = central bank.')

ON CONFLICT (id) DO NOTHING;


-- ─── Quiz Questions (5 per lesson = 45 rows) ──────────────────

-- Lesson 1: Introduction to Academic Writing
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000001-0000-0000-0000-000000000001',
 'What is the primary purpose of a thesis statement?',
 ARRAY['To summarize the entire essay in detail', 'To present the central argument the essay will support', 'To introduce the topic broadly without a position', 'To list all the sources used'],
 1, 'A thesis statement makes a specific, arguable claim that the rest of the essay defends.'),

('b0000001-0000-0000-0000-000000000001',
 'Which sentence uses an appropriately formal academic register?',
 ARRAY['It''s totally clear that climate change is bad.', 'Research demonstrates a significant correlation between emissions and temperature rise.', 'Lots of people think we should do something.', 'Everyone knows fossil fuels are the problem.'],
 1, 'Academic writing avoids contractions and informal language. "Research demonstrates" is precise and formal.'),

('b0000001-0000-0000-0000-000000000001',
 'What is the role of a topic sentence in a body paragraph?',
 ARRAY['To provide statistical evidence for the thesis', 'To state the main idea of that paragraph', 'To conclude the entire essay', 'To define the key terms used in the essay'],
 1, 'Each body paragraph opens with a topic sentence that states its specific claim, linking back to the thesis.'),

('b0000001-0000-0000-0000-000000000001',
 'Which transition word signals a contrast?',
 ARRAY['Furthermore', 'In addition', 'However', 'Therefore'],
 2, '"However" introduces a contrasting idea. "Furthermore" and "In addition" add information; "Therefore" signals a conclusion.'),

('b0000001-0000-0000-0000-000000000001',
 'A standard academic essay is structured as:',
 ARRAY['Argument → Evidence → Summary', 'Introduction → Body Paragraphs → Conclusion', 'Abstract → Methodology → Results', 'Claim → Counterclaim → Rebuttal only'],
 1, 'The classic three-part structure (Introduction, Body, Conclusion) is standard across academic essay types.');


-- Lesson 2: Reading Comprehension Strategies
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000002-0000-0000-0000-000000000002',
 'What is the main purpose of skimming a text?',
 ARRAY['To find a specific fact as fast as possible', 'To get the overall general idea of the text', 'To understand every word in close detail', 'To memorize key vocabulary'],
 1, 'Skimming means reading quickly for the gist — you read headings, first sentences, and key phrases without processing every word.'),

('b0000002-0000-0000-0000-000000000002',
 'What does "making an inference" mean in reading comprehension?',
 ARRAY['Reading the passage aloud for clarity', 'Drawing a logical conclusion from information implied but not stated directly', 'Summarising the entire text in one sentence', 'Looking up difficult words in a dictionary'],
 1, 'An inference goes beyond the literal text — you use clues to conclude something the author implies without stating explicitly.'),

('b0000002-0000-0000-0000-000000000002',
 'Which strategy best helps identify the main idea of a paragraph?',
 ARRAY['Reading only the first and last sentence of the paragraph', 'Counting how many sentences the paragraph contains', 'Highlighting every word that appears more than once', 'Reading the footnotes and bibliography first'],
 0, 'The first sentence is usually the topic sentence (main idea) and the last sentence often restates or concludes it.'),

('b0000002-0000-0000-0000-000000000002',
 '"Context clues" refer to:',
 ARRAY['Grammar rules that help conjugate verbs', 'Words and phrases surrounding an unknown word that hint at its meaning', 'Dictionary definitions written in the margin', 'The author''s biography and background'],
 1, 'Context clues are surrounding words, examples, and sentence structure that help you infer an unknown word''s meaning without a dictionary.'),

('b0000002-0000-0000-0000-000000000002',
 'In IELTS Reading True/False/Not Given questions, "Not Given" means:',
 ARRAY['The statement is false according to the passage', 'The passage neither confirms nor contradicts the statement', 'The statement is partially true', 'The answer requires outside knowledge'],
 1, '"Not Given" means the passage does not contain enough information to decide — it is neither confirmed nor denied by the text.');


-- Lesson 3: IELTS Listening Skills
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000003-0000-0000-0000-000000000003',
 'How many sections are in the IELTS Academic Listening test?',
 ARRAY['Two', 'Three', 'Four', 'Five'],
 2, 'The IELTS Listening test has exactly 4 sections, each containing 10 questions for a total of 40.'),

('b0000003-0000-0000-0000-000000000003',
 'What should you do during the preparation time before each section begins?',
 ARRAY['Write down your answers from memory', 'Read the upcoming questions carefully to predict what to listen for', 'Close your eyes and focus on relaxing', 'Review your answers from the previous section'],
 1, 'Reading questions ahead lets you listen with purpose — you know what information to listen for and can anticipate keywords.'),

('b0000003-0000-0000-0000-000000000003',
 'Which accent is NOT typically featured in the IELTS Listening test?',
 ARRAY['British English', 'Australian English', 'North American English', 'French-accented English'],
 3, 'IELTS uses native English accents: British, Australian, North American, and New Zealand. Non-native accents like French are not used.'),

('b0000003-0000-0000-0000-000000000003',
 'What is the maximum band score achievable on the IELTS Listening section?',
 ARRAY['7.0', '8.0', '9.0', '10.0'],
 2, 'Each IELTS section is scored on a 0–9 band scale. 9.0 is a perfect score.'),

('b0000003-0000-0000-0000-000000000003',
 'In IELTS Listening, answers to questions generally appear:',
 ARRAY['In random order throughout the recording', 'In the same sequential order as the questions on the paper', 'Only in the final minutes of each section', 'Exclusively in Sections 3 and 4'],
 1, 'A key feature of IELTS Listening is that answers always appear in order — you never need to go backwards in the recording.');


-- Lesson 4: Newton's Laws of Motion
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000004-0000-0000-0000-000000000004',
 'Newton''s First Law states that an object at rest will:',
 ARRAY['Always begin to move if any time passes', 'Remain at rest unless acted upon by a net external force', 'Accelerate continuously due to gravity', 'Lose mass over time'],
 1, 'Newton''s First Law (the Law of Inertia) says objects resist changes in their state of motion. No net force = no change.'),

('b0000004-0000-0000-0000-000000000004',
 'Newton''s Second Law is expressed as:',
 ARRAY['F = mv (force = mass × velocity)', 'F = ma (force = mass × acceleration)', 'F = m/a (force = mass ÷ acceleration)', 'F = a/m (force = acceleration ÷ mass)'],
 1, 'F = ma is the cornerstone of classical mechanics. If mass doubles at the same acceleration, force doubles.'),

('b0000004-0000-0000-0000-000000000004',
 'Newton''s Third Law states:',
 ARRAY['Every action force has an equal and opposite reaction force', 'Force equals mass times acceleration', 'Objects in motion will stay in motion forever', 'Gravitational force is constant everywhere on Earth'],
 0, 'For every force one object exerts on another, the second object exerts an equal force in the opposite direction — the classic action-reaction pair.'),

('b0000004-0000-0000-0000-000000000004',
 'What is the SI unit of force?',
 ARRAY['Kilogram (kg)', 'Metre per second (m/s)', 'Newton (N)', 'Joule (J)'],
 2, 'Force is measured in Newtons (N). 1 N = 1 kg·m/s², derived directly from F = ma.'),

('b0000004-0000-0000-0000-000000000004',
 'A 5 kg object accelerates at 3 m/s². What is the net force acting on it?',
 ARRAY['8 N', '1.67 N', '15 N', '53 N'],
 2, 'F = ma = 5 kg × 3 m/s² = 15 N.');


-- Lesson 5: Energy and Work
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000005-0000-0000-0000-000000000005',
 'Work (in physics) is done when:',
 ARRAY['A force is applied but the object does not move', 'A force causes an object to move in the direction of the force', 'An object is stationary and temperature rises', 'Two objects exert forces on each other at a distance'],
 1, 'Work = Force × displacement × cos(angle). If displacement is zero, no work is done regardless of how much force is applied.'),

('b0000005-0000-0000-0000-000000000005',
 'The formula for kinetic energy is:',
 ARRAY['KE = mgh', 'KE = Fd', 'KE = ½mv²', 'KE = mv'],
 2, 'Kinetic energy depends on both mass and the square of velocity. Doubling speed quadruples KE.'),

('b0000005-0000-0000-0000-000000000005',
 'Which scenario represents gravitational potential energy?',
 ARRAY['A car travelling at 100 km/h on a flat road', 'A book resting on a shelf 2 metres above the floor', 'Sound waves travelling through air', 'Electric current flowing through a wire'],
 1, 'Gravitational PE = mgh. The book''s height above the ground gives it stored energy that converts to KE when it falls.'),

('b0000005-0000-0000-0000-000000000005',
 'What is the SI unit of energy?',
 ARRAY['Watt (W)', 'Newton (N)', 'Joule (J)', 'Pascal (Pa)'],
 2, 'Energy and work are both measured in Joules (J). 1 J = 1 N·m = 1 kg·m²/s².'),

('b0000005-0000-0000-0000-000000000005',
 'The Law of Conservation of Energy states:',
 ARRAY['Energy can be created from nothing if enough force is applied', 'Energy is always lost permanently as heat', 'The total energy in a closed system remains constant', 'Kinetic energy is always zero at maximum height'],
 2, 'Energy is never created or destroyed — only converted between forms (e.g. KE ↔ PE, or mechanical → thermal).');


-- Lesson 6: Waves and Sound
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000006-0000-0000-0000-000000000006',
 'What type of mechanical wave is sound?',
 ARRAY['Transverse wave', 'Longitudinal wave', 'Electromagnetic wave', 'Surface wave'],
 1, 'Sound waves are longitudinal — the medium (air molecules) vibrates parallel to the direction of wave travel, creating compressions and rarefactions.'),

('b0000006-0000-0000-0000-000000000006',
 'The number of complete wave cycles passing a point per second is called:',
 ARRAY['Wavelength', 'Amplitude', 'Frequency', 'Wave speed'],
 2, 'Frequency is measured in Hertz (Hz). 1 Hz = 1 cycle per second. Higher frequency = higher pitch for sound.'),

('b0000006-0000-0000-0000-000000000006',
 'Through which medium does sound travel fastest?',
 ARRAY['Vacuum', 'Air at room temperature', 'Water', 'Steel'],
 3, 'Sound speed depends on the elasticity and density of the medium. Steel (~5100 m/s) >> Water (~1480 m/s) >> Air (~343 m/s). Sound cannot travel through a vacuum at all.'),

('b0000006-0000-0000-0000-000000000006',
 'If the frequency of a sound wave increases, its pitch will:',
 ARRAY['Decrease', 'Increase', 'Remain the same', 'Depend only on amplitude'],
 1, 'Pitch is our perceptual response to frequency. Higher frequency = higher pitch. Amplitude affects loudness, not pitch.'),

('b0000006-0000-0000-0000-000000000006',
 'The Doppler effect describes:',
 ARRAY['A change in the speed of light near massive objects', 'A change in perceived frequency caused by relative motion between source and observer', 'The reflection of sound off hard surfaces', 'The absorption of sound energy by soft materials'],
 1, 'When an ambulance approaches you its siren sounds higher-pitched; as it moves away the pitch drops. That shift in perceived frequency is the Doppler effect.');


-- Lesson 7: Supply and Demand
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000007-0000-0000-0000-000000000007',
 'The Law of Demand states that, all else equal, as the price of a good rises:',
 ARRAY['Quantity demanded rises', 'Quantity demanded falls', 'Quantity demanded stays the same', 'Supply automatically decreases'],
 1, 'There is an inverse relationship between price and quantity demanded. Higher price → consumers buy less (substitute or go without).'),

('b0000007-0000-0000-0000-000000000007',
 'Which of the following would shift the supply curve to the right (increase in supply)?',
 ARRAY['An increase in the cost of raw materials', 'A decrease in the number of producers', 'An improvement in production technology', 'A new government tax on production'],
 2, 'Better technology reduces production costs, allowing firms to supply more at every price level — the supply curve shifts right.'),

('b0000007-0000-0000-0000-000000000007',
 'Market equilibrium is the point where:',
 ARRAY['Supply is greater than demand', 'Demand is greater than supply', 'Quantity supplied equals quantity demanded', 'Price is at its historical minimum'],
 2, 'At equilibrium, the market clears — there is no surplus or shortage. The equilibrium price balances the desires of buyers and sellers.'),

('b0000007-0000-0000-0000-000000000007',
 'A surplus in a market occurs when:',
 ARRAY['The price is set below the equilibrium price', 'The price is set above the equilibrium price', 'Demand and supply are perfectly balanced', 'Government removes all price controls'],
 1, 'When price is above equilibrium, producers supply more than consumers want to buy — unsold goods accumulate, creating a surplus. Prices then tend to fall.'),

('b0000007-0000-0000-0000-000000000007',
 'Which of these is a demand shifter (not a movement along the demand curve)?',
 ARRAY['A change in the good''s own price', 'A change in consumer income', 'A government subsidy to producers', 'An improvement in production efficiency'],
 1, 'A change in price causes movement along the curve. Changes in income, preferences, or related-good prices shift the entire demand curve.');


-- Lesson 8: Market Structures
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000008-0000-0000-0000-000000000008',
 'In a perfectly competitive market, firms are described as "price takers." This means:',
 ARRAY['They can set any price they want', 'They must accept the market price; they have no pricing power', 'They negotiate prices individually with each customer', 'They are protected from competition by patents'],
 1, 'With many identical firms and perfect information, no single firm can charge above market price — buyers simply go elsewhere.'),

('b0000008-0000-0000-0000-000000000008',
 'A monopoly exists when:',
 ARRAY['Two large firms dominate the market equally', 'A single firm is the sole seller with no close substitutes', 'Many small firms each produce identical products', 'The government controls all pricing decisions'],
 1, 'A monopoly = one seller. High barriers to entry (patents, infrastructure, regulation) prevent competitors from entering.'),

('b0000008-0000-0000-0000-000000000008',
 'Oligopoly is best defined as a market with:',
 ARRAY['Thousands of small competing firms', 'A single dominant seller', 'A few large firms whose decisions are mutually interdependent', 'Perfect information shared among all buyers and sellers'],
 2, 'In an oligopoly (e.g. commercial aviation, mobile carriers), each firm''s pricing or output decision significantly affects the others.'),

('b0000008-0000-0000-0000-000000000008',
 'Price discrimination refers to:',
 ARRAY['Charging every customer the same price regardless of circumstance', 'Charging different prices to different customer groups for the same product', 'Reducing prices during economic recessions only', 'Matching a competitor''s price exactly'],
 1, 'Airlines charge more for last-minute tickets; cinemas give student discounts. Same product, different prices for different groups = price discrimination.'),

('b0000008-0000-0000-0000-000000000008',
 'Natural monopolies tend to arise in industries that have:',
 ARRAY['Many small firms sharing low fixed costs', 'Very high fixed costs and very low marginal costs (economies of scale)', 'Highly competitive technology sectors with free entry', 'Markets where consumers have perfect information'],
 1, 'Water, electricity, and rail networks have massive upfront infrastructure costs but low per-unit costs — one provider is most efficient. Competition would duplicate fixed costs wastefully.');


-- Lesson 9: Introduction to Macroeconomics
INSERT INTO quiz_questions (lesson_id, question, options, correct_index, explanation) VALUES
('b0000009-0000-0000-0000-000000000009',
 'GDP (Gross Domestic Product) measures:',
 ARRAY['The total market value of all goods and services produced in a country in a given period', 'The total debt owed by a government', 'The average income of citizens', 'The total value of a country''s exports only'],
 0, 'GDP is the broadest measure of an economy''s output — it counts all final goods and services produced within a country''s borders in a year.'),

('b0000009-0000-0000-0000-000000000009',
 'Inflation is best described as:',
 ARRAY['A sustained rise in the general price level over time', 'A fall in a country''s total economic output', 'An increase in the unemployment rate', 'A sudden drop in consumer spending'],
 0, 'Inflation erodes purchasing power — the same amount of money buys fewer goods and services as the general price level rises over time.'),

('b0000009-0000-0000-0000-000000000009',
 'Which institution primarily controls monetary policy?',
 ARRAY['The national parliament (legislature)', 'The central bank (e.g. National Bank of Kazakhstan)', 'The ministry of trade', 'International trade organisations'],
 1, 'Central banks set interest rates and manage money supply — the tools of monetary policy. Fiscal policy (taxes and spending) is controlled by the government.'),

('b0000009-0000-0000-0000-000000000009',
 'The unemployment rate measures the percentage of:',
 ARRAY['The total population that does not have a job', 'The labour force that is without jobs and actively seeking employment', 'People who have voluntarily left the workforce', 'Workers employed only part-time'],
 1, 'The unemployment rate counts only those in the labour force (willing and able to work) who are currently without a job but actively looking for one.'),

('b0000009-0000-0000-0000-000000000009',
 'Fiscal policy refers to the government''s use of:',
 ARRAY['Interest rate adjustments and control of the money supply', 'Taxation and government spending to influence the economy', 'International trade agreements and tariff negotiations', 'Corporate investment and dividend strategies'],
 1, 'Fiscal policy = government taxing and spending. Cutting taxes or increasing spending stimulates the economy (expansionary); the reverse contracts it.');
