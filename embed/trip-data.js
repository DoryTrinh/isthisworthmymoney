/* ============================================================
   TRIP COST DATA — one entry per country for /embed/trip-cost.html
   ============================================================
   Every amount is in USD. The calculator converts to CAD / GBP / EUR
   with the fixed RATES below (display only, not live FX).

   How each line is split (the "unit" field):
     perPerson        → amount × travelers
     perPersonPerDay  → amount × travelers × days
     perRoomPerNight  → amount × rooms × nights   (rooms = ceil(travelers / 2))
     perCar           → amount × cars             (cars  = ceil(travelers / 3))

   Flights use three points from the same KAYAK route page:
     budget  = low end of the "typical" range
     mid     = 12-month average
     comfort = high end of the "typical" range

   To add a country: copy the thailand block, change the numbers,
   then embed with  /embed/trip-cost.html?country=<key>
   ============================================================ */

var TRIP_RATES = {
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

  vietnam: {
    name: 'Vietnam',
    title: 'How much will your Vietnam trip cost?',
    subtitle: 'Pick where you fly from and how you like to travel. Every line is editable if you already have your own numbers.',
    defaultDays: 10,
    itinerary: 'Ho Chi Minh City → Hoi An (via Da Nang) → Hanoi with a Ha Long Bay day trip, flying back to Ho Chi Minh City for your flight home.',
    lastUpdated: '2026-11-01',

    // The rates the Vietnam article used: Banque de France, 30 Oct 2026.
    rates: { date: '2026-10-30', USD: 1, CAD: 1.40, GBP: 0.75, EUR: 0.90 },

    // Round trip to Ho Chi Minh City (SGN), economy, per person, USD.
    flights: {
      lax: { budget: 719,  mid: 843,  comfort: 1064, peak: 1220, peakMonth: 'December' },
      nyc: { budget: 858,  mid: 1016, comfort: 1310, peak: 1519, peakMonth: 'December' },
      yyz: { budget: 1035, mid: 1181, comfort: 1391, peak: 1455, peakMonth: 'December' },
      lon: { budget: 738,  mid: 921,  comfort: 1106, peak: 1221, peakMonth: 'December' },
      fra: { budget: 840,  mid: 970,  comfort: 1154, peak: 1140, peakMonth: 'December' } // from €756 / €873 / €1,039 / €1,026
    },

    lines: [
      { key: 'stay', label: 'Accommodation', unit: 'perRoomPerNight',
        hint: 'Guesthouse private room / 4-star hotel / 5-star hotel. Solo travelers pay the whole room.',
        budget: 23, mid: 62, comfort: 109 },
      { key: 'food', label: 'Food & drinks', unit: 'perPersonPerDay',
        hint: 'Street food and local spots / sit-down restaurants, coffee and a beer / hotel and fine dining.',
        budget: 7, mid: 19, comfort: 38 },
      { key: 'local', label: 'Getting around the city', unit: 'perPersonPerDay',
        hint: 'GrabBike or GrabCar rides around Ho Chi Minh City, Hoi An and Hanoi.',
        budget: 2, mid: 8, comfort: 15 },
      { key: 'intercity', label: 'Travel between cities', unit: 'perPerson',
        hint: '3 legs: Ho Chi Minh City → Da Nang (flight), Da Nang → Hanoi (sleeper train or flight), Hanoi → Ho Chi Minh City (flight).',
        budget: 129, mid: 153, comfort: 233 },
      { key: 'transfers', label: 'Airport & station transfers', unit: 'perCar',
        hint: 'About 6 Grab rides for the whole trip (Da Nang airport to Hoi An is 250,000 to 450,000 VND). One car fits up to 3 people.',
        budget: 43, mid: 56, comfort: 70 },
      { key: 'activities', label: 'Tours & activities', unit: 'perPerson',
        hint: 'A Ha Long Bay day trip from Hanoi, Hoi An Ancient Town, Cu Chi Tunnels and city sights, plus a cooking class from mid-range up.',
        budget: 68, mid: 158, comfort: 360 },
      { key: 'sim', label: 'SIM or eSIM', unit: 'perPerson',
        hint: 'A 15-day Vinaphone tourist SIM, 199,000 VND in town or 220,000 to 250,000 VND at the airport.',
        budget: 8, mid: 9, comfort: 9 },
      { key: 'atm', label: 'ATM fees', unit: 'perPerson',
        hint: 'Many ATMs charge foreign cards about 50,000 VND per withdrawal. Assumes 3 withdrawals.',
        budget: 6, mid: 6, comfort: 6 },
      { key: 'insurance', label: 'Travel insurance', unit: 'perPerson',
        hint: 'Medical only / standard plan / plan with trip cancellation.',
        budget: 35, mid: 70, comfort: 120 },
      { key: 'visa', label: 'Visa & entry fees', unit: 'perPerson',
        hint: 'US and Canadian passports need the $25 e-visa. UK, German and other passports on the 45-day lists pay $0, so set this to 0.',
        budget: 25, mid: 25, comfort: 25 }
    ],

    // Applied to everything except flights.
    bufferPct: 0.10,

    sources: [
      { label: 'KAYAK route pages (LAX, NYC, YYZ, LON, FRA → SGN)', url: 'https://www.kayak.com/flight-routes/Los-Angeles-LAX/Ho-Chi-Minh-City-SGN' },
      { label: 'KAYAK, Hanoi / Hoi An / Ho Chi Minh City hotels', url: 'https://www.kayak.com/Hanoi-Hotels.34211.hotel.ksp' },
      { label: 'Budget Your Trip, Vietnam', url: 'https://www.budgetyourtrip.com/vietnam/hanoi' },
      { label: 'Numbeo, Hanoi / Ho Chi Minh City / Da Nang prices (31 Oct 2026)', url: 'https://www.numbeo.com/cost-of-living/in/Hanoi' },
      { label: 'vietnamtourism.com, Grab prices', url: 'https://www.vietnamtourism.com/en/grab-bike-vs-grab-car-in-vietnam-price-and-when-to-use-each' },
      { label: 'KAYAK, Ho Chi Minh City → Da Nang', url: 'https://www.kayak.com/flight-routes/Ho-Chi-Minh-City-SGN/Da-Nang-DAD' },
      { label: 'vietnamtourism.com, Da Nang → Hanoi train and bus', url: 'https://www.vietnamtourism.com/en/transport/hanoi-da-nang' },
      { label: 'Pholio, Ha Long Bay day trip prices', url: 'https://pholio-website.pages.dev/questions/hanoi/ha-long-bay-day-trip-cost-hanoi/' },
      { label: 'Da Nang Fantasticity, 2026 admission prices', url: 'https://danangfantasticity.com/en/news/plan-your-da-nang-journey-2026-updated-admission-prices-for-attractions-and-tourist-sites' },
      { label: 'vietnamtourism.com, Vinaphone tourist SIM', url: 'https://www.vietnamtourism.com/en/vinaphone-tourist-sim-price-official-complete-2026-guide-for-vietnam-travelers' },
      { label: 'YouTrip, Vietnam ATM fees', url: 'https://www.you.co/sg/blog/vietnam-atm-withdrawal-guide' },
      { label: 'Squaremouth, Vietnam travel insurance', url: 'https://www.squaremouth.com/resources/destinations/vietnam' },
      { label: 'Vietcetera, Vietnam visa guide 2026', url: 'https://vietcetera.com/amp/en/vietnam-visa-immigration-master-guide-2026-comprehensive-legal-practical-framework' }
    ]
  }
};
