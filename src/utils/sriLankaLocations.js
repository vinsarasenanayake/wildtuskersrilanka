/* ── Comprehensive Sri Lanka Locations Database (Districts, Cities, Wildlife Reserves, Tanks & Roaming Areas) ── */
export const SRI_LANKA_WILDLIFE_LOCATIONS = [
  // ── All 25 Districts ──
  { name: 'Colombo', type: 'District / Commercial Capital', region: 'Western Province', lat: 6.9271, lng: 79.8612 },
  { name: 'Gampaha', type: 'District', region: 'Western Province', lat: 7.0840, lng: 79.9943 },
  { name: 'Kalutara', type: 'District', region: 'Western Province', lat: 6.5854, lng: 79.9607 },
  { name: 'Kandy', type: 'District / Hill Capital', region: 'Central Province', lat: 7.2906, lng: 80.6337 },
  { name: 'Matale', type: 'District', region: 'Central Province', lat: 7.4675, lng: 80.6234 },
  { name: 'Nuwara Eliya', type: 'District', region: 'Central Province', lat: 6.9497, lng: 80.7891 },
  { name: 'Galle', type: 'District', region: 'Southern Province', lat: 6.0535, lng: 80.2210 },
  { name: 'Matara', type: 'District', region: 'Southern Province', lat: 5.9549, lng: 80.5550 },
  { name: 'Hambantota', type: 'District', region: 'Southern Province', lat: 6.1429, lng: 81.1212 },
  { name: 'Jaffna', type: 'District', region: 'Northern Province', lat: 9.6615, lng: 80.0255 },
  { name: 'Kilinochchi', type: 'District', region: 'Northern Province', lat: 9.3803, lng: 80.3770 },
  { name: 'Mannar', type: 'District', region: 'Northern Province', lat: 8.9810, lng: 79.9044 },
  { name: 'Vavuniya', type: 'District', region: 'Northern Province', lat: 8.7542, lng: 80.4982 },
  { name: 'Mullaitivu', type: 'District', region: 'Northern Province', lat: 9.2671, lng: 80.8142 },
  { name: 'Batticaloa', type: 'District', region: 'Eastern Province', lat: 7.7310, lng: 81.6747 },
  { name: 'Ampara', type: 'District', region: 'Eastern Province', lat: 7.2975, lng: 81.6747 },
  { name: 'Trincomalee', type: 'District', region: 'Eastern Province', lat: 8.5874, lng: 81.2152 },
  { name: 'Kurunegala', type: 'District', region: 'North Western Province', lat: 7.4863, lng: 80.3623 },
  { name: 'Puttalam', type: 'District', region: 'North Western Province', lat: 8.0408, lng: 79.8394 },
  { name: 'Anuradhapura', type: 'District / Ancient Capital', region: 'North Central Province', lat: 8.3114, lng: 80.4037 },
  { name: 'Polonnaruwa', type: 'District / Ancient Capital', region: 'North Central Province', lat: 7.9403, lng: 81.0188 },
  { name: 'Badulla', type: 'District', region: 'Uva Province', lat: 6.9934, lng: 81.0550 },
  { name: 'Monaragala', type: 'District', region: 'Uva Province', lat: 6.8728, lng: 81.3507 },
  { name: 'Ratnapura', type: 'District / City of Gems', region: 'Sabaragamuwa Province', lat: 6.7056, lng: 80.3847 },
  { name: 'Kegalle', type: 'District', region: 'Sabaragamuwa Province', lat: 7.2513, lng: 80.3464 },

  // ── National Parks & Conservation Reserves ──
  { name: 'Yala National Park', type: 'National Park', region: 'Southern & Uva Provinces', lat: 6.3667, lng: 81.5167 },
  { name: 'Yala National Park - Block 1', type: 'National Park', region: 'Palatupana, Southern Province', lat: 6.2750, lng: 81.4050 },
  { name: 'Yala National Park - Block 2', type: 'National Park', region: 'Menik Ganga Area', lat: 6.3800, lng: 81.4800 },
  { name: 'Yala National Park - Block 3', type: 'National Park', region: 'Kumbukkan Oya Area', lat: 6.4700, lng: 81.4500 },
  { name: 'Yala National Park - Block 4', type: 'National Park', region: 'Northern Section', lat: 6.5500, lng: 81.4000 },
  { name: 'Yala National Park - Block 5', type: 'National Park', region: 'Lunugamwehera Adjacent', lat: 6.4100, lng: 81.2500 },
  { name: 'Wilpattu National Park', type: 'National Park', region: 'North Western & North Central', lat: 8.4500, lng: 80.0167 },
  { name: 'Kumana National Park (Yala East)', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.5167, lng: 81.7000 },
  { name: 'Kumana', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.5167, lng: 81.7000 },
  { name: 'Minneriya National Park', type: 'National Park', region: 'North Central Province', lat: 8.0333, lng: 80.8333 },
  { name: 'Minneriya', type: 'National Park', region: 'North Central Province', lat: 8.0333, lng: 80.8333 },
  { name: 'Kaudulla National Park', type: 'National Park', region: 'North Central Province', lat: 8.1500, lng: 80.9000 },
  { name: 'Kaudulla', type: 'National Park', region: 'North Central Province', lat: 8.1500, lng: 80.9000 },
  { name: 'Udawalawe National Park', type: 'National Park', region: 'Sabaragamuwa & Uva', lat: 6.4742, lng: 80.8986 },
  { name: 'Udawalawe', type: 'National Park', region: 'Sabaragamuwa & Uva', lat: 6.4742, lng: 80.8986 },
  { name: 'Wasgamuwa National Park', type: 'National Park', region: 'Central & North Central', lat: 7.7333, lng: 80.9333 },
  { name: 'Wasgamuwa', type: 'National Park', region: 'Central & North Central', lat: 7.7333, lng: 80.9333 },
  { name: 'Maduru Oya National Park', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.6333, lng: 81.2000 },
  { name: 'Maduru Oya', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.6333, lng: 81.2000 },
  { name: 'Lunugamwehera National Park', type: 'National Park', region: 'Uva & Southern Provinces', lat: 6.3683, lng: 81.1967 },
  { name: 'Lunugamwehera', type: 'National Park', region: 'Uva & Southern Provinces', lat: 6.3683, lng: 81.1967 },
  { name: 'Lunugamvehera', type: 'National Park', region: 'Uva & Southern Provinces', lat: 6.3683, lng: 81.1967 },
  { name: 'Bundala National Park', type: 'National Park', region: 'Hambantota, Southern Province', lat: 6.1833, lng: 81.2167 },
  { name: 'Gal Oya National Park', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.2000, lng: 81.4667 },
  { name: 'Gal Oya', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.2000, lng: 81.4667 },
  { name: 'Lahugala Kitulana National Park', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.8833, lng: 81.7167 },
  { name: 'Somawathiya National Park', type: 'National Park', region: 'Polonnaruwa & Trincomalee', lat: 8.2167, lng: 81.1500 },
  { name: 'Flood Plains National Park', type: 'National Park', region: 'Mahaweli River Basin', lat: 8.0500, lng: 81.1000 },
  { name: 'Angammedilla National Park', type: 'National Park', region: 'Polonnaruwa District', lat: 7.9167, lng: 80.9500 },
  { name: 'Horton Plains National Park', type: 'National Park', region: 'Central Highlands', lat: 6.8000, lng: 80.8000 },
  { name: 'Sinharaja Forest Reserve', type: 'World Heritage Rainforest', region: 'Sabaragamuwa & Southern', lat: 6.4167, lng: 80.4500 },
  { name: 'Knuckles Mountain Range', type: 'Conservation Forest', region: 'Matale & Kandy', lat: 7.4500, lng: 80.7833 },
  { name: 'Peak Wilderness Sanctuary', type: 'Sanctuary', region: 'Central Highlands, Ratnapura', lat: 6.8167, lng: 80.5000 },
  { name: 'Kala Wewa Sanctuary', type: 'Sanctuary', region: 'North Central Province', lat: 7.9700, lng: 80.5300 },
  { name: 'Hurulu Eco Park', type: 'Eco Park / Forest Reserve', region: 'Habarana, North Central', lat: 8.0500, lng: 80.7800 },

  // ── Tanks (Wewa), Lakes & Small Wildlife Reservoirs ──
  { name: 'Pomparippu', type: 'Wildlife Basin / Habitat', region: 'Wilpattu South Border, Puttalam', lat: 8.3167, lng: 79.8500 },
  { name: 'Pomparippu Basin', type: 'River Basin / Wildlife Habitat', region: 'Kala Oya Basin, Puttalam', lat: 8.3167, lng: 79.8500 },
  { name: 'Gangewadiya', type: 'Estuary & Elephant Corridor', region: 'Wilpattu South Border, Puttalam', lat: 8.3183, lng: 79.8333 },
  { name: 'Dutch Bay', type: 'Coastal & Mangrove Habitat', region: 'Kalpitiya Peninsula, Puttalam', lat: 8.3300, lng: 79.7900 },
  { name: 'Karativu', type: 'Coastal Wildlife Fringe', region: 'Puttalam District', lat: 8.2833, lng: 79.8167 },
  { name: 'Kala Oya Basin', type: 'River & Wildlife Corridor', region: 'Wilpattu South, Puttalam', lat: 8.3000, lng: 79.8500 },
  { name: 'Eluwankulama Tank', type: 'Reservoir / Tank', region: 'Wilpattu South Border, Puttalam', lat: 8.2750, lng: 79.8667 },
  { name: 'Eluwankulama Wewa', type: 'Reservoir / Tank', region: 'Wilpattu South Border, Puttalam', lat: 8.2750, lng: 79.8667 },
  { name: 'Eluwankulama', type: 'Wildlife Roaming Area', region: 'Puttalam District', lat: 8.2750, lng: 79.8667 },
  { name: 'Eluwankulam', type: 'Wildlife Roaming Area', region: 'Puttalam District', lat: 8.2750, lng: 79.8667 },
  { name: 'Wanathawilluwa', type: 'Wildlife Roaming Area', region: 'Puttalam District', lat: 8.1667, lng: 79.8833 },
  { name: 'Mahawilachchiya Wewa', type: 'Reservoir / Tank', region: 'Wilpattu East Border, Anuradhapura', lat: 8.4167, lng: 80.2000 },
  { name: 'Mahawilachchiya', type: 'Elephant Roaming Area', region: 'Anuradhapura District', lat: 8.4167, lng: 80.2000 },
  { name: 'Tabbuwa Wewa', type: 'Historic Reservoir', region: 'Puttalam District', lat: 8.0167, lng: 79.9167 },
  { name: 'Tabbuwa', type: 'Elephant Roaming Area', region: 'Puttalam District', lat: 8.0167, lng: 79.9167 },
  { name: 'Inginimitiya Reservoir', type: 'Reservoir', region: 'Puttalam District', lat: 8.0000, lng: 80.1500 },
  { name: 'Karuwalagaswewa', type: 'Elephant Roaming Area', region: 'Puttalam District', lat: 8.0333, lng: 80.0500 },
  { name: 'Palukadawala Wewa', type: 'Historic Reservoir', region: 'Kurunegala District', lat: 8.0167, lng: 80.2500 },
  { name: 'Palukadawala', type: 'Elephant Roaming Area', region: 'Galgamuwa, Kurunegala', lat: 8.0167, lng: 80.2500 },
  { name: 'Makalanegama Wewa', type: 'Reservoir', region: 'Kurunegala District', lat: 7.9833, lng: 80.2667 },
  { name: 'Usgala Siyambalangamuwa Wewa', type: 'Historic Reservoir', region: 'Kurunegala District', lat: 7.9667, lng: 80.3167 },
  { name: 'Resvehera', type: 'Elephant Roaming Area', region: 'Kurunegala / Anuradhapura', lat: 8.0167, lng: 80.4333 },
  { name: 'Meegalewa', type: 'Elephant Roaming Area', region: 'Kurunegala District', lat: 8.0333, lng: 80.3667 },
  { name: 'Kala Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 7.9700, lng: 80.5300 },
  { name: 'Balalu Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 7.9800, lng: 80.5500 },
  { name: 'Minneriya Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 8.0333, lng: 80.8833 },
  { name: 'Kaudulla Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 8.1500, lng: 80.9333 },
  { name: 'Parakrama Samudraya', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 7.9167, lng: 80.9833 },
  { name: 'Giritale Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 7.9833, lng: 80.9167 },
  { name: 'Kantale Wewa', type: 'Historic Reservoir', region: 'Trincomalee District', lat: 8.3667, lng: 80.9833 },
  { name: 'Senanayake Samudraya', type: 'Reservoir', region: 'Gal Oya, Ampara', lat: 7.2000, lng: 81.5167 },
  { name: 'Handapanagala Wewa', type: 'Elephant Habitat Tank', region: 'Wellawaya, Monaragala', lat: 6.6667, lng: 81.1833 },
  { name: 'Handapanagala', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.6667, lng: 81.1833 },
  { name: 'Hambegamuwa Wewa', type: 'Historic Reservoir', region: 'Monaragala District', lat: 6.5500, lng: 81.0500 },
  { name: 'Mau Ara Reservoir', type: 'Reservoir', region: 'Hambantota / Monaragala', lat: 6.4667, lng: 81.0667 },
  { name: 'Weerawila Wewa', type: 'Bird & Elephant Tank', region: 'Hambantota District', lat: 6.2667, lng: 81.2333 },
  { name: 'Debarawewa', type: 'Historic Reservoir', region: 'Tissamaharama', lat: 6.2833, lng: 81.2667 },
  { name: 'Tissa Wewa', type: 'Historic Reservoir', region: 'Tissamaharama / Hambantota', lat: 6.2778, lng: 81.2861 },
  { name: 'Yoda Wewa Tissamaharama', type: 'Historic Reservoir', region: 'Hambantota District', lat: 6.2833, lng: 81.3167 },
  { name: 'Bandagiriya Wewa', type: 'Reservoir', region: 'Hambantota District', lat: 6.2167, lng: 81.1667 },
  { name: 'Udawalawe Reservoir', type: 'Reservoir', region: 'Udawalawe', lat: 6.4500, lng: 80.8500 },
  { name: 'Lunugamwehera Reservoir', type: 'Reservoir', region: 'Lunugamwehera', lat: 6.3683, lng: 81.2167 },
  { name: 'Padaviya Wewa', type: 'Historic Reservoir', region: 'Anuradhapura / Mullaitivu', lat: 8.8167, lng: 80.7500 },
  { name: 'Wahalkada Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.7167, lng: 80.8500 },
  { name: 'Nachchaduwa Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.2667, lng: 80.4833 },
  { name: 'Nuwarawewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.3500, lng: 80.4333 },
  { name: 'Tissawewa Anuradhapura', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.3333, lng: 80.3833 },
  { name: 'Hurulu Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.2167, lng: 80.7000 },
  { name: 'Kandalama Wewa', type: 'Reservoir / Tank', region: 'Dambulla, Matale District', lat: 7.8667, lng: 80.7000 },
  { name: 'Moragahakanda Reservoir', type: 'Reservoir', region: 'Matale District', lat: 7.7000, lng: 80.7667 },
  { name: 'Sorabora Wewa', type: 'Historic Reservoir', region: 'Mahiyanganaya, Badulla', lat: 7.3333, lng: 81.0167 },
  { name: 'Mapakada Wewa', type: 'Reservoir', region: 'Mahiyanganaya, Badulla', lat: 7.3000, lng: 81.0500 },
  { name: 'Ulhitiya Wewa', type: 'Reservoir', region: 'Mahaweli Area, Badulla', lat: 7.4500, lng: 81.0833 },
  { name: 'Rathkinda Wewa', type: 'Reservoir', region: 'Badulla / Ampara', lat: 7.4833, lng: 81.1000 },
  { name: 'Nagadeepa Wewa', type: 'Historic Reservoir', region: 'Badulla District', lat: 7.3667, lng: 81.0833 },
  { name: 'Giant Tank', type: 'Historic Reservoir (Yoda Wewa)', region: 'Mannar District', lat: 8.8667, lng: 80.0333 },
  { name: 'Yoda Wewa Mannar', type: 'Historic Reservoir', region: 'Mannar District', lat: 8.8667, lng: 80.0333 },
  { name: 'Iranamadu Tank', type: 'Historic Reservoir', region: 'Kilinochchi District', lat: 9.3500, lng: 80.4000 },
  { name: 'Muthuiyankaddu Kulam', type: 'Reservoir', region: 'Mullaitivu District', lat: 9.1833, lng: 80.6000 },
  { name: 'Kanagarayan Kulam', type: 'Reservoir', region: 'Vavuniya District', lat: 9.0333, lng: 80.5333 },
  { name: 'Pannalgama Wewa', type: 'Reservoir', region: 'Ampara District', lat: 7.1167, lng: 81.6500 },
  { name: 'Ambalan Oya Reservoir', type: 'Reservoir', region: 'Ampara District', lat: 7.1500, lng: 81.6000 },
  { name: 'Rambakan Oya Reservoir', type: 'Reservoir', region: 'Maha Oya, Ampara', lat: 7.5500, lng: 81.4000 },
  { name: 'Allai Tank', type: 'Historic Reservoir', region: 'Trincomalee District', lat: 8.4333, lng: 81.3000 },

  // ── Primary Tusker Roaming Areas & Wildlife Junctions ──
  { name: 'Athimale', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 7.0858, lng: 81.4428 },
  { name: 'Athimale Wewa', type: 'Reservoir', region: 'Monaragala District', lat: 7.0858, lng: 81.4428 },
  { name: 'Buttala', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.7583, lng: 81.2483 },
  { name: 'Pelwatta', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.7800, lng: 81.1800 },
  { name: 'Siyambalanduwa', type: 'Elephant Roaming Area', region: 'Ampara / Monaragala', lat: 6.9056, lng: 81.5542 },
  { name: 'Panama', type: 'Elephant Roaming Area', region: 'Ampara, Eastern Province', lat: 6.7558, lng: 81.8058 },
  { name: 'Okanda', type: 'Elephant Roaming Area', region: 'Kumana Border, Eastern Province', lat: 6.6214, lng: 81.7828 },
  { name: 'Kataragama', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.4133, lng: 81.3325 },
  { name: 'Wellawaya', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.7389, lng: 81.1017 },
  { name: 'Thanamalwila', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.4428, lng: 81.1328 },
  { name: 'Galgamuwa', type: 'Elephant Roaming Area', region: 'Kurunegala District', lat: 7.9942, lng: 80.2792 },
  { name: 'Habarana', type: 'Elephant Corridor', region: 'Anuradhapura District', lat: 8.0333, lng: 80.7500 },
  { name: 'Giritale', type: 'Elephant Roaming Area', region: 'Polonnaruwa District', lat: 7.9833, lng: 80.9167 },
  { name: 'Kantale', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.3667, lng: 80.9833 },
  { name: 'Kekirawa', type: 'Elephant Roaming Area', region: 'Anuradhapura District', lat: 8.0500, lng: 80.5833 },
  { name: 'Horowpathana', type: 'Elephant Holding Ground', region: 'Anuradhapura District', lat: 8.5833, lng: 80.8667 },
  { name: 'Kahatagasdigiliya', type: 'Elephant Roaming Area', region: 'Anuradhapura District', lat: 8.4333, lng: 80.6833 },
  { name: 'Nochchiyagama', type: 'Elephant Roaming Area', region: 'Anuradhapura District', lat: 8.2833, lng: 80.2167 },
  { name: 'Anamaduwa', type: 'Elephant Roaming Area', region: 'Puttalam District', lat: 7.9000, lng: 80.0167 },
  { name: 'Mahiyanganaya', type: 'Elephant Corridor', region: 'Badulla District', lat: 7.3167, lng: 81.0000 },
  { name: 'Dehiattakandiya', type: 'Elephant Roaming Area', region: 'Ampara District', lat: 7.6833, lng: 81.0833 },
  { name: 'Suriyawewa', type: 'Elephant Roaming Area', region: 'Hambantota District', lat: 6.3167, lng: 81.0000 },
  { name: 'Embilipitiya', type: 'Elephant Roaming Area', region: 'Ratnapura District', lat: 6.3333, lng: 80.8500 },
  { name: 'Kotiyagala', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.9000, lng: 81.4500 },
  { name: 'Dambagalla', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 7.0000, lng: 81.4000 },
  { name: 'Bibile', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 7.1667, lng: 81.2333 },
  { name: 'Inginiyagala', type: 'Elephant Roaming Area', region: 'Ampara District', lat: 7.2167, lng: 81.5333 },
  { name: 'Lahugala', type: 'Elephant Habitat', region: 'Ampara District', lat: 6.8833, lng: 81.7167 },
  { name: 'Seruwila', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.3667, lng: 81.3167 },
  { name: 'Morawewa', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.6333, lng: 81.0833 },
  { name: 'Gomarankadawala', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.6667, lng: 81.0333 },
  { name: 'Bakamoona', type: 'Elephant Roaming Area', region: 'Polonnaruwa District', lat: 7.7833, lng: 80.8833 },
  { name: 'Elahera', type: 'Elephant Roaming Area', region: 'Polonnaruwa District', lat: 7.7500, lng: 80.8333 },
  { name: 'Madhu', type: 'Sanctuary & Forest Area', region: 'Mannar District', lat: 8.8500, lng: 80.2000 },

  // ── Key Cities, Towns & Landmarks Across Sri Lanka ──
  { name: 'Negombo', type: 'Coastal City', region: 'Gampaha District', lat: 7.2083, lng: 79.8358 },
  { name: 'Dambulla', type: 'Major Town / Junction', region: 'Matale District', lat: 7.8742, lng: 80.6511 },
  { name: 'Sigiriya', type: 'Heritage Landmark', region: 'Matale District', lat: 7.9570, lng: 80.7603 },
  { name: 'Ella', type: 'Hill Country Destination', region: 'Badulla District', lat: 6.8667, lng: 81.0466 },
  { name: 'Bandarawela', type: 'Town', region: 'Badulla District', lat: 6.8258, lng: 80.9983 },
  { name: 'Haputale', type: 'Town', region: 'Badulla District', lat: 6.7681, lng: 80.9500 },
  { name: 'Tissamaharama', type: 'Historic Town', region: 'Hambantota District', lat: 6.2778, lng: 81.2861 },
  { name: 'Kirinda', type: 'Coastal Landmark', region: 'Hambantota District', lat: 6.2133, lng: 81.3347 },
  { name: 'Arugam Bay', type: 'Coastal Destination', region: 'Ampara District', lat: 6.8417, lng: 81.8333 },
  { name: 'Pottuvil', type: 'Town', region: 'Ampara District', lat: 6.8722, lng: 81.8286 },
  { name: 'Kalmunai', type: 'City', region: 'Ampara District', lat: 7.4167, lng: 81.8333 },
  { name: 'Sammanthurai', type: 'Town', region: 'Ampara District', lat: 7.3667, lng: 81.8000 },
  { name: 'Akkaraipattu', type: 'Town', region: 'Ampara District', lat: 7.2167, lng: 81.8500 },
  { name: 'Maha Oya', type: 'Town', region: 'Ampara District', lat: 7.5333, lng: 81.3500 },
  { name: 'Kalkudah', type: 'Coastal Destination', region: 'Batticaloa District', lat: 7.9167, lng: 81.5667 },
  { name: 'Pasikudah', type: 'Coastal Destination', region: 'Batticaloa District', lat: 7.9250, lng: 81.5650 },
  { name: 'Valaichchenai', type: 'Town', region: 'Batticaloa District', lat: 7.9167, lng: 81.5333 },
  { name: 'Nilaveli', type: 'Coastal Destination', region: 'Trincomalee District', lat: 8.6833, lng: 81.1833 },
  { name: 'Kinniya', type: 'Town', region: 'Trincomalee District', lat: 8.4833, lng: 81.1833 },
  { name: 'Mutur', type: 'Town', region: 'Trincomalee District', lat: 8.4500, lng: 81.2667 },
  { name: 'Mihintale', type: 'Sacred Landmark', region: 'Anuradhapura District', lat: 8.3500, lng: 80.5000 },
  { name: 'Medawachchiya', type: 'Town / Junction', region: 'Anuradhapura District', lat: 8.5333, lng: 80.4833 },
  { name: 'Thambuttegama', type: 'Town', region: 'Anuradhapura District', lat: 8.1500, lng: 80.3000 },
  { name: 'Eppawala', type: 'Town', region: 'Anuradhapura District', lat: 8.1500, lng: 80.4167 },
  { name: 'Hingurakgoda', type: 'Town', region: 'Polonnaruwa District', lat: 8.0500, lng: 80.9833 },
  { name: 'Medirigiriya', type: 'Historic Town', region: 'Polonnaruwa District', lat: 8.1500, lng: 81.0167 },
  { name: 'Kuliyapitiya', type: 'Town', region: 'Kurunegala District', lat: 7.4689, lng: 80.0400 },
  { name: 'Nikaweratiya', type: 'Town', region: 'Kurunegala District', lat: 7.7500, lng: 80.1167 },
  { name: 'Wariyapola', type: 'Town', region: 'Kurunegala District', lat: 7.6333, lng: 80.2667 },
  { name: 'Maho', type: 'Town / Railway Junction', region: 'Kurunegala District', lat: 7.8167, lng: 80.2667 },
  { name: 'Chilaw', type: 'Coastal Town', region: 'Puttalam District', lat: 7.5758, lng: 79.7953 },
  { name: 'Wennappuwa', type: 'Town', region: 'Puttalam District', lat: 7.3500, lng: 79.8500 },
  { name: 'Marawila', type: 'Town', region: 'Puttalam District', lat: 7.4167, lng: 79.8167 },
  { name: 'Kalpitiya', type: 'Peninsula / Marine Area', region: 'Puttalam District', lat: 8.2333, lng: 79.7667 },
  { name: 'Tangalle', type: 'Coastal Town', region: 'Hambantota District', lat: 6.0242, lng: 80.7942 },
  { name: 'Ambalantota', type: 'Town', region: 'Hambantota District', lat: 6.1242, lng: 81.0250 },
  { name: 'Beliatta', type: 'Town', region: 'Hambantota District', lat: 6.0500, lng: 80.7333 },
  { name: 'Mirissa', type: 'Coastal Destination', region: 'Matara District', lat: 5.9483, lng: 80.4550 },
  { name: 'Weligama', type: 'Coastal Town', region: 'Matara District', lat: 5.9722, lng: 80.4283 },
  { name: 'Hikkaduwa', type: 'Coastal Destination', region: 'Galle District', lat: 6.1408, lng: 80.1008 },
  { name: 'Bentota', type: 'Coastal Destination', region: 'Galle District', lat: 6.4258, lng: 80.0000 },
  { name: 'Panadura', type: 'Coastal City', region: 'Kalutara District', lat: 6.7131, lng: 79.9075 },
  { name: 'Moratuwa', type: 'City', region: 'Colombo District', lat: 6.7730, lng: 79.8816 },
  { name: 'Dehiwala', type: 'City', region: 'Colombo District', lat: 6.8500, lng: 79.8667 },
  { name: 'Nugegoda', type: 'Town', region: 'Colombo District', lat: 6.8700, lng: 79.8900 },
  { name: 'Maharagama', type: 'Town', region: 'Colombo District', lat: 6.8483, lng: 79.9267 },
  { name: 'Kotte', type: 'Administrative Capital', region: 'Western Province', lat: 6.8900, lng: 79.9100 },
  { name: 'Homagama', type: 'Town', region: 'Colombo District', lat: 6.8417, lng: 80.0028 },
  { name: 'Avissawella', type: 'Town', region: 'Colombo District', lat: 6.9536, lng: 80.2072 },
  { name: 'Horana', type: 'Town', region: 'Kalutara District', lat: 6.7153, lng: 80.0628 },
  { name: 'Balangoda', type: 'Hill Town', region: 'Ratnapura District', lat: 6.6500, lng: 80.7000 },
  { name: 'Pelmadulla', type: 'Town', region: 'Ratnapura District', lat: 6.6167, lng: 80.5500 },
  { name: 'Kuruwita', type: 'Town', region: 'Ratnapura District', lat: 6.7833, lng: 80.3667 },
  { name: 'Mawanella', type: 'Town', region: 'Kegalle District', lat: 7.2500, lng: 80.4500 },
  { name: 'Warakapola', type: 'Town', region: 'Kegalle District', lat: 7.2333, lng: 80.2000 },
  { name: 'Kitulgala', type: 'River / Eco Tourism', region: 'Kegalle District', lat: 6.9889, lng: 80.4167 },
  { name: 'Hatton', type: 'Hill Town', region: 'Nuwara Eliya District', lat: 6.8917, lng: 80.5956 },
  { name: 'Talawakelle', type: 'Hill Town', region: 'Nuwara Eliya District', lat: 6.9333, lng: 80.6667 },
  { name: 'Peradeniya', type: 'Botanical / University Town', region: 'Kandy District', lat: 7.2667, lng: 80.5975 },
  { name: 'Gampola', type: 'Town', region: 'Kandy District', lat: 7.1644, lng: 80.5767 },
  { name: 'Katugastota', type: 'Town', region: 'Kandy District', lat: 7.3200, lng: 80.6150 },
  { name: 'Digana', type: 'Town', region: 'Kandy District', lat: 7.3000, lng: 80.7333 },
  { name: 'Point Pedro', type: 'Northernmost Point', region: 'Jaffna District', lat: 9.8167, lng: 80.2333 },
  { name: 'Chavakachcheri', type: 'Town', region: 'Jaffna District', lat: 9.6500, lng: 80.1500 },
  { name: 'Pesalai', type: 'Town', region: 'Mannar District', lat: 9.0833, lng: 79.8167 },
  { name: 'Talaimannar', type: 'Westernmost Point', region: 'Mannar District', lat: 9.1000, lng: 79.7333 },
  { name: 'Mankulam', type: 'Town / Junction', region: 'Mullaitivu District', lat: 9.1333, lng: 80.4500 },
  { name: 'Puthukkudiyiruppu', type: 'Town', region: 'Mullaitivu District', lat: 9.3167, lng: 80.7000 },
  { name: 'Kotiyagala', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 6.9000, lng: 81.4500 },
  { name: 'Dambagalla', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 7.0000, lng: 81.4000 },
  { name: 'Bibile', type: 'Elephant Roaming Area', region: 'Monaragala District', lat: 7.1667, lng: 81.2333 },
  { name: 'Inginiyagala', type: 'Elephant Roaming Area', region: 'Ampara District', lat: 7.2167, lng: 81.5333 },
  { name: 'Lahugala', type: 'Elephant Habitat', region: 'Ampara District', lat: 6.8833, lng: 81.7167 },
  { name: 'Seruwila', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.3667, lng: 81.3167 },
  { name: 'Morawewa', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.6333, lng: 81.0833 },
  { name: 'Gomarankadawala', type: 'Elephant Roaming Area', region: 'Trincomalee District', lat: 8.6667, lng: 81.0333 },
  { name: 'Bakamoona', type: 'Elephant Roaming Area', region: 'Polonnaruwa District', lat: 7.7833, lng: 80.8833 },
  { name: 'Elahera', type: 'Elephant Roaming Area', region: 'Polonnaruwa District', lat: 7.7500, lng: 80.8333 },
  { name: 'Madhu', type: 'Sanctuary & Forest Area', region: 'Mannar District', lat: 8.8500, lng: 80.2000 },

  // ── Key Cities, Towns & Landmarks Across Sri Lanka ──
  { name: 'Negombo', type: 'Coastal City', region: 'Gampaha District', lat: 7.2083, lng: 79.8358 },
  { name: 'Dambulla', type: 'Major Town / Junction', region: 'Matale District', lat: 7.8742, lng: 80.6511 },
  { name: 'Sigiriya', type: 'Heritage Landmark', region: 'Matale District', lat: 7.9570, lng: 80.7603 },
  { name: 'Ella', type: 'Hill Country Destination', region: 'Badulla District', lat: 6.8667, lng: 81.0466 },
  { name: 'Bandarawela', type: 'Town', region: 'Badulla District', lat: 6.8258, lng: 80.9983 },
  { name: 'Haputale', type: 'Town', region: 'Badulla District', lat: 6.7681, lng: 80.9500 },
  { name: 'Tissamaharama', type: 'Historic Town', region: 'Hambantota District', lat: 6.2778, lng: 81.2861 },
  { name: 'Kirinda', type: 'Coastal Landmark', region: 'Hambantota District', lat: 6.2133, lng: 81.3347 },
  { name: 'Arugam Bay', type: 'Coastal Destination', region: 'Ampara District', lat: 6.8417, lng: 81.8333 },
  { name: 'Pottuvil', type: 'Town', region: 'Ampara District', lat: 6.8722, lng: 81.8286 },
  { name: 'Kalmunai', type: 'City', region: 'Ampara District', lat: 7.4167, lng: 81.8333 },
  { name: 'Sammanthurai', type: 'Town', region: 'Ampara District', lat: 7.3667, lng: 81.8000 },
  { name: 'Akkaraipattu', type: 'Town', region: 'Ampara District', lat: 7.2167, lng: 81.8500 },
  { name: 'Maha Oya', type: 'Town', region: 'Ampara District', lat: 7.5333, lng: 81.3500 },
  { name: 'Kalkudah', type: 'Coastal Destination', region: 'Batticaloa District', lat: 7.9167, lng: 81.5667 },
  { name: 'Pasikudah', type: 'Coastal Destination', region: 'Batticaloa District', lat: 7.9250, lng: 81.5650 },
  { name: 'Valaichchenai', type: 'Town', region: 'Batticaloa District', lat: 7.9167, lng: 81.5333 },
  { name: 'Nilaveli', type: 'Coastal Destination', region: 'Trincomalee District', lat: 8.6833, lng: 81.1833 },
  { name: 'Kinniya', type: 'Town', region: 'Trincomalee District', lat: 8.4833, lng: 81.1833 },
  { name: 'Mutur', type: 'Town', region: 'Trincomalee District', lat: 8.4500, lng: 81.2667 },
  { name: 'Mihintale', type: 'Sacred Landmark', region: 'Anuradhapura District', lat: 8.3500, lng: 80.5000 },
  { name: 'Medawachchiya', type: 'Town / Junction', region: 'Anuradhapura District', lat: 8.5333, lng: 80.4833 },
  { name: 'Thambuttegama', type: 'Town', region: 'Anuradhapura District', lat: 8.1500, lng: 80.3000 },
  { name: 'Eppawala', type: 'Town', region: 'Anuradhapura District', lat: 8.1500, lng: 80.4167 },
  { name: 'Hingurakgoda', type: 'Town', region: 'Polonnaruwa District', lat: 8.0500, lng: 80.9833 },
  { name: 'Medirigiriya', type: 'Historic Town', region: 'Polonnaruwa District', lat: 8.1500, lng: 81.0167 },
  { name: 'Kuliyapitiya', type: 'Town', region: 'Kurunegala District', lat: 7.4689, lng: 80.0400 },
  { name: 'Nikaweratiya', type: 'Town', region: 'Kurunegala District', lat: 7.7500, lng: 80.1167 },
  { name: 'Wariyapola', type: 'Town', region: 'Kurunegala District', lat: 7.6333, lng: 80.2667 },
  { name: 'Maho', type: 'Town / Railway Junction', region: 'Kurunegala District', lat: 7.8167, lng: 80.2667 },
  { name: 'Chilaw', type: 'Coastal Town', region: 'Puttalam District', lat: 7.5758, lng: 79.7953 },
  { name: 'Wennappuwa', type: 'Town', region: 'Puttalam District', lat: 7.3500, lng: 79.8500 },
  { name: 'Marawila', type: 'Town', region: 'Puttalam District', lat: 7.4167, lng: 79.8167 },
  { name: 'Kalpitiya', type: 'Peninsula / Marine Area', region: 'Puttalam District', lat: 8.2333, lng: 79.7667 },
  { name: 'Tangalle', type: 'Coastal Town', region: 'Hambantota District', lat: 6.0242, lng: 80.7942 },
  { name: 'Ambalantota', type: 'Town', region: 'Hambantota District', lat: 6.1242, lng: 81.0250 },
  { name: 'Beliatta', type: 'Town', region: 'Hambantota District', lat: 6.0500, lng: 80.7333 },
  { name: 'Mirissa', type: 'Coastal Destination', region: 'Matara District', lat: 5.9483, lng: 80.4550 },
  { name: 'Weligama', type: 'Coastal Town', region: 'Matara District', lat: 5.9722, lng: 80.4283 },
  { name: 'Hikkaduwa', type: 'Coastal Destination', region: 'Galle District', lat: 6.1408, lng: 80.1008 },
  { name: 'Bentota', type: 'Coastal Destination', region: 'Galle District', lat: 6.4258, lng: 80.0000 },
  { name: 'Panadura', type: 'Coastal City', region: 'Kalutara District', lat: 6.7131, lng: 79.9075 },
  { name: 'Moratuwa', type: 'City', region: 'Colombo District', lat: 6.7730, lng: 79.8816 },
  { name: 'Dehiwala', type: 'City', region: 'Colombo District', lat: 6.8500, lng: 79.8667 },
  { name: 'Nugegoda', type: 'Town', region: 'Colombo District', lat: 6.8700, lng: 79.8900 },
  { name: 'Maharagama', type: 'Town', region: 'Colombo District', lat: 6.8483, lng: 79.9267 },
  { name: 'Kotte', type: 'Administrative Capital', region: 'Western Province', lat: 6.8900, lng: 79.9100 },
  { name: 'Homagama', type: 'Town', region: 'Colombo District', lat: 6.8417, lng: 80.0028 },
  { name: 'Avissawella', type: 'Town', region: 'Colombo District', lat: 6.9536, lng: 80.2072 },
  { name: 'Horana', type: 'Town', region: 'Kalutara District', lat: 6.7153, lng: 80.0628 },
  { name: 'Balangoda', type: 'Hill Town', region: 'Ratnapura District', lat: 6.6500, lng: 80.7000 },
  { name: 'Pelmadulla', type: 'Town', region: 'Ratnapura District', lat: 6.6167, lng: 80.5500 },
  { name: 'Kuruwita', type: 'Town', region: 'Ratnapura District', lat: 6.7833, lng: 80.3667 },
  { name: 'Mawanella', type: 'Town', region: 'Kegalle District', lat: 7.2500, lng: 80.4500 },
  { name: 'Warakapola', type: 'Town', region: 'Kegalle District', lat: 7.2333, lng: 80.2000 },
  { name: 'Kitulgala', type: 'River / Eco Tourism', region: 'Kegalle District', lat: 6.9889, lng: 80.4167 },
  { name: 'Hatton', type: 'Hill Town', region: 'Nuwara Eliya District', lat: 6.8917, lng: 80.5956 },
  { name: 'Talawakelle', type: 'Hill Town', region: 'Nuwara Eliya District', lat: 6.9333, lng: 80.6667 },
  { name: 'Peradeniya', type: 'Botanical / University Town', region: 'Kandy District', lat: 7.2667, lng: 80.5975 },
  { name: 'Gampola', type: 'Town', region: 'Kandy District', lat: 7.1644, lng: 80.5767 },
  { name: 'Katugastota', type: 'Town', region: 'Kandy District', lat: 7.3200, lng: 80.6150 },
  { name: 'Digana', type: 'Town', region: 'Kandy District', lat: 7.3000, lng: 80.7333 },
  { name: 'Point Pedro', type: 'Northernmost Point', region: 'Jaffna District', lat: 9.8167, lng: 80.2333 },
  { name: 'Chavakachcheri', type: 'Town', region: 'Jaffna District', lat: 9.6500, lng: 80.1500 },
  { name: 'Pesalai', type: 'Town', region: 'Mannar District', lat: 9.0833, lng: 79.8167 },
  { name: 'Talaimannar', type: 'Westernmost Point', region: 'Mannar District', lat: 9.1000, lng: 79.7333 },
  { name: 'Mankulam', type: 'Town / Junction', region: 'Mullaitivu District', lat: 9.1333, lng: 80.4500 },
  { name: 'Puthukkudiyiruppu', type: 'Town', region: 'Mullaitivu District', lat: 9.3167, lng: 80.7000 },
];

/** Clean string for matching by removing generic suffixes like Tank, Wewa, Reservoir, etc. */
function normalizePlaceName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b(tank|wewa|reservoir|kulam|samudraya|lake|sanctuary|national park|park|reserve|forest|junction|area)\b/gi, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Resolves latitude and longitude coordinates for a Sri Lanka place name or area synchronously.
 * Matches exact name, stemmed/normalized place names, and cached geocodes.
 *
 * @param {string} locationName - The location string (e.g. "Eluwankulama Tank", "Athimale", "Yala Block 1")
 * @returns {{ lat: number, lng: number, name?: string } | null}
 */
export function getLocationCoordinates(locationName) {
  if (!locationName || typeof locationName !== 'string') return null;

  // Handle explicit "lat, lng" input (e.g. "6.7583, 81.2483")
  const coordMatch = locationName.match(/^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  // If multiple locations joined by slash, pick the first one to resolve primary coordinate
  const primaryName = locationName.split(/\s*[/]\s*/)[0].trim();
  if (!primaryName) return null;
  const primaryLower = primaryName.toLowerCase();
  const normalizedPrimary = normalizePlaceName(primaryName);

  // 1. Exact match
  const exact = SRI_LANKA_WILDLIFE_LOCATIONS.find(
    (l) => l.name.toLowerCase() === primaryLower
  );
  if (exact && typeof exact.lat === 'number') {
    return { lat: exact.lat, lng: exact.lng, name: exact.name };
  }

  // 2. Normalized stem match (e.g. "Eluwankulama Tank" -> "eluwankulama")
  if (normalizedPrimary.length >= 3) {
    const stemMatch = SRI_LANKA_WILDLIFE_LOCATIONS.find((l) => {
      const normLoc = normalizePlaceName(l.name);
      return (
        normLoc === normalizedPrimary ||
        (normLoc.length >= 4 && normalizedPrimary.includes(normLoc)) ||
        (normalizedPrimary.length >= 4 && normLoc.includes(normalizedPrimary))
      );
    });
    if (stemMatch && typeof stemMatch.lat === 'number') {
      return { lat: stemMatch.lat, lng: stemMatch.lng, name: stemMatch.name };
    }
  }

  // 3. Substring includes match
  const partial = SRI_LANKA_WILDLIFE_LOCATIONS.find(
    (l) => primaryLower.includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(primaryLower)
  );
  if (partial && typeof partial.lat === 'number') {
    return { lat: partial.lat, lng: partial.lng, name: partial.name };
  }

  // 4. Check client-side cached geocode if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cacheKey = `wts_geocache_${primaryLower}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }

  return null;
}

/**
 * Caches coordinates for a named location in localStorage so it resolves synchronously.
 *
 * @param {string} locationName
 * @param {{ lat: number, lng: number, name?: string }} coords
 */
export function cacheLocationCoordinates(locationName, coords) {
  if (!locationName || !coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return;
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const clean = locationName.trim();
    const primary = clean.split(/\s*[/]\s*/)[0].trim().toLowerCase();
    const payload = JSON.stringify({
      lat: coords.lat,
      lng: coords.lng,
      name: coords.name || clean,
    });
    localStorage.setItem(`wts_geocache_${primary}`, payload);
    localStorage.setItem(`wts_geocache_${clean.toLowerCase()}`, payload);
  } catch {
    /* ignore storage errors */
  }
}

/**
 * Reverse-geocodes a latitude and longitude into a human-readable Sri Lanka location name.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<{ name: string, fullAddress?: string, region?: string }>}
 */
export async function reverseGeocodeCoordinatesAsync(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { name: 'Unknown Location' };
  }

  const fallbackCoordName = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

  // 1. Try Nominatim reverse geocoder
  if (typeof fetch !== 'undefined') {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Find the most specific place name (tank, village, hamlet, suburb, town, city, road, natural feature)
        const primary =
          addr.leisure ||
          addr.natural ||
          addr.water ||
          addr.village ||
          addr.hamlet ||
          addr.suburb ||
          addr.town ||
          addr.city ||
          addr.road ||
          data.name ||
          (data.display_name ? data.display_name.split(',')[0].trim() : null);

        const district = addr.state_district || addr.county || addr.district || addr.state || 'Sri Lanka';

        if (primary) {
          const formatted = district && !primary.toLowerCase().includes(district.toLowerCase())
            ? `${primary}, ${district}`
            : primary;

          // Auto-cache the resolved coordinates
          cacheLocationCoordinates(primary, { lat, lng });
          cacheLocationCoordinates(formatted, { lat, lng });

          return {
            name: formatted,
            fullAddress: data.display_name || formatted,
            region: district,
          };
        }
      }
    } catch (err) {
      console.warn('Reverse geocode failed:', err);
    }

    // 2. Fallback to Photon reverse
    try {
      const photonRes = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (photonRes.ok) {
        const pData = await photonRes.json();
        const feat = pData.features && pData.features[0];
        if (feat && feat.properties) {
          const props = feat.properties;
          const name = props.name || props.street || props.city || props.district;
          const district = props.district || props.state || 'Sri Lanka';
          if (name) {
            const formatted = district ? `${name}, ${district}` : name;
            cacheLocationCoordinates(name, { lat, lng });
            cacheLocationCoordinates(formatted, { lat, lng });
            return {
              name: formatted,
              region: district,
            };
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Fallback to coordinates
  return { name: fallbackCoordName };
}

/**
 * Asynchronously resolves latitude and longitude for ANY location in Sri Lanka.
 * Checks local database first, then client cache, and falls back to live Nominatim & Photon geocoders.
 *
 * @param {string} locationName
 * @returns {Promise<{ lat: number, lng: number, name?: string } | null>}
 */
export async function resolveLocationCoordinatesAsync(locationName) {
  if (!locationName || typeof locationName !== 'string') return null;

  // Check synchronous database first
  const syncCoords = getLocationCoordinates(locationName);
  if (syncCoords) return syncCoords;

  const primaryName = locationName.split(/\s*[/]\s*/)[0].trim();
  if (!primaryName) return null;
  const primaryLower = primaryName.toLowerCase();
  const cacheKey = `wts_geocache_${primaryLower}`;

  // Check localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          return parsed;
        }
      }
    } catch {
      /* ignore */
    }
  }

  // Live Geocode fallback via OpenStreetMap Nominatim
  if (typeof fetch !== 'undefined') {
    try {
      const query = `${primaryName}, Sri Lanka`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=lk&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            const result = { lat, lng, name: primaryName };
            cacheLocationCoordinates(primaryName, result);
            return result;
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim geocoding lookup failed for:', primaryName, err);
    }

    // Secondary fallback: Photon by Komoot (no rate limits, based on OSM)
    try {
      const photonQuery = `${primaryName}, Sri Lanka`;
      const pRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(photonQuery)}&lat=7.8731&lon=80.7718&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (pRes.ok) {
        const pData = await pRes.json();
        const feature = pData.features && pData.features[0];
        if (feature && feature.geometry && Array.isArray(feature.geometry.coordinates)) {
          const [lon, lat] = feature.geometry.coordinates;
          if (typeof lat === 'number' && typeof lon === 'number') {
            const result = { lat, lng: lon, name: primaryName };
            cacheLocationCoordinates(primaryName, result);
            return result;
          }
        }
      }
    } catch (pErr) {
      console.warn('Photon geocoding lookup failed for:', primaryName, pErr);
    }
  }

  // 3. Word token fallback: check if any significant word matches a known Sri Lanka location
  const tokens = primaryName.split(/\s+/).filter((t) => t.length >= 4);
  for (const token of tokens) {
    const matched = getLocationCoordinates(token);
    if (matched) {
      cacheLocationCoordinates(primaryName, matched);
      return matched;
    }
  }

  return null;
}
