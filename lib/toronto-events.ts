/**
 * Toronto Events Generator - PREMIUM VERSION
 * Generates diverse, realistic events with real venues
 * Changes every time for fresh content!
 */

import { Event } from './events-api';
import { VibeId, DressCodeId } from './theme';

interface TorontoVenue {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'arena' | 'club' | 'theater' | 'bar' | 'outdoor' | 'gallery' | 'stadium';
}

// Map venue types to dress codes and vibes
const VENUE_VIBES: { [key: string]: VibeId[] } = {
  club: ['hype', 'party', 'underground'],
  bar: ['chill', 'casual', 'classy'],
  arena: ['hype', 'party'],
  theater: ['classy', 'live_music'],
  outdoor: ['casual', 'rooftop'],
  gallery: ['classy', 'chill'],
};

const VENUE_DRESS_CODES: { [key: string]: DressCodeId[] } = {
  club: ['smart_casual', 'dress_to_impress'],
  bar: ['casual', 'smart_casual', 'no_code'],
  arena: ['casual', 'no_code'],
  theater: ['smart_casual', 'dress_to_impress'],
  outdoor: ['casual', 'no_code'],
  gallery: ['smart_casual', 'classy'],
};

const TORONTO_VENUES: TorontoVenue[] = [
  // Arenas & Stadiums
  { name: 'Scotiabank Arena', address: '40 Bay St', latitude: 43.6433, longitude: -79.3790, type: 'arena' },
  { name: 'Rogers Centre', address: '1 Blue Jays Way', latitude: 43.6413, longitude: -79.3894, type: 'stadium' },
  { name: 'Budweiser Stage', address: '909 Lake Shore Blvd W', latitude: 43.6309, longitude: -79.4170, type: 'outdoor' },
  
  // Theaters & Concert Halls
  { name: 'Massey Hall', address: '178 Victoria St', latitude: 43.6544, longitude: -79.3787, type: 'theater' },
  { name: 'Roy Thomson Hall', address: '60 Simcoe St', latitude: 43.6477, longitude: -79.3863, type: 'theater' },
  { name: 'Meridian Hall', address: '27 Front St E', latitude: 43.6477, longitude: -79.3758, type: 'theater' },
  { name: 'Princess of Wales Theatre', address: '300 King St W', latitude: 43.6465, longitude: -79.3910, type: 'theater' },
  { name: 'Ed Mirvish Theatre', address: '244 Victoria St', latitude: 43.6537, longitude: -79.3787, type: 'theater' },
  
  // 🔥 MAJOR NIGHTCLUBS (King West, Entertainment District, Waterfront)
  { name: 'Rebel', address: '11 Polson St', latitude: 43.6400, longitude: -79.3520, type: 'club' },
  { name: 'CODA', address: '794 Bathurst St', latitude: 43.6660, longitude: -79.4110, type: 'club' },
  { name: 'Toybox', address: '310 Queen St W', latitude: 43.6490, longitude: -79.3940, type: 'club' },
  { name: 'Nest', address: '423 College St', latitude: 43.6570, longitude: -79.4050, type: 'club' },
  { name: 'Vertigo', address: '456 Queen St W', latitude: 43.6480, longitude: -79.3970, type: 'club' },
  { name: 'FICTION', address: '121 John St', latitude: 43.6485, longitude: -79.3900, type: 'club' },
  { name: 'AMPM', address: '496 College St', latitude: 43.6565, longitude: -79.4045, type: 'club' },
  { name: 'Uniun Nightclub', address: '112 Peter St', latitude: 43.6475, longitude: -79.3920, type: 'club' },
  { name: 'EFS Social', address: '647 King St W', latitude: 43.6445, longitude: -79.4010, type: 'club' },
  { name: 'Lost & Found', address: '577 King St W', latitude: 43.6440, longitude: -79.3990, type: 'club' },
  { name: 'Wildflower', address: '555 Richmond St W', latitude: 43.6470, longitude: -79.3980, type: 'club' },
  { name: 'Citizen', address: '533 Adelaide St W', latitude: 43.6465, longitude: -79.3975, type: 'club' },
  { name: 'Lavelle', address: '627 King St W', latitude: 43.6443, longitude: -79.4005, type: 'club' },
  { name: 'PH1 Patio & Nightclub', address: '438 King St W', latitude: 43.6455, longitude: -79.3960, type: 'club' },
  
  // 🍹 BARS & LOUNGES (Queen West, Ossington, King West)
  { name: 'The Drake Hotel', address: '1150 Queen St W', latitude: 43.6440, longitude: -79.4200, type: 'bar' },
  { name: 'The Cameron House', address: '408 Queen St W', latitude: 43.6490, longitude: -79.3960, type: 'bar' },
  { name: 'The Horseshoe Tavern', address: '370 Queen St W', latitude: 43.6490, longitude: -79.3950, type: 'bar' },
  { name: 'The Dakota Tavern', address: '249 Ossington Ave', latitude: 43.6520, longitude: -79.4180, type: 'bar' },
  { name: 'Get Well', address: '1181 Dundas St W', latitude: 43.6500, longitude: -79.4210, type: 'bar' },
  { name: 'Bar Hop', address: '391 King St W', latitude: 43.6455, longitude: -79.3945, type: 'bar' },
  { name: 'Betty\'s', address: '240 King St E', latitude: 43.6510, longitude: -79.3720, type: 'bar' },
  { name: 'The Ballroom Bowl', address: '156 Bathurst St', latitude: 43.6440, longitude: -79.4020, type: 'bar' },
  { name: 'Banknote Bar', address: '351 Yonge St', latitude: 43.6570, longitude: -79.3820, type: 'bar' },
  { name: 'Hemingway\'s', address: '142 Cumberland St', latitude: 43.6705, longitude: -79.3930, type: 'bar' },
  { name: 'Proof Vodka Bar', address: '942 Queen St W', latitude: 43.6455, longitude: -79.4135, type: 'bar' },
  { name: 'Shameful Tiki Room', address: '1378 Queen St W', latitude: 43.6415, longitude: -79.4290, type: 'bar' },
  { name: 'Bar Raval', address: '505 College St', latitude: 43.6565, longitude: -79.4050, type: 'bar' },
  
  // 🎭 MUSIC VENUES & LIVE SHOWS
  { name: 'The Danforth Music Hall', address: '147 Danforth Ave', latitude: 43.6770, longitude: -79.3560, type: 'bar' },
  { name: 'History', address: '1663 Queen St E', latitude: 43.6660, longitude: -79.3190, type: 'bar' },
  { name: 'Phoenix Concert Theatre', address: '410 Sherbourne St', latitude: 43.6640, longitude: -79.3730, type: 'bar' },
  { name: 'Lee\'s Palace', address: '529 Bloor St W', latitude: 43.6660, longitude: -79.4060, type: 'bar' },
  { name: 'The Rex Hotel Jazz & Blues Bar', address: '194 Queen St W', latitude: 43.6490, longitude: -79.3890, type: 'bar' },
  { name: 'Velvet Underground', address: '510 Queen St W', latitude: 43.6485, longitude: -79.3990, type: 'bar' },
  { name: 'The Opera House', address: '735 Queen St E', latitude: 43.6570, longitude: -79.3530, type: 'bar' },
  { name: 'Adelaide Hall', address: '250 Adelaide St W', latitude: 43.6480, longitude: -79.3890, type: 'bar' },
  
  // 🤫 SPEAKEASIES & HIDDEN BARS
  { name: 'Cold Tea', address: '1280 Queen St W', latitude: 43.6420, longitude: -79.4250, type: 'bar' },
  { name: 'The Lockhart', address: '1479 Dundas St W', latitude: 43.6515, longitude: -79.4295, type: 'bar' },
  { name: 'Bar Chef', address: '472 Queen St W', latitude: 43.6485, longitude: -79.3980, type: 'bar' },
  { name: 'Civil Liberties', address: '878 Bloor St W', latitude: 43.6625, longitude: -79.4155, type: 'bar' },
  { name: 'The Emmet Ray', address: '924 College St', latitude: 43.6545, longitude: -79.4190, type: 'bar' },
  
  // 🍷 WINE BARS & COCKTAIL LOUNGES
  { name: 'BarChef', address: '472 Queen St W', latitude: 43.6485, longitude: -79.3980, type: 'bar' },
  { name: 'Alo Bar', address: '163 Spadina Ave', latitude: 43.6485, longitude: -79.3950, type: 'bar' },
  { name: 'Bar Mordecai', address: '928 College St', latitude: 43.6545, longitude: -79.4192, type: 'bar' },
  { name: 'Louis Louis', address: '1033 Bay St', latitude: 43.6685, longitude: -79.3880, type: 'bar' },
  
  // 🎤 COMEDY & ENTERTAINMENT
  { name: 'The Second City', address: '51 Mercer St', latitude: 43.6445, longitude: -79.3910, type: 'theater' },
  { name: 'Yuk Yuk\'s', address: '224 Richmond St W', latitude: 43.6490, longitude: -79.3880, type: 'theater' },
  { name: 'Bad Dog Theatre', address: '875 Bloor St W', latitude: 43.6625, longitude: -79.4150, type: 'theater' },
  
  // 🌳 OUTDOOR & CULTURAL
  { name: 'Harbourfront Centre', address: '235 Queens Quay W', latitude: 43.6380, longitude: -79.3830, type: 'outdoor' },
  { name: 'Nathan Phillips Square', address: '100 Queen St W', latitude: 43.6520, longitude: -79.3830, type: 'outdoor' },
  { name: 'Trinity Bellwoods Park', address: '790 Queen St W', latitude: 43.6470, longitude: -79.4130, type: 'outdoor' },
  { name: 'High Park', address: '1873 Bloor St W', latitude: 43.6465, longitude: -79.4637, type: 'outdoor' },
  { name: 'The Bentway', address: '250 Fort York Blvd', latitude: 43.6380, longitude: -79.4030, type: 'outdoor' },
  
  // 🎨 GALLERIES & MUSEUMS
  { name: 'Art Gallery of Ontario', address: '317 Dundas St W', latitude: 43.6536, longitude: -79.3927, type: 'gallery' },
  { name: 'ROM', address: '100 Queens Park', latitude: 43.6677, longitude: -79.3948, type: 'gallery' },
  { name: 'Casa Loma', address: '1 Austin Terrace', latitude: 43.6780, longitude: -79.4090, type: 'gallery' },
];

// Diverse event templates
const EVENT_TEMPLATES = {
  music: [
    // Major Artists
    { title: 'Drake - For All The Dogs Tour', category: 'Music', description: 'Toronto\'s own Drake returns home for an unforgettable night of hits from his latest album and career-spanning classics.' },
    { title: 'The Weeknd - After Hours Experience', category: 'Music', description: 'An immersive concert experience featuring stunning visuals and The Weeknd\'s biggest hits.' },
    { title: 'Shawn Mendes Live', category: 'Music', description: 'Canadian superstar Shawn Mendes performs his chart-topping hits in an intimate setting.' },
    { title: 'Tory Lanez Homecoming Show', category: 'Music', description: 'Toronto rapper Tory Lanez brings the energy with hits from his entire discography.' },
    { title: 'PartyNextDoor Live', category: 'Music', description: 'OVO Sound\'s PartyNextDoor performs his R&B hits in an intimate venue.' },
    
    // Live Music Venues
    { title: 'Jazz Night at The Rex', category: 'Music', description: 'Experience Toronto\'s finest jazz musicians in this legendary venue. Featuring local and international artists.' },
    { title: 'Indie Rock at Lee\'s Palace', category: 'Music', description: 'Discover emerging indie rock bands from Toronto\'s vibrant music scene at this iconic Bloor St venue.' },
    { title: 'Live Band Night at Horseshoe Tavern', category: 'Music', description: 'Toronto\'s oldest rock venue hosts local bands and touring acts. A true Toronto institution.' },
    { title: 'Phoenix Concert Theatre Show', category: 'Music', description: 'Mid-size venue featuring alternative, rock, and indie artists on Sherbourne St.' },
    { title: 'The Danforth Music Hall Concert', category: 'Music', description: 'Historic venue on the Danforth hosting rock, indie, and electronic acts.' },
    
    // Electronic & DJ Events
    { title: 'Electronic Music Festival', category: 'Music', description: 'A night of cutting-edge electronic music featuring top DJs and producers.' },
    { title: 'Resident Advisor Showcase', category: 'Music', description: 'Underground techno and house music with international DJs.' },
    
    // Hip Hop & R&B
    { title: 'Hip Hop Cypher Night', category: 'Music', description: 'Toronto\'s best MCs battle it out in this high-energy freestyle competition.' },
    { title: 'R&B Soul Sessions', category: 'Music', description: 'Smooth R&B vibes with Toronto\'s most soulful voices.' },
    { title: 'OVO Sound Presents', category: 'Music', description: 'Drake\'s OVO Sound label showcases Toronto\'s hottest up-and-coming artists.' },
  ],
  nightlife: [
    // REBEL (Mega Club)
    { title: 'Saturday Night at Rebel', category: 'Nightlife', description: 'Toronto\'s biggest nightclub experience with world-class DJs, LED walls, and 3000+ party people.' },
    { title: 'Rebel presents: EDM Takeover', category: 'Nightlife', description: 'International DJ lineup featuring the hottest names in electronic dance music.' },
    
    // FICTION (King West)
    { title: 'FICTION Fridays', category: 'Nightlife', description: 'King West\'s premier Friday night with top 40, hip hop, and VIP bottle service.' },
    { title: 'Girls Night Out at FICTION', category: 'Nightlife', description: 'Free entry for ladies before midnight, champagne specials, and all the hits.' },
    
    // AMPM (College St)
    { title: 'AMPM College Street Takeover', category: 'Nightlife', description: 'Underground vibes meets mainstream hits. Toronto\'s most diverse dance floor.' },
    { title: 'Techno Tuesday at AMPM', category: 'Nightlife', description: 'Deep house and techno with resident DJs spinning until 3 AM.' },
    
    // CODA (Bathurst)
    { title: 'CODA Warehouse Party', category: 'Nightlife', description: 'Raw techno and house in an intimate warehouse setting. For real music lovers.' },
    { title: 'CODA Late Night Sessions', category: 'Nightlife', description: 'Underground electronic music until sunrise. BYOB vibes.' },
    
    // Lavelle (Rooftop)
    { title: 'Lavelle Rooftop Party', category: 'Nightlife', description: 'Dance under the stars on King West\'s hottest rooftop with skyline views.' },
    { title: 'Sunset Sessions at Lavelle', category: 'Nightlife', description: 'Start your night right with golden hour drinks and DJ sets 10 floors up.' },
    
    // EFS Social
    { title: 'EFS Social Saturdays', category: 'Nightlife', description: 'King West nightlife at its finest. Hip hop, R&B, and afrobeats all night.' },
    
    // Lost & Found
    { title: 'Lost & Found Fridays', category: 'Nightlife', description: 'Multi-level nightclub experience with different vibes on every floor.' },
    
    // Diverse Nights
    { title: 'Latin Night at Uniun', category: 'Nightlife', description: 'Salsa, bachata, and reggaeton with live performances and dance lessons.' },
    { title: 'Throwback Thursday', category: 'Nightlife', description: '90s and 2000s hits at multiple venues - dress up and relive your youth.' },
    { title: 'LGBTQ+ Pride Night', category: 'Nightlife', description: 'Celebrate diversity at Church Street\'s best queer venues. Drag shows, dancing, and good vibes.' },
    { title: 'Afrobeats & Dancehall Night', category: 'Nightlife', description: 'The hottest African and Caribbean music all night long.' },
    { title: 'Hip Hop vs R&B Party', category: 'Nightlife', description: 'Two rooms, two vibes. Choose your side or bounce between both.' },
    { title: 'Indie Dance Party', category: 'Nightlife', description: 'Alternative, indie rock, and dance music for people who hate mainstream clubs.' },
    
    // Speakeasy Events
    { title: 'Secret Cocktail Experience', category: 'Nightlife', description: 'Hidden speakeasy with craft cocktails and live jazz. Password required at the door.' },
    { title: 'The Lockhart Wizarding Night', category: 'Nightlife', description: 'Harry Potter-themed speakeasy with magical cocktails and butterbeer.' },
    
    // Bar Events
    { title: 'Drake Hotel Late Night', category: 'Nightlife', description: 'Live DJ sets and indie vibes at Queen West\'s most iconic venue.' },
    { title: 'Bar Hop Craft Beer Night', category: 'Nightlife', description: '50+ craft beers on tap with live music and games.' },
    { title: 'Shameful Tiki Room Luau', category: 'Nightlife', description: 'Tropical cocktails, tiki vibes, and Hawaiian shirts encouraged.' },
  ],
  sports: [
    { title: 'Toronto Raptors vs Lakers', category: 'Sports', description: 'NBA action at Scotiabank Arena - watch the Raptors take on LeBron and the Lakers.' },
    { title: 'Blue Jays Home Game', category: 'Sports', description: 'Major League Baseball at the Rogers Centre - America\'s pastime in Canada\'s biggest city.' },
    { title: 'Toronto FC Match', category: 'Sports', description: 'MLS soccer action with Toronto FC - join the passionate supporters section.' },
    { title: 'Maple Leafs Hockey Night', category: 'Sports', description: 'NHL hockey - the most Canadian experience you can have. Go Leafs Go!' },
    { title: 'Marathon Weekend', category: 'Sports', description: 'Run through Toronto\'s most scenic neighborhoods in this annual marathon event.' },
  ],
  food: [
    { title: 'Winterlicious Food Festival', category: 'Food & Drink', description: 'Toronto\'s premier culinary event featuring prix-fixe menus at the city\'s best restaurants.' },
    { title: 'Taste of Little Italy', category: 'Food & Drink', description: 'Sample authentic Italian cuisine from College Street\'s best restaurants and cafes.' },
    { title: 'Craft Beer Festival', category: 'Food & Drink', description: 'Taste over 100 craft beers from Ontario\'s best breweries.' },
    { title: 'Food Truck Rally', category: 'Food & Drink', description: 'Toronto\'s best food trucks gather for a day of delicious street food.' },
    { title: 'Wine & Cheese Tasting', category: 'Food & Drink', description: 'An elegant evening of wine pairings and artisanal cheeses.' },
  ],
  arts: [
    { title: 'Nuit Blanche Toronto', category: 'Arts & Theatre', description: 'All-night contemporary art festival transforming the city into an open-air gallery.' },
    { title: 'Comedy Night', category: 'Arts & Theatre', description: 'Stand-up comedy featuring Toronto\'s funniest comedians and special guests.' },
    { title: 'Shakespeare in the Park', category: 'Arts & Theatre', description: 'Classic theater under the stars - bring a blanket and enjoy the show.' },
    { title: 'Art Gallery Opening', category: 'Arts & Theatre', description: 'Exclusive preview of contemporary Canadian art with wine and networking.' },
    { title: 'Improv Comedy Show', category: 'Arts & Theatre', description: 'Hilarious unscripted comedy - every show is completely unique.' },
  ],
  festivals: [
    { title: 'Caribana Festival', category: 'Festival', description: 'North America\'s largest Caribbean festival with colorful parades and music.' },
    { title: 'Pride Toronto', category: 'Festival', description: 'One of the world\'s largest Pride celebrations with parades, parties, and performances.' },
    { title: 'Toronto International Film Festival', category: 'Festival', description: 'TIFF - where Hollywood comes to Toronto. Red carpets, premieres, and celebrity sightings.' },
    { title: 'Christmas Market', category: 'Festival', description: 'European-style Christmas market at the Distillery District with crafts, food, and festive cheer.' },
  ],
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysAhead) + 1);
  
  // Random time between 6 PM and 11 PM for most events
  const hour = 18 + Math.floor(Math.random() * 5);
  const minute = Math.random() < 0.5 ? 0 : 30;
  
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function getImageForCategory(category: string): string {
  const images: { [key: string]: string[] } = {
    'Music': [
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      'https://images.unsplash.com/photo-1501281668745-f7f5792d7c3b?w=800',
    ],
    'Nightlife': [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
    ],
    'Sports': [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800',
    ],
    'Food & Drink': [
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    ],
    'Arts & Theatre': [
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    ],
    'Festival': [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    ],
  };
  
  const categoryImages = images[category] || images['Music'];
  return getRandomElement(categoryImages);
}

export function generateTorontoEvents(count: number = 50): Event[] {
  const events: Event[] = [];
  const usedTitles = new Set<string>();
  
  // Get all event templates
  const allTemplates = [
    ...EVENT_TEMPLATES.music,
    ...EVENT_TEMPLATES.nightlife,
    ...EVENT_TEMPLATES.sports,
    ...EVENT_TEMPLATES.food,
    ...EVENT_TEMPLATES.arts,
    ...EVENT_TEMPLATES.festivals,
  ];
  
  // Shuffle templates for variety
  const shuffledTemplates = allTemplates.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count && i < shuffledTemplates.length; i++) {
    const template = shuffledTemplates[i];
    
    // Skip if we've already used this title
    if (usedTitles.has(template.title)) continue;
    usedTitles.add(template.title);
    
    // Select appropriate venue based on category
    let venue: TorontoVenue;
    if (template.category === 'Music') {
      const musicVenues = TORONTO_VENUES.filter(v => ['arena', 'theater', 'bar', 'outdoor'].includes(v.type));
      venue = getRandomElement(musicVenues);
    } else if (template.category === 'Nightlife') {
      const nightVenues = TORONTO_VENUES.filter(v => v.type === 'club' || v.type === 'bar');
      venue = getRandomElement(nightVenues);
    } else if (template.category === 'Sports') {
      const sportsVenues = TORONTO_VENUES.filter(v => v.type === 'arena' || v.type === 'stadium');
      venue = getRandomElement(sportsVenues);
    } else if (template.category === 'Food & Drink') {
      const foodVenues = TORONTO_VENUES.filter(v => v.type === 'outdoor' || v.type === 'bar');
      venue = getRandomElement(foodVenues);
    } else if (template.category === 'Arts & Theatre') {
      const artsVenues = TORONTO_VENUES.filter(v => v.type === 'theater' || v.type === 'gallery');
      venue = getRandomElement(artsVenues);
    } else {
      venue = getRandomElement(TORONTO_VENUES);
    }
    
    // Determine pricing
    const isFree = Math.random() < 0.25; // 25% free events
    let priceMin: number | undefined;
    let priceMax: number | undefined;
    
    if (!isFree) {
      if (venue.type === 'arena' || venue.type === 'stadium') {
        priceMin = 50 + Math.floor(Math.random() * 50);
        priceMax = priceMin + 50 + Math.floor(Math.random() * 100);
      } else if (venue.type === 'theater') {
        priceMin = 30 + Math.floor(Math.random() * 30);
        priceMax = priceMin + 30 + Math.floor(Math.random() * 50);
      } else if (venue.type === 'club') {
        priceMin = 15 + Math.floor(Math.random() * 15);
        priceMax = priceMin + 10 + Math.floor(Math.random() * 20);
      } else {
        priceMin = 10 + Math.floor(Math.random() * 20);
        priceMax = priceMin + 10 + Math.floor(Math.random() * 30);
      }
    }
    
    // Get vibe and dress code based on venue type
    const vibeOptions = VENUE_VIBES[venue.type] || ['casual'];
    const dressCodeOptions = VENUE_DRESS_CODES[venue.type] || ['casual'];
    
    // Determine age restriction based on venue type
    let ageRestriction = 'All ages';
    if (venue.type === 'club') {
      ageRestriction = '19+'; // Toronto legal drinking age
    } else if (venue.type === 'bar' && Math.random() > 0.3) {
      ageRestriction = '19+';
    }
    
    // Estimate attendees based on venue type
    let estimatedAttendees = 50;
    if (venue.type === 'arena' || venue.type === 'stadium') {
      estimatedAttendees = 500 + Math.floor(Math.random() * 1500);
    } else if (venue.type === 'club') {
      estimatedAttendees = 100 + Math.floor(Math.random() * 400);
    } else if (venue.type === 'theater') {
      estimatedAttendees = 50 + Math.floor(Math.random() * 200);
    } else {
      estimatedAttendees = 30 + Math.floor(Math.random() * 150);
    }
    
    events.push({
      id: `toronto-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.title,
      description: template.description,
      start_time: getRandomDate(60), // Events within next 60 days
      category: template.category,
      is_free: isFree,
      cover_image_url: getImageForCategory(template.category),
      url: 'https://vibecheck.app/toronto-event',
      venue: {
        name: venue.name,
        city: 'Toronto',
        latitude: venue.latitude,
        longitude: venue.longitude,
        address: `${venue.address}, Toronto, ON`,
      },
      priceMin: isFree ? undefined : priceMin,
      priceMax: isFree ? undefined : priceMax,
      source: 'toronto-local',
      
      // Premium features
      vibeTag: getRandomElement(vibeOptions),
      dressCode: getRandomElement(dressCodeOptions),
      ageRestriction,
      estimatedAttendees,
    });
  }
  
  // Sort by date
  events.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  
  console.log(`🍁 Generated ${events.length} diverse Toronto events`);
  console.log(`📊 Categories: ${[...new Set(events.map(e => e.category))].join(', ')}`);
  console.log(`💰 ${events.filter(e => e.is_free).length} free, ${events.filter(e => !e.is_free).length} paid`);
  
  return events;
}
