/**
 * @file sriLankaLocations.js
 * @description Comprehensive geospatial catalog of Sri Lankan districts, protected wildlife reserves,
 * national parks, ancient tanks, corridors, and town centres with offline and online geocoding.
 */

import { isGoogleMapsEnabled, loadGoogleMaps } from './mapEngine.js';
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
  { name: 'Hambantota', type: 'District', region: 'Southern Province', lat: 6.1259, lng: 81.1248 },
  { name: 'Jaffna', type: 'District', region: 'Northern Province', lat: 9.6615, lng: 80.0255 },
  { name: 'Kilinochchi', type: 'District', region: 'Northern Province', lat: 9.3803, lng: 80.3770 },
  { name: 'Mannar', type: 'District', region: 'Northern Province', lat: 8.9810, lng: 79.9044 },
  { name: 'Vavuniya', type: 'District', region: 'Northern Province', lat: 8.7542, lng: 80.4982 },
  { name: 'Mullaitivu', type: 'District', region: 'Northern Province', lat: 9.2671, lng: 80.8142 },
  { name: 'Batticaloa', type: 'District', region: 'Eastern Province', lat: 7.7249, lng: 81.6967 },
  { name: 'Ampara', type: 'District', region: 'Eastern Province', lat: 7.2912, lng: 81.6725 },
  { name: 'Trincomalee', type: 'District', region: 'Eastern Province', lat: 8.5874, lng: 81.2152 },
  { name: 'Kurunegala', type: 'District', region: 'North Western Province', lat: 7.4863, lng: 80.3623 },
  { name: 'Puttalam', type: 'District', region: 'North Western Province', lat: 8.0303, lng: 79.8315 },
  { name: 'Anuradhapura', type: 'District / Ancient Capital', region: 'North Central Province', lat: 8.3114, lng: 80.4037 },
  { name: 'Polonnaruwa', type: 'District / Ancient Capital', region: 'North Central Province', lat: 7.9147, lng: 81.0001 },
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
  { name: 'Yala National Park - Block 5', type: 'National Park', region: 'Lunugamvehera Adjacent', lat: 6.4100, lng: 81.2500 },
  { name: 'Yala National Park - Block 6', type: 'National Park', region: 'Lunugamvehera Corridor', lat: 6.4400, lng: 81.2200 },
  { name: 'Yala Block 1', type: 'National Park', region: 'Palatupana, Southern Province', lat: 6.3450, lng: 81.4400 },
  { name: 'Yala Block 2', type: 'National Park', region: 'Menik Ganga Area', lat: 6.4200, lng: 81.6000 },
  { name: 'Yala Block 3', type: 'National Park', region: 'Kumbukkan Oya Area', lat: 6.4700, lng: 81.4500 },
  { name: 'Yala Block 4', type: 'National Park', region: 'Northern Section', lat: 6.6300, lng: 81.3800 },
  { name: 'Yala Block 5', type: 'National Park', region: 'Lunugamvehera Adjacent', lat: 6.5200, lng: 81.2850 },
  { name: 'Yala Block 6', type: 'National Park', region: 'Lunugamvehera Corridor', lat: 6.4400, lng: 81.2200 },
  { name: 'Yala Block 3,5', type: 'National Park Corridor', region: 'Kumbukkan Oya / Northern Blocks', lat: 6.4700, lng: 81.4500 },
  { name: 'Yala Block 3, 5', type: 'National Park Corridor', region: 'Kumbukkan Oya / Northern Blocks', lat: 6.4700, lng: 81.4500 },
  { name: 'Yala Block 3,6', type: 'National Park Corridor', region: 'Northern Blocks', lat: 6.4600, lng: 81.3800 },
  { name: 'Angammedilla National Park', type: 'National Park', region: 'Polonnaruwa District', lat: 7.9167, lng: 80.9500 },
  { name: 'Angammedilla', type: 'National Park', region: 'Polonnaruwa District', lat: 7.9254, lng: 80.9208 },
  { name: 'Buddhangala Sanctuary', type: 'Sanctuary', region: 'Ampara District', lat: 7.3333, lng: 81.6500 },
  { name: 'Buddhangala', type: 'Sanctuary', region: 'Ampara District', lat: 7.3290, lng: 81.7021 },
  { name: 'Wilpattu National Park', type: 'National Park', region: 'North Western & North Central', lat: 8.4500, lng: 80.0167 },
  { name: 'Kumana National Park (Yala East)', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.5400, lng: 81.6000 },
  { name: 'Kumana', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.5362, lng: 81.6857 },
  { name: 'Kumana Villu', type: 'Lagoon / Wetland', region: 'Ampara, Eastern Province', lat: 6.5250, lng: 81.7150 },
  { name: 'Yala East', type: 'National Park', region: 'Kumana Border, Eastern Province', lat: 6.5100, lng: 81.5700 },
  { name: 'Minneriya National Park', type: 'National Park', region: 'North Central Province', lat: 8.0333, lng: 80.8333 },
  { name: 'Minneriya', type: 'National Park', region: 'North Central Province', lat: 8.0387, lng: 80.9064 },
  { name: 'Kaudulla National Park', type: 'National Park', region: 'North Central Province', lat: 8.1500, lng: 80.9000 },
  { name: 'Kaudulla', type: 'National Park', region: 'North Central Province', lat: 8.1107, lng: 80.8859 },
  { name: 'Udawalawe National Park', type: 'National Park', region: 'Sabaragamuwa & Uva', lat: 6.4742, lng: 80.8986 },
  { name: 'Udawalawe', type: 'National Park', region: 'Sabaragamuwa & Uva', lat: 6.4746, lng: 80.8763 },
  { name: 'Wasgamuwa National Park', type: 'National Park', region: 'Central & North Central', lat: 7.7333, lng: 80.9333 },
  { name: 'Wasgamuwa', type: 'National Park', region: 'Central & North Central', lat: 7.7532, lng: 80.9208 },
  { name: 'Maduru Oya National Park', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.6333, lng: 81.2000 },
  { name: 'Maduru Oya', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.9315, lng: 81.3565 },
  { name: 'Lunugamvehera National Park', type: 'National Park', region: 'Uva & Southern Provinces', lat: 6.3683, lng: 81.1967 },
  { name: 'Lunugamvehera', type: 'National Park', region: 'Uva & Southern Provinces', lat: 6.3476, lng: 81.1964 },
  { name: 'Bundala National Park', type: 'National Park', region: 'Hambantota, Southern Province', lat: 6.1833, lng: 81.2167 },
  { name: 'Gal Oya National Park', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.2000, lng: 81.4667 },
  { name: 'Gal Oya', type: 'National Park', region: 'Eastern & Uva Provinces', lat: 7.2285, lng: 81.4718 },
  { name: 'Lahugala Kitulana National Park', type: 'National Park', region: 'Ampara, Eastern Province', lat: 6.8833, lng: 81.7167 },
  { name: 'Somawathiya National Park', type: 'National Park', region: 'Polonnaruwa & Trincomalee', lat: 8.2167, lng: 81.1500 },
  { name: 'Flood Plains National Park', type: 'National Park', region: 'Mahaweli River Basin', lat: 8.0500, lng: 81.1000 },
  { name: 'Angammedilla National Park', type: 'National Park', region: 'Polonnaruwa District', lat: 7.9167, lng: 80.9500 },
  { name: 'Horton Plains National Park', type: 'National Park', region: 'Central Highlands', lat: 6.8000, lng: 80.8000 },
  { name: 'Sinharaja Forest Reserve', type: 'World Heritage Rainforest', region: 'Sabaragamuwa & Southern', lat: 6.4167, lng: 80.4500 },
  { name: 'Knuckles Mountain Range', type: 'Conservation Forest', region: 'Matale & Kandy', lat: 7.4500, lng: 80.7833 },
  { name: 'Peak Wilderness Sanctuary', type: 'Sanctuary', region: 'Central Highlands, Ratnapura', lat: 6.8167, lng: 80.5000 },
  { name: 'Kala Wewa Sanctuary', type: 'Sanctuary', region: 'North Central Province', lat: 7.9700, lng: 80.5300 },
  { name: 'Hurulu Eco Park', type: 'Eco Park / Forest Reserve', region: 'Habarana, North Central', lat: 8.0584, lng: 80.7703 },
  { name: 'Nimalawa Wildlife Sanctuary', type: 'Sanctuary', region: 'Hambantota District', lat: 6.2405, lng: 81.3540 },
  { name: 'Ritigala Strict Nature Reserve', type: 'Strict Nature Reserve', region: 'Anuradhapura District', lat: 8.1088, lng: 80.6559 },

  // ── Tanks (Wewa), Lakes & Small Wildlife Reservoirs ──
  { name: 'Pomparippu', type: 'Wildlife Basin / Habitat', region: 'Wilpattu South Border, Puttalam', lat: 8.3430, lng: 79.8864 },
  { name: 'Pomparippu Basin', type: 'River Basin / Wildlife Habitat', region: 'Kala Oya Basin, Puttalam', lat: 8.3167, lng: 79.8500 },
  { name: 'Gangewadiya', type: 'Estuary & Elephant Corridor', region: 'Wilpattu South Border, Puttalam', lat: 8.3183, lng: 79.8333 },
  { name: 'Dutch Bay', type: 'Coastal & Mangrove Habitat', region: 'Kalpitiya Peninsula, Puttalam', lat: 8.3300, lng: 79.7900 },
  { name: 'Karativu', type: 'Coastal Wildlife Fringe', region: 'Puttalam District', lat: 8.2833, lng: 79.8167 },
  { name: 'Kala Oya Basin', type: 'River & Wildlife Corridor', region: 'Wilpattu South, Puttalam', lat: 8.3000, lng: 79.8500 },
  { name: 'Eluwankulama Tank', type: 'Reservoir / Tank', region: 'Wilpattu South Border, Puttalam', lat: 8.2750, lng: 79.8667 },
  { name: 'Eluwankulama Wewa', type: 'Reservoir / Tank', region: 'Wilpattu South Border, Puttalam', lat: 8.2750, lng: 79.8667 },
  { name: 'Mahawilachchiya Wewa', type: 'Reservoir / Tank', region: 'Wilpattu East Border, Anuradhapura', lat: 8.4167, lng: 80.2000 },
  { name: 'Thabbowa Wewa', type: 'Historic Reservoir', region: 'Puttalam District', lat: 8.0167, lng: 79.9167 },
  { name: 'Thuththaneri Wewa', type: 'Reservoir / Tank', region: 'Puttalam District', lat: 8.2042, lng: 79.9397 },
  { name: 'Thuththaneriya Wewa', type: 'Reservoir / Tank', region: 'Puttalam District', lat: 8.2042, lng: 79.9397 },
  { name: 'Gambirs Gas Wewa', type: 'Reservoir / Tank', region: 'Wilpattu South Border, Puttalam', lat: 8.2038, lng: 79.9540 },
  { name: 'Inginimitiya Reservoir', type: 'Reservoir', region: 'Puttalam District', lat: 8.0000, lng: 80.1500 },
  { name: 'Palukadawala Wewa', type: 'Historic Reservoir', region: 'Kurunegala District', lat: 8.0167, lng: 80.2500 },
  { name: 'Makalanegama Wewa', type: 'Reservoir', region: 'Kurunegala District', lat: 7.9833, lng: 80.2667 },
  { name: 'Usgala Siyambalangamuwa Wewa', type: 'Historic Reservoir', region: 'Kurunegala District', lat: 7.9667, lng: 80.3167 },
  { name: 'Kala Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.0116, lng: 80.5577 },
  { name: 'Balalu Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 7.9735, lng: 80.5411 },
  { name: 'Minneriya Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 8.0333, lng: 80.8833 },
  { name: 'Kaudulla Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 8.1500, lng: 80.9333 },
  { name: 'Parakrama Samudraya', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 7.9167, lng: 80.9833 },
  { name: 'Giritale Wewa', type: 'Historic Reservoir', region: 'Polonnaruwa District', lat: 7.9833, lng: 80.9167 },
  { name: 'Kantale Wewa', type: 'Historic Reservoir', region: 'Trincomalee District', lat: 8.3667, lng: 80.9833 },
  { name: 'Senanayake Samudraya', type: 'Reservoir', region: 'Gal Oya, Ampara', lat: 7.2000, lng: 81.5167 },
  { name: 'Handapanagala Wewa', type: 'Elephant Habitat Tank', region: 'Wellawaya, Monaragala', lat: 6.6667, lng: 81.1833 },
  { name: 'Hambegamuwa Wewa', type: 'Historic Reservoir', region: 'Monaragala District', lat: 6.5500, lng: 81.0500 },
  { name: 'Mau Ara Reservoir', type: 'Reservoir', region: 'Hambantota / Monaragala', lat: 6.4667, lng: 81.0667 },
  { name: 'Weerawila Wewa', type: 'Bird & Elephant Tank', region: 'Hambantota District', lat: 6.2667, lng: 81.2333 },
  { name: 'Debarawewa', type: 'Historic Reservoir', region: 'Tissamaharama', lat: 6.2833, lng: 81.2667 },
  { name: 'Tissa Wewa', type: 'Historic Reservoir', region: 'Tissamaharama / Hambantota', lat: 6.2778, lng: 81.2861 },
  { name: 'Yoda Wewa Tissamaharama', type: 'Historic Reservoir', region: 'Hambantota District', lat: 6.2833, lng: 81.3167 },
  { name: 'Bandagiriya Wewa', type: 'Reservoir', region: 'Hambantota District', lat: 6.2167, lng: 81.1667 },
  { name: 'Udawalawe Reservoir', type: 'Reservoir', region: 'Udawalawe', lat: 6.4500, lng: 80.8500 },
  { name: 'Lunugamvehera Reservoir', type: 'Reservoir', region: 'Lunugamvehera', lat: 6.3683, lng: 81.2167 },
  { name: 'Padaviya Wewa', type: 'Historic Reservoir', region: 'Anuradhapura / Mullaitivu', lat: 8.8167, lng: 80.7500 },
  { name: 'Wahalkada Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.7167, lng: 80.8500 },
  { name: 'Nachchaduwa Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.2667, lng: 80.4833 },
  { name: 'Nuwarawewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.3500, lng: 80.4333 },
  { name: 'Tissawewa Anuradhapura', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.3333, lng: 80.3833 },
  { name: 'Hurulu Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.2167, lng: 80.7167 },
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
  { name: 'Mahakanadarawa Wewa', type: 'Historic Reservoir', region: 'Anuradhapura District', lat: 8.3952, lng: 80.5522 },

  // ── Core Elephant Towns, Habitats & Corridor Basins ──
  { name: 'Thalawa', type: 'Town & Elephant Habitat', region: 'Anuradhapura District, North Central Province', lat: 8.2435, lng: 80.3789 },
  { name: 'Galgamuwa', type: 'Town & Elephant Habitat', region: 'Kurunegala District, North Western Province', lat: 7.9863, lng: 80.2797 },
  { name: 'Karuwalagaswewa', type: 'Town & Elephant Habitat', region: 'Puttalam District, North Western Province', lat: 8.0167, lng: 79.9833 },
  { name: 'Anamaduwa', type: 'Town & Elephant Habitat', region: 'Puttalam District, North Western Province', lat: 7.9000, lng: 79.9833 },
  { name: 'Nawagattegama', type: 'Town & Elephant Habitat', region: 'Puttalam District, North Western Province', lat: 7.9833, lng: 80.1333 },
  { name: 'Mahakumbukkadawala', type: 'Town & Elephant Habitat', region: 'Puttalam District, North Western Province', lat: 7.8500, lng: 79.9167 },
  { name: 'Kukulkatuwa', type: 'Wildlife Sanctuary / Corridor', region: 'Puttalam District, North Western Province', lat: 8.0833, lng: 80.1167 },
  { name: 'Melsiripura', type: 'Town & Elephant Habitat', region: 'Kurunegala District, North Western Province', lat: 7.6333, lng: 80.5000 },
  { name: 'Vidataltivu', type: 'Nature Reserve', region: 'Mannar District, Northern Province', lat: 8.9800, lng: 80.0200 },
  { name: 'Kekirawa', type: 'Town & Elephant Corridor', region: 'Anuradhapura District, North Central Province', lat: 8.0461, lng: 80.5108 },

  { name: 'Buttala', type: 'Town & Elephant Habitat', region: 'Monaragala District, Uva Province', lat: 6.7583, lng: 81.2483 },
  { name: 'Wellawaya', type: 'Town & Elephant Habitat', region: 'Monaragala District, Uva Province', lat: 6.7408, lng: 81.1017 },
  { name: 'Ethimale', type: 'Wildlife Area & Tank', region: 'Monaragala District, Uva Province', lat: 6.7500, lng: 81.3800 },
  { name: 'Galge', type: 'Corridor Sanctuary', region: 'Yala Buffer, Southern / Uva Province', lat: 6.5500, lng: 81.3833 },
  { name: 'Situlpawwa', type: 'Wildlife Sanctuary', region: 'Yala National Park, Southern Province', lat: 6.3667, lng: 81.4333 },

  { name: 'Damana', type: 'Town & Elephant Habitat', region: 'Ampara District, Eastern Province', lat: 7.2000, lng: 81.6500 },
  { name: 'Deegavapiya', type: 'Historic Sanctuary & Plains', region: 'Ampara District, Eastern Province', lat: 7.2167, lng: 81.7500 },
  { name: 'Hulannuge', type: 'Elephant Corridor', region: 'Ampara District, Eastern Province', lat: 6.9667, lng: 81.7333 },
  { name: 'Lahugala', type: 'National Park', region: 'Ampara District, Eastern Province', lat: 6.9333, lng: 81.7167 },
  { name: 'Panama', type: 'Sanctuary & Coastal Wetland', region: 'Ampara District, Eastern Province', lat: 6.7500, lng: 81.8000 },
  { name: 'Nuwaragala', type: 'Sanctuary & Forest Reserve', region: 'Ampara District, Eastern Province', lat: 7.5000, lng: 81.3333 },
  { name: 'Kossapola', type: 'Wildlife Corridor', region: 'Wasgamuwa / Matale District', lat: 7.6833, lng: 80.8833 },

  { name: 'Kebithigollewa', type: 'Town & Tank Cascade', region: 'Anuradhapura District, North Central Province', lat: 8.6333, lng: 80.7000 },
  { name: 'Medawachchiya', type: 'Town & Elephant Corridor', region: 'Anuradhapura District, North Central Province', lat: 8.5333, lng: 80.5000 },
  { name: 'Kahatagasdigiliya', type: 'Town & Forest Buffer', region: 'Anuradhapura District, North Central Province', lat: 8.4167, lng: 80.6500 },
  { name: 'Galenbindunuwewa', type: 'Town & Elephant Habitat', region: 'Anuradhapura District, North Central Province', lat: 8.2167, lng: 80.6167 },
  { name: 'Mihintale', type: 'Sanctuary & Forest', region: 'Anuradhapura District, North Central Province', lat: 8.3500, lng: 80.5000 },
  { name: 'Thirappane', type: 'Town & Tank Cascade', region: 'Anuradhapura District, North Central Province', lat: 8.2167, lng: 80.5333 },
  { name: 'Thanthirimale', type: 'Historic Sanctuary & Forest', region: 'Anuradhapura District, North Central Province', lat: 8.5833, lng: 80.4000 },
  { name: 'Manankattiya', type: 'Tank & Roaming Area', region: 'Anuradhapura District, North Central Province', lat: 8.5000, lng: 80.6833 },
  { name: 'Habarana', type: 'Elephant Migration Hub', region: 'Anuradhapura District, North Central Province', lat: 8.0333, lng: 80.7500 },
  { name: 'Diganpathaha', type: 'Corridor & Buffer Zone', region: 'Matale / North Central Border', lat: 8.0100, lng: 80.7000 },
  { name: 'Palugaswewa', type: 'Tank Cascade & Forest', region: 'Anuradhapura District, North Central Province', lat: 8.0833, lng: 80.7000 },
  { name: 'Gomarankadawala', type: 'Forest Reserve & Basin', region: 'Trincomalee District, Eastern Province', lat: 8.6833, lng: 81.0500 },
  { name: 'Sooriyapura', type: 'Corridor & Buffer', region: 'Trincomalee District, Eastern Province', lat: 8.3833, lng: 81.1000 },
  { name: 'Welikanda', type: 'Town & Floodplain Plains', region: 'Polonnaruwa District, North Central Province', lat: 7.9167, lng: 81.2333 },
  { name: 'Yan Oya', type: 'River Basin & Reservoir', region: 'North Central / Eastern Border', lat: 8.7167, lng: 80.8500 },
  { name: 'Thoppigala', type: 'Sanctuary & Jungle Reserve', region: 'Batticaloa District, Eastern Province', lat: 7.6833, lng: 81.3333 },
  { name: 'Horowpathana', type: 'Sanctuary & Holding Ground', region: 'Anuradhapura District, North Central Province', lat: 8.5333, lng: 80.8500 },
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
  let primaryName = locationName.split(/\s*[/]\s*/)[0].trim();
  if (!primaryName) return null;

  // Normalize phonetic aliases & typos
  const aliasLower = primaryName.toLowerCase();
  if (aliasLower === 'athimale') primaryName = 'Ethimale';
  else if (aliasLower === 'mawara') primaryName = 'Mau Ara';
  else if (aliasLower === 'anganmadiila') primaryName = 'Angammedilla';
  else if (aliasLower === 'bundangala') primaryName = 'Buddhangala';
  else if (aliasLower === 'monarafala') primaryName = 'Monaragala';
  else if (aliasLower === 'rambawa') primaryName = 'Rambewa';
  else if (aliasLower === 'maha kanadarawa' || aliasLower === 'kanadarawa' || aliasLower === 'mahakanadarawa forest side') primaryName = 'Mahakanadarawa';
  else if (aliasLower === 'maha wilachchiya') primaryName = 'Mahawilachchiya';
  else if (aliasLower === 'wilachchiya') primaryName = 'Mahawilachchiya';
  else if (aliasLower === 'deegawapiya') primaryName = 'Deegavapiya';
  else if (aliasLower === 'deeghavapi') primaryName = 'Deegavapiya';
  else if (aliasLower === 'deegawapi') primaryName = 'Deegavapiya';
  else if (aliasLower === 'digampathana') primaryName = 'Diganpathaha';
  else if (aliasLower === 'malsiripura') primaryName = 'Melsiripura';
  else if (aliasLower === 'suriyapura') primaryName = 'Sooriyapura';
  else if (aliasLower === 'tabbowa') primaryName = 'Thabbowa';
  else if (aliasLower === 'tantirimale') primaryName = 'Thanthirimale';
  else if (aliasLower === 'tanthirimale') primaryName = 'Thanthirimale';
  else if (aliasLower === 'tirappane') primaryName = 'Thirappane';
  else if (aliasLower === 'thirapane') primaryName = 'Thirappane';
  else if (aliasLower === 'vidattaltivu') primaryName = 'Vidataltivu';
  else if (aliasLower === 'vedithalathiv') primaryName = 'Vidataltivu';
  else if (aliasLower === 'sithulpawwa') primaryName = 'Situlpawwa';
  else if (aliasLower === 'mannankattiya') primaryName = 'Manankattiya';
  else if (aliasLower === 'mannakkattiya') primaryName = 'Manankattiya';
  else if (aliasLower === 'nimalawa sanctuary') primaryName = 'Nimalawa Wildlife Sanctuary';
  else if (aliasLower === 'athimale wewa') primaryName = 'Ethimale Wewa';
  else if (aliasLower === 'toppigala') primaryName = 'Thoppigala';
  else if (aliasLower === 'saagama') primaryName = 'Sagama';
  else if (aliasLower === 'sasthrawela') primaryName = 'Shasthrawela';
  else if (aliasLower === 'galoya') primaryName = 'Gal Oya';
  else if (aliasLower === 'silavathura') primaryName = 'Silavathurai';
  else if (aliasLower === 'mahakandarawa') primaryName = 'Mahakanadarawa';
  else if (aliasLower === 'mahakanadara') primaryName = 'Mahakanadarawa';
  else if (aliasLower === 'kabithigollewa') primaryName = 'Kebithigollewa';
  else if (aliasLower === 'kebathigollewa') primaryName = 'Kebithigollewa';
  else if (aliasLower === 'nawagaththegama') primaryName = 'Nawagattegama';
  else if (aliasLower === 'nawagathegama') primaryName = 'Nawagattegama';
  else if (aliasLower === 'karuwagaswewa') primaryName = 'Karuwalagaswewa';
  else if (aliasLower === 'karuwalgaswewa') primaryName = 'Karuwalagaswewa';
  else if (aliasLower === 'mahakubukkadawala') primaryName = 'Mahakumbukkadawala';
  else if (aliasLower === 'hambanthota') primaryName = 'Hambantota';
  else if (aliasLower === 'butthala') primaryName = 'Buttala';
  else if (aliasLower === 'udawalawa') primaryName = 'Udawalawe';
  else if (aliasLower === 'kakirawa') primaryName = 'Kekirawa';
  else if (aliasLower === 'lunugamwehera') primaryName = 'Lunugamvehera';
  else if (aliasLower === 'tabbuwa') primaryName = 'Thabbowa';
  else if (aliasLower === 'kawdulla') primaryName = 'Kaudulla';
  else if (aliasLower === 'kalawewa') primaryName = 'Kala Wewa';
  else if (aliasLower === 'huruluwewa') primaryName = 'Hurulu Wewa';
  else if (aliasLower === 'mahaviachciya') primaryName = 'Mahawilachchiya';
  else if (aliasLower === 'mankkatiya') primaryName = 'Manankattiya';
  else if (aliasLower === 'mannakkatiya') primaryName = 'Manankattiya';
  else if (aliasLower === 'maruoya') primaryName = 'Maduru Oya';
  else if (aliasLower === 'eco park') primaryName = 'Hurulu Eco Park';
  else if (aliasLower === 'manakkatiya') primaryName = 'Manankattiya';
  else if (aliasLower === 'yanoya') primaryName = 'Yan Oya';
  else if (aliasLower === 'eluwankulam') primaryName = 'Eluwankulama';

  const primaryLower = primaryName.toLowerCase();
  const normalizedPrimary = normalizePlaceName(primaryName);

  // 1. Exact match on raw name
  const exact = SRI_LANKA_WILDLIFE_LOCATIONS.find(
    (l) => l.name.toLowerCase() === primaryLower
  );
  if (exact && typeof exact.lat === 'number') {
    return { lat: exact.lat, lng: exact.lng, name: exact.name };
  }

  // 2. Exact match on normalized stem (e.g. "Yala Block 5" -> "yala block 5")
  const exactNorm = SRI_LANKA_WILDLIFE_LOCATIONS.find(
    (l) => normalizePlaceName(l.name) === normalizedPrimary
  );
  if (exactNorm && typeof exactNorm.lat === 'number') {
    return { lat: exactNorm.lat, lng: exactNorm.lng, name: exactNorm.name };
  }

  // 3. Block number specific match (e.g. "Yala Block 5", "Yala Block 3,5", "Block 3")
  const blockMatch = primaryLower.match(/block\s*(\d+)/i);
  if (blockMatch) {
    const bNum = blockMatch[1];
    const bEntry = SRI_LANKA_WILDLIFE_LOCATIONS.find((l) => {
      const lLow = l.name.toLowerCase();
      return lLow.includes(`block ${bNum}`) || lLow.includes(`block-${bNum}`) || lLow.includes(`block ${bNum},`);
    });
    if (bEntry && typeof bEntry.lat === 'number') {
      return { lat: bEntry.lat, lng: bEntry.lng, name: bEntry.name };
    }
  }

  // 4. Substring / stemmed match (prefer longer/more specific entries first)
  if (normalizedPrimary.length >= 3) {
    const candidates = SRI_LANKA_WILDLIFE_LOCATIONS.filter((l) => {
      const normLoc = normalizePlaceName(l.name);
      return (
        (normLoc.length >= 4 && normalizedPrimary.includes(normLoc)) ||
        (normalizedPrimary.length >= 4 && normLoc.includes(normalizedPrimary))
      );
    }).sort((a, b) => b.name.length - a.name.length);

    if (candidates.length > 0 && typeof candidates[0].lat === 'number') {
      return { lat: candidates[0].lat, lng: candidates[0].lng, name: candidates[0].name };
    }
  }

  // 5. Substring includes match
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

  // 0. Check if point is very close (within ~1.2 km) to a registered lake, tank, or wildlife area
  const R = 6371;
  const nearbyKnown = SRI_LANKA_WILDLIFE_LOCATIONS.find((loc) => {
    if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
    const dLat = ((loc.lat - lat) * Math.PI) / 180;
    const dLng = ((loc.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((loc.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const dist = 2 * R * Math.asin(Math.sqrt(a));
    return dist <= 1.2;
  });
  if (nearbyKnown) {
    const formatted = nearbyKnown.region ? `${nearbyKnown.name}, ${nearbyKnown.region}` : nearbyKnown.name;
    return { name: formatted, fullAddress: formatted, region: nearbyKnown.region || 'Sri Lanka' };
  }

  // 1. Google Geocoding when Google Maps is configured
  if (isGoogleMapsEnabled()) {
    try {
      const g = await googleReverseGeocode(lat, lng);
      if (g) return g;
    } catch (err) {
      console.warn('[maps] Google reverse geocode failed, using free geocoder:', err?.message || err);
    }
  }

  // 2. Nominatim + Photon reverse geocoder with intelligent feature detection
  if (typeof fetch !== 'undefined') {
    let nomResult = null;
    let nomIsBroadBoundary = false;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};

        // Find specific local place (building, store, business, park, sanctuary, tank, water body, village, road, etc.)
        const specific =
          addr.building ||
          addr.amenity ||
          addr.shop ||
          addr.tourism ||
          addr.office ||
          addr.craft ||
          addr.leisure ||
          addr.historic ||
          addr.natural ||
          addr.water ||
          addr.village ||
          addr.hamlet ||
          addr.suburb ||
          addr.town ||
          addr.city ||
          addr.road;

        nomIsBroadBoundary =
          !specific &&
          (data.addresstype === 'state_district' ||
            data.addresstype === 'state' ||
            data.addresstype === 'country' ||
            data.class === 'boundary');

        const primary = specific || data.name || (data.display_name ? data.display_name.split(',')[0].trim() : null);
        const district = addr.state_district || addr.county || addr.district || addr.state || 'Sri Lanka';

        if (primary && !nomIsBroadBoundary) {
          const formatted = district && !primary.toLowerCase().includes(district.toLowerCase())
            ? `${primary}, ${district}`
            : primary;

          cacheLocationCoordinates(primary, { lat, lng });
          cacheLocationCoordinates(formatted, { lat, lng });

          return {
            name: formatted,
            fullAddress: data.display_name || formatted,
            region: district,
          };
        } else if (primary) {
          // Keep broad boundary as fallback if Photon has nothing better
          nomResult = {
            name: primary,
            fullAddress: data.display_name || primary,
            region: district,
          };
        }
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode failed:', err);
    }

    // 3. Photon reverse search (especially powerful for natural features, tanks, and rural reservoirs)
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
          const specificName = props.name || props.street || (!nomResult ? props.city || props.district : null);
          const district = props.county || props.district || props.state || 'Sri Lanka';
          if (specificName) {
            const formatted = district && !specificName.toLowerCase().includes(district.toLowerCase())
              ? `${specificName}, ${district}`
              : specificName;
            cacheLocationCoordinates(specificName, { lat, lng });
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

    // If Nominatim had at least an administrative district name, return it now
    if (nomResult) {
      return nomResult;
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
          if (!isNaN(lat) && !isNaN(lng) && lat >= 5.5 && lat <= 10.0 && lng >= 79.5 && lng <= 82.5) {
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
          if (typeof lat === 'number' && typeof lon === 'number' && lat >= 5.5 && lat <= 10.0 && lon >= 79.5 && lon <= 82.5) {
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

/* ── Live place search while typing (Photon, OpenStreetMap data) ──────
   Photon is built for search-as-you-type; Nominatim's rules forbid
   autocomplete, so Nominatim is only used for one-off lookups. */
const PHOTON_URL = 'https://photon.komoot.io/api/';
const SRI_LANKA_BBOX = '79.4,5.8,82.0,10.0';

export async function searchPlacesLive(query, { limit = 8, signal } = {}) {
  const q = String(query || '').trim();
  if (isGoogleMapsEnabled()) {
    if (q.length < 3) return []; // save Google quota on 1–2 letter searches
    try {
      return await googleAutocomplete(q, limit);
    } catch (err) {
      console.warn('[maps] Google search failed, using free search:', err?.message || err);
    }
  }
  if (q.length < 2 || typeof fetch === 'undefined') return [];
  const url = `${PHOTON_URL}?q=${encodeURIComponent(q)}&limit=${limit}&lang=en&bbox=${SRI_LANKA_BBOX}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const seen = new Set();
  const results = (data?.features || [])
    .filter((f) => !f.properties?.countrycode || f.properties.countrycode === 'LK')
    .map((f) => {
      const p = f.properties || {};
      const [lng, lat] = f.geometry?.coordinates || [];
      const title = p.name || p.street || p.city || '';
      const subtitle = [p.city !== title ? p.city : null, p.district || p.county, p.state]
        .filter(Boolean)
        .join(', ');

      const rawType = p.osm_value || p.osm_key || '';
      let placeType = 'Location';
      if (rawType === 'amenity' || rawType === 'building') placeType = 'Building';
      else if (rawType === 'shop') placeType = 'Store';
      else if (rawType === 'office') placeType = 'Business';
      else if (rawType === 'tourism') placeType = 'Venue';
      else if (rawType === 'leisure' || rawType === 'park') placeType = 'Park';
      else if (rawType === 'sanctuary' || rawType === 'nature_reserve') placeType = 'Sanctuary';

      return {
        title,
        subtitle: subtitle || 'Sri Lanka',
        full: [title, subtitle, 'Sri Lanka'].filter(Boolean).join(', '),
        lat: typeof lat === 'number' ? lat : undefined,
        lng: typeof lng === 'number' ? lng : undefined,
        type: placeType,
        badge: placeType,
      };
    })
    .filter((r) => {
      const key = r.title.toLowerCase();
      if (!r.title || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // Fallback to Nominatim search for specific venues, buildings, or stores not caught by Photon
  if (results.length === 0 && q.length >= 3) {
    try {
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&countrycodes=lk&format=json&limit=${limit}&addressdetails=1`;
      const nomRes = await fetch(nomUrl, { headers: { 'Accept-Language': 'en' }, signal });
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          nomData.forEach((item) => {
            const title = item.name || (item.display_name ? item.display_name.split(',')[0].trim() : '');
            if (!title) return;
            const subtitle = item.display_name ? item.display_name.split(',').slice(1, 4).join(', ').trim() : 'Sri Lanka';
            const cat = item.type || item.class || 'Location';
            let badge = 'Location';
            if (['building', 'amenity', 'auditorium', 'hall'].includes(cat)) badge = 'Building';
            else if (['shop', 'supermarket', 'mall'].includes(cat)) badge = 'Store';
            else if (['park', 'leisure', 'garden'].includes(cat)) badge = 'Park';
            else if (['sanctuary', 'nature_reserve'].includes(cat)) badge = 'Sanctuary';
            const key = title.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              results.push({
                title,
                subtitle,
                full: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                type: badge,
                badge,
              });
            }
          });
        }
      }
    } catch {
      /* ignore */
    }
  }

  return results;
}

/* ── Google Places / Geocoding (used only when a Google key is set) ── */
let googleSessionToken = null;

async function googleAutocomplete(q, limit) {
  await loadGoogleMaps();
  const { AutocompleteSuggestion, AutocompleteSessionToken } = await window.google.maps.importLibrary('places');
  // One session per search → selection; Google bills the session, not each keystroke, when it ends in a selection
  if (!googleSessionToken) googleSessionToken = new AutocompleteSessionToken();
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input: q,
    sessionToken: googleSessionToken,
    includedRegionCodes: ['lk'],
    language: 'en',
  });
  return (suggestions || [])
    .map((sug) => sug.placePrediction)
    .filter(Boolean)
    .slice(0, limit)
    .map((pp) => {
      const title = pp.mainText?.text || pp.text?.text || '';
      const subtitle = (pp.secondaryText?.text || 'Sri Lanka').replace(/,?\s*Sri Lanka$/, '') || 'Sri Lanka';
      return {
        title,
        subtitle,
        full: pp.text?.text || title,
        getCoords: async () => {
          try {
            const place = pp.toPlace();
            await place.fetchFields({ fields: ['location'] });
            googleSessionToken = null; // session finished
            if (!place.location) return null;
            const coords = { lat: place.location.lat(), lng: place.location.lng() };
            cacheLocationCoordinates(title, coords);
            return coords;
          } catch {
            return null;
          }
        },
      };
    });
}

async function googleReverseGeocode(lat, lng) {
  await loadGoogleMaps();
  const { Geocoder } = await window.google.maps.importLibrary('geocoding');
  const { results } = await new Geocoder().geocode({ location: { lat, lng }, language: 'en' });
  const best = (results || []).find((r) => !(r.types || []).includes('plus_code')) || null;
  if (!best) return null;
  const comps = best.address_components || [];
  const pick = (...types) => comps.find((c) => types.some((t) => (c.types || []).includes(t)))?.long_name;
  const name =
    pick('natural_feature', 'park', 'point_of_interest', 'establishment') ||
    pick('sublocality', 'locality', 'administrative_area_level_4', 'administrative_area_level_3') ||
    pick('route') ||
    comps[0]?.long_name;
  if (!name) return null;
  const region = pick('administrative_area_level_2', 'administrative_area_level_1') || 'Sri Lanka';
  return { name, fullAddress: best.formatted_address, region };
}
