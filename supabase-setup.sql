-- ===================================================================
-- VIBECHECK DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- PART 1: ROW LEVEL SECURITY POLICIES
-- ===================================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Group members can be added by group members" ON group_members;
DROP POLICY IF EXISTS "Group members can insert plans" ON plans;
DROP POLICY IF EXISTS "Anyone can be added as plan participant" ON plan_participants;
DROP POLICY IF EXISTS "Plans can be updated by group members" ON plans;

-- Allow users to add themselves to a group (for creating new groups)
CREATE POLICY "Group members can be added"
  ON group_members FOR INSERT
  WITH CHECK (
    -- Either you're adding yourself to a new group
    auth.uid() = user_id
    OR
    -- Or you're already a member of this group
    auth.uid() IN (
      SELECT user_id FROM group_members gm WHERE gm.group_id = group_members.group_id
    )
  );

-- Allow group members to create plans
CREATE POLICY "Group members can insert plans"
  ON plans FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = plans.group_id
    )
  );

-- Allow anyone to be added as a plan participant
CREATE POLICY "Anyone can be added as plan participant"
  ON plan_participants FOR INSERT
  WITH CHECK (true);

-- Allow plan participants to update their own participation
CREATE POLICY "Plan participants can update their own status"
  ON plan_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow group members to update plans (for auto-confirmation)
CREATE POLICY "Plans can be updated by group members"
  ON plans FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM group_members WHERE group_id = plans.group_id
    )
  );

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
  ON plan_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow plan participants to view messages
CREATE POLICY "Plan participants can view messages"
  ON plan_messages FOR SELECT
  USING (
    plan_id IN (
      SELECT plan_id FROM plan_participants WHERE user_id = auth.uid()
    )
  );

-- ===================================================================
-- PART 2: ADD MORE TEST VENUES
-- ===================================================================

INSERT INTO venues (name, address, city, latitude, longitude, category, price_range, photos) VALUES
('The Jazz Lounge', '100 Music St', 'New York', 40.7600, -73.9800, 'bar', '$$', ARRAY['https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800']),
('Taco Fiesta', '200 Food Ave', 'New York', 40.7550, -73.9870, 'restaurant', '$', ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800']),
('SkyBar Rooftop', '300 High St', 'New York', 40.7620, -73.9750, 'bar', '$$$', ARRAY['https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800']),
('The Comedy Club', '400 Laugh Ln', 'New York', 40.7580, -73.9820, 'entertainment', '$$', ARRAY['https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800']),
('Sushi Palace', '500 Fresh Rd', 'New York', 40.7590, -73.9860, 'restaurant', '$$$', ARRAY['https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800']),
('The Art Gallery', '600 Creative Blvd', 'New York', 40.7610, -73.9780, 'entertainment', 'Free', ARRAY['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800']),
('Burger Joint', '700 Grill St', 'New York', 40.7565, -73.9845, 'restaurant', '$', ARRAY['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800']),
('Live Music Hall', '800 Sound Ave', 'New York', 40.7595, -73.9825, 'entertainment', '$$', ARRAY['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'])
ON CONFLICT (name, city) DO NOTHING;

-- ===================================================================
-- PART 3: ADD MORE TEST EVENTS (Various dates and times)
-- ===================================================================

INSERT INTO events (title, description, venue_id, start_time, category, is_free, price_min, price_max, cover_image_url) VALUES
-- Tonight's events
('Live Jazz Night', 'Smooth jazz and cocktails. Local trio performs classic standards.', 
  (SELECT id FROM venues WHERE name = 'The Jazz Lounge' LIMIT 1), 
  NOW() + INTERVAL '6 hours', 'nightlife', false, 15, 25, 
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800'),

('Late Night Comedy', 'Stand-up comedy show featuring top local comedians',
  (SELECT id FROM venues WHERE name = 'The Comedy Club' LIMIT 1),
  NOW() + INTERVAL '8 hours', 'entertainment', false, 10, 20,
  'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'),

-- Tomorrow
('Taco Tuesday Special', 'Half-price tacos all night! Plus margarita specials.',
  (SELECT id FROM venues WHERE name = 'Taco Fiesta' LIMIT 1),
  NOW() + INTERVAL '1 day 18 hours', 'dining', false, 10, 20,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'),

('Acoustic Open Mic', 'Bring your guitar! Open mic for singer-songwriters.',
  (SELECT id FROM venues WHERE name = 'Live Music Hall' LIMIT 1),
  NOW() + INTERVAL '1 day 20 hours', 'entertainment', true, 0, 0,
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'),

-- Day After Tomorrow
('Burger Week Kickoff', 'Try our new burger menu! Special pricing all week.',
  (SELECT id FROM venues WHERE name = 'Burger Joint' LIMIT 1),
  NOW() + INTERVAL '2 days 19 hours', 'dining', false, 8, 15,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'),

-- This Weekend (Friday)
('Sunset Cocktails', 'Best views in the city. DJ spins chill house music.',
  (SELECT id FROM venues WHERE name = 'SkyBar Rooftop' LIMIT 1),
  NOW() + INTERVAL '5 days 17 hours', 'nightlife', false, 20, 40,
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800'),

('Art Exhibition Opening', 'Modern art showcase with free wine and appetizers.',
  (SELECT id FROM venues WHERE name = 'The Art Gallery' LIMIT 1),
  NOW() + INTERVAL '5 days 18 hours', 'entertainment', true, 0, 0,
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'),

-- This Weekend (Saturday)
('Sushi Making Class', 'Learn from the chef! Includes 3-course meal.',
  (SELECT id FROM venues WHERE name = 'Sushi Palace' LIMIT 1),
  NOW() + INTERVAL '6 days 14 hours', 'dining', false, 50, 50,
  'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800'),

('Saturday Night DJ Set', 'House music all night with DJ TechnoVibe',
  (SELECT id FROM venues WHERE name = 'Downtown Club' LIMIT 1),
  NOW() + INTERVAL '6 days 22 hours', 'nightlife', false, 15, 15,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'),

('Stand-Up Comedy Night', 'Headliner show with special guest. 21+ only.',
  (SELECT id FROM venues WHERE name = 'The Comedy Club' LIMIT 1),
  NOW() + INTERVAL '6 days 20 hours', 'entertainment', false, 20, 30,
  'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'),

-- Next Week (Monday)
('Jazz Jam Session', 'Bring your instrument! All skill levels welcome.',
  (SELECT id FROM venues WHERE name = 'The Jazz Lounge' LIMIT 1),
  NOW() + INTERVAL '8 days 19 hours', 'nightlife', false, 10, 10,
  'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800'),

-- Next Week (Wednesday)
('Trivia Night', 'Test your knowledge, win prizes! Teams of 4-6.',
  (SELECT id FROM venues WHERE name = 'The Rooftop Bar' LIMIT 1),
  NOW() + INTERVAL '10 days 19 hours', 'entertainment', true, 0, 0,
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'),

('Wine Tasting Event', 'Sample wines from 5 countries with cheese pairings.',
  (SELECT id FROM venues WHERE name = 'The Jazz Lounge' LIMIT 1),
  NOW() + INTERVAL '10 days 18 hours', 'dining', false, 30, 50,
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800'),

-- Next Week (Friday)
('Live Band Night', 'Rock covers from the 80s and 90s. Dance floor open!',
  (SELECT id FROM venues WHERE name = 'Live Music Hall' LIMIT 1),
  NOW() + INTERVAL '12 days 21 hours', 'nightlife', false, 12, 12,
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800'),

('Rooftop Cinema', 'Movie night under the stars. This week: classic rom-com.',
  (SELECT id FROM venues WHERE name = 'SkyBar Rooftop' LIMIT 1),
  NOW() + INTERVAL '12 days 20 hours', 'entertainment', false, 15, 15,
  'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800')

ON CONFLICT DO NOTHING;

-- ===================================================================
-- PART 4: VERIFY DATA
-- ===================================================================

-- Check how many events we have
SELECT COUNT(*) as total_events FROM events;

-- Check events by date range
SELECT 
  title,
  start_time,
  category,
  CASE 
    WHEN start_time < NOW() + INTERVAL '1 day' THEN 'Today/Tonight'
    WHEN start_time < NOW() + INTERVAL '3 days' THEN 'This Week'
    WHEN start_time < NOW() + INTERVAL '7 days' THEN 'This Weekend'
    ELSE 'Next Week+'
  END as time_range
FROM events
ORDER BY start_time;

-- ===================================================================
-- DONE! Your database is now set up with:
-- ✅ Proper RLS policies
-- ✅ 8+ venues
-- ✅ 15+ events across different dates
-- ✅ Ready for testing
-- ===================================================================
