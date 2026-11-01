/* ============================================================
   TRIP COST DATA — one entry per country for /embed/trip-cost.html
   ============================================================
   Every amount is in USD. The calculator converts to CAD / GBP / EUR
   with fixed rates (display only, not live FX): the country's own
   `rates` object if it has one, otherwise the shared TRIP_RATES below.
   Give each new country its own `rates` so refreshing FX for one post
   never changes the numbers already published in another.

   How each line is split (the "unit" field):
     perPerson        → amount × travelers
     perPersonPerDay  → amount × travelers × days
     perRoomPerNight  → amount × rooms × nights   (rooms = ceil(travelers / 2))
     perCar           → amount × cars             (cars  = ceil(travelers / 3))

   Flights use three points from the same KAYAK route page:
     budget  = low end of the "typical" range
     mid     = 12-month average
     comfort = high end of the "typical" range

   To add a country: copy the india block (it has its own rates and
   styleNotes), change the numbers, then embed with
   /embed/trip-cost.html?country=<key>
   ============================================================ */

var TRIP_RATES = {
  // Fallback for countries without their own `rates` (Thailand uses these).
  // Banque de France daily parities, 19 Oct 2026 (EUR base), converted to USD base.
  date: '2026-10-19',
  USD: 1,
  CAD: 1.41,
  GBP: 0.75,
  EUR: 0.89
};

var TRIP_ORIGINS = [
  { key: 'lax', label: 'Los Angeles', currency: 'USD' },
  { key: 'nyc', label: 'New York', currency: 'USD' },
  { key: 'yyz', label: 'Toronto', currency: 'CAD' },
  { key: 'lon', label: 'London', currency: 'GBP' },
  { key: 'fra', label: 'Frankfurt', currency: 'EUR' }
];

var TRIP_DATA = {
  thailand: {
    name: 'Thailand',
    title: 'How much will your Thailand trip cost?',
    subtitle: 'Pick where you fly from and how you like to travel. Every line is editable if you already have your own numbers.',
    defaultDays: 10,
    itinerary: 'Bangkok → Chiang Mai → Phuket, flying back to Bangkok for your flight home.',
    lastUpdated: '2026-10-27',

    // Round trip, economy, per person, USD.
    flights: {
      lax: { budget: 670,  mid: 784,  comfort: 957,  peak: 1131, peakMonth: 'December' },
      nyc: { budget: 858,  mid: 1012, comfort: 1277, peak: 1499, peakMonth: 'December' },
      yyz: { budget: 1026, mid: 1177, comfort: 1351, peak: 1467, peakMonth: 'December' },
      lon: { budget: 710,  mid: 902,  comfort: 1131, peak: 1255, peakMonth: 'December' },
      fra: { budget: 758,  mid: 916,  comfort: 1113, peak: 1148, peakMonth: 'December' } // from €675 / €815 / €991 / €1,022
    },

    lines: [
      { key: 'stay', label: 'Accommodation', unit: 'perRoomPerNight',
        hint: 'Guesthouse private room / 3-star hotel / 4–5 star hotel. Solo travelers pay the whole room.',
        budget: 25, mid: 65, comfort: 180 },
      { key: 'food', label: 'Food & drinks', unit: 'perPersonPerDay',
        hint: 'Street food and local spots / sit-down restaurants / hotel and fine dining.',
        budget: 12, mid: 30, comfort: 75 },
      { key: 'local', label: 'Getting around the city', unit: 'perPersonPerDay',
        hint: 'BTS, MRT, buses, Grab and tuk-tuks.',
        budget: 4, mid: 10, comfort: 22 },
      { key: 'intercity', label: 'Travel between cities', unit: 'perPerson',
        hint: '3 legs: Bangkok → Chiang Mai (sleeper train or flight), Chiang Mai → Phuket, Phuket → Bangkok.',
        budget: 160, mid: 180, comfort: 340 },
      { key: 'transfers', label: 'Airport & station transfers', unit: 'perCar',
        hint: 'About 6 rides for the whole trip (Grab from Suvarnabhumi to central Bangkok is ฿350–600). One car fits up to 3 people.',
        budget: 40, mid: 90, comfort: 180 },
      { key: 'activities', label: 'Tours & activities', unit: 'perPerson',
        hint: 'Bangkok temples (฿1,030 for 4), a Phi Phi day trip + ฿400 park fee, plus a cooking class and elephant sanctuary from mid-range up.',
        budget: 95, mid: 245, comfort: 390 },
      { key: 'sim', label: 'SIM or eSIM', unit: 'perPerson',
        hint: 'A data eSIM from about $10, or a 15-day tourist SIM at the airport (฿699).',
        budget: 10, mid: 21, comfort: 21 },
      { key: 'atm', label: 'ATM fees', unit: 'perPerson',
        hint: 'Thai ATMs charge foreign cards ฿220–250 per withdrawal. Assumes 3 withdrawals.',
        budget: 20, mid: 20, comfort: 20 },
      { key: 'insurance', label: 'Travel insurance', unit: 'perPerson',
        hint: 'Medical only / standard plan / plan with trip cancellation.',
        budget: 35, mid: 70, comfort: 120 },
      { key: 'visa', label: 'Visa & entry fees', unit: 'perPerson',
        hint: 'US, Canada, UK and EU passports get 30 days visa free. The TDAC arrival card is free.',
        budget: 0, mid: 0, comfort: 0 }
    ],

    // Applied to everything except flights.
    bufferPct: 0.10,

    sources: [
      { label: 'KAYAK route pages (LAX, NYC, YYZ, LON, FRA → BKK)', url: 'https://www.kayak.com/flight-routes/Los-Angeles-LAX/Bangkok-BKK' },
      { label: 'Radical Storage, Thailand travel budget 2026', url: 'https://radicalstorage.com/travel/is-thailand-expensive/' },
      { label: 'Budget Your Trip, Thailand', url: 'https://www.budgetyourtrip.com/thailand' },
      { label: 'KAYAK, Bangkok → Chiang Mai', url: 'https://www.kayak.com/flight-routes/Bangkok-TH1/Chiang-Mai-CNX' },
      { label: 'Squaremouth, Thailand travel insurance', url: 'https://www.squaremouth.com/resources/destinations/thailand' },
      { label: 'Numbeo, Bangkok / Chiang Mai / Phuket prices (26 Oct 2026)', url: 'https://www.numbeo.com/cost-of-living/in/Bangkok' },
      { label: 'Royal Grand Palace, ticket prices', url: 'https://royalgrandpalace.th/en/visit/practical-information' },
      { label: 'Elephant Nature Park, visit prices', url: 'https://elephantnaturepark.org/enp/' },
      { label: 'Train36, Bangkok → Chiang Mai sleeper fares', url: 'https://www.train36.com/train-9-bangkok-to-chiang-mai-timetable.html' },
      { label: 'KAYAK, Chiang Mai → Phuket', url: 'https://www.kayak.com/flight-routes/Chiang-Mai-CNX/Phuket-City-HKT' },
      { label: 'The Longest Way Home, Thailand ATM fees', url: 'https://www.thelongestwayhome.com/travel-guides/thailand/thailand-money-atms-credit-cards.html' },
      { label: 'Travelsim Asia, Thailand SIM prices (Oct 2026)', url: 'https://travelsimasia.com/blogs/thailand-guides/best-esim-thailand-1-month' },
      { label: 'VisasNews, 30-day visa exemption from 15 Sep 2026', url: 'https://visasnews.com/en/thailand-to-officially-cut-visa-free-stay-to-30-days-on-september-15-2026/' }
    ]
  },

  india: {
    name: 'India',
    title: 'How much will your India trip cost?',
    subtitle: 'Pick where you fly from and how you like to travel. Every line is editable if you already have your own numbers.',
    defaultDays: 10,
    itinerary: 'Delhi → Agra → Jaipur → Udaipur, flying back to Delhi for your flight home.',
    lastUpdated: '2026-11-01',

    // Own exchange rates, so refreshing them never moves another country's numbers.
    // Banque de France daily parities, 30 Oct 2026 (EUR base), converted to USD base.
    // INR is for reference (the ₹ prices in the hints); it is not a display currency.
    rates: {
      date: '2026-10-30',
      USD: 1,
      CAD: 1.40,
      GBP: 0.75,
      EUR: 0.90,
      INR: 94.96
    },

    // Replaces the default style descriptions under the Budget / Mid-range / Comfort buttons.
    styleNotes: {
      budget: 'Guesthouses, street food, metro and autorickshaws, trains where possible.',
      mid: '3-star hotels, restaurants, Uber and Ola rides, fast trains and domestic flights.',
      comfort: '4–5 star hotels, hotel dining, executive class trains and domestic flights.'
    },

    // Round trip, economy, per person, USD.
    flights: {
      lax: { budget: 889,  mid: 1070, comfort: 1290, peak: 1308, peakMonth: 'December' },
      nyc: { budget: 778,  mid: 941,  comfort: 1233, peak: 1262, peakMonth: 'December' },
      yyz: { budget: 1119, mid: 1316, comfort: 1546, peak: 1601, peakMonth: 'December' },
      lon: { budget: 641,  mid: 757,  comfort: 902,  peak: 956,  peakMonth: 'December' },
      fra: { budget: 698,  mid: 787,  comfort: 917,  peak: 891,  peakMonth: 'December' } // from €628 / €708 / €825 / €802
    },

    lines: [
      { key: 'stay', label: 'Accommodation', unit: 'perRoomPerNight',
        hint: 'Guesthouse private room / 3-star hotel / 4–5 star hotel, with India\'s 5% hotel GST (18% on rooms over ₹7,500). Solo travelers pay the whole room.',
        budget: 27, mid: 63, comfort: 189 },
      { key: 'food', label: 'Food & drinks', unit: 'perPersonPerDay',
        hint: 'Local restaurants and street food / sit-down restaurants / hotel dining with drinks.',
        budget: 12, mid: 21, comfort: 63 },
      { key: 'local', label: 'Getting around the city', unit: 'perPersonPerDay',
        hint: 'Delhi Metro, autorickshaws, Uber and Ola.',
        budget: 2, mid: 6, comfort: 18 },
      { key: 'intercity', label: 'Travel between cities', unit: 'perPerson',
        hint: '4 legs: Delhi → Agra (train), Agra → Jaipur (train), Jaipur → Udaipur (train or flight), Udaipur → Delhi (flight).',
        budget: 58, mid: 150, comfort: 201 },
      { key: 'transfers', label: 'Airport & station transfers', unit: 'perCar',
        hint: 'About 8 rides for the whole trip (Uber from Delhi airport to the centre is ₹350–700). One car fits up to 3 people.',
        budget: 29, mid: 59, comfort: 118 },
      { key: 'activities', label: 'Tours & activities', unit: 'perPerson',
        hint: 'Foreigner tickets: Taj Mahal ₹1,100 + ₹200 for the mausoleum, Red Fort, Qutub Minar, Agra Fort, Amber Fort and more. A guide, boat ride and cooking class from mid-range up.',
        budget: 69, mid: 134, comfort: 163 },
      { key: 'sim', label: 'SIM or eSIM', unit: 'perPerson',
        hint: 'An Airtel tourist SIM at Delhi airport (₹350, 28 days), or a 5 GB data eSIM from about $13.',
        budget: 4, mid: 16, comfort: 16 },
      { key: 'atm', label: 'ATM fees', unit: 'perPerson',
        hint: 'Private bank ATMs charge foreign cards about ₹200–250 per withdrawal, with a ₹10,000 limit. Assumes 4 withdrawals.',
        budget: 9, mid: 9, comfort: 9 },
      { key: 'insurance', label: 'Travel insurance', unit: 'perPerson',
        hint: 'Medical only / standard plan / plan with trip cancellation.',
        budget: 35, mid: 70, comfort: 120 },
      { key: 'visa', label: 'Visa & entry fees', unit: 'perPerson',
        hint: 'e-Tourist Visa (30 days): $25 from July to March, $10 from April to June, plus a 3% bank charge. Same fee for US, Canada, UK and EU passports. The e-Arrival card is free.',
        budget: 26, mid: 26, comfort: 26 }
    ],

    // Applied to everything except flights.
    bufferPct: 0.10,

    sources: [
      { label: 'KAYAK route pages (LAX, NYC, YYZ, LON, FRA → DEL)', url: 'https://www.kayak.com/flight-routes/Los-Angeles-LAX/New-Delhi-Indira-Gandhi-Intl-DEL' },
      { label: 'Indian e-Visa portal, e-Tourist Visa fee table', url: 'https://indianvisaonline.gov.in/evisa/images/Etourist_fee_final.pdf' },
      { label: 'Taj Mahal official site, Agra monument tickets', url: 'https://tajmahal.gov.in/ticketing.aspx' },
      { label: 'Business Today, Red Fort tickets and opening days (Feb 2026)', url: 'https://www.businesstoday.in/india/story/no-more-monday-closure-red-fort-to-now-remain-open-daily-check-timings-517423-2026-02-22' },
      { label: 'Pinkcity Post, Jaipur monument prices from 1 Jan 2026', url: 'https://www.pinkcitypost.com/visiting-jaipurs-heritage-sites-to-cost-more-from-jan-1-what-tourists-should-know/' },
      { label: 'Budget Your Trip, Udaipur (Kayak hotel data, Sep 2026)', url: 'https://www.budgetyourtrip.com/india/udaipur' },
      { label: 'Numbeo, Delhi / Jaipur prices (31 Oct 2026)', url: 'https://www.numbeo.com/cost-of-living/in/Delhi' },
      { label: 'RailMitra, Gatimaan Express fares', url: 'https://www.railmitra.com/blog/gatimaan-express-guide-timings-fares' },
      { label: 'ixigo, Agra → Jaipur train fares', url: 'https://www.ixigo.com/by-train-rail/agra-to-jaipur-by-train' },
      { label: 'KAYAK, Jaipur → Udaipur', url: 'https://www.kayak.com/flight-routes/Jaipur-Sanganeer-JAI/Udaipur-Dabok-UDR' },
      { label: 'KAYAK, Udaipur → Delhi', url: 'https://www.kayak.com/flight-routes/Udaipur-Dabok-UDR/New-Delhi-Indira-Gandhi-Intl-DEL' },
      { label: 'AirConnect, Delhi airport taxi fares', url: 'https://airconnect.live/en/airports/delhi-airport-taxi-cost' },
      { label: 'Travel India Smart, ATMs and SIM cards in India', url: 'https://www.travelindiasmart.com/trip-planning/atms-and-cards-india' },
      { label: 'Squaremouth, India travel insurance', url: 'https://www.squaremouth.com/resources/destinations/india' }
    ]
  }
};
