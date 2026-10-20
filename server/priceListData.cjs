// Complete 178 items transcribed and translated from Sri Amman Thais Traders 2026 Price List
const items = [
  // Page 2: கம்பி மத்தாப்பு -> Sparklers
  { id: '1', itemCode: 'CRK001', itemName: '10cm Electric Sparklers (10 Pcs)', category: 'Sparklers', mrp: 16, wholesalePrice: 16 },
  { id: '2', itemCode: 'CRK002', itemName: '12cm Crackling Sparklers (10 Pcs)', category: 'Sparklers', mrp: 27, wholesalePrice: 27 },
  { id: '3', itemCode: 'CRK003', itemName: '12cm Green Sparklers (10 Pcs)', category: 'Sparklers', mrp: 36, wholesalePrice: 36 },
  { id: '4', itemCode: 'CRK004', itemName: '12cm Red Sparklers (10 Pcs)', category: 'Sparklers', mrp: 36, wholesalePrice: 36 },
  { id: '5', itemCode: 'CRK005', itemName: '15cm Electric Sparklers (10 Pcs)', category: 'Sparklers', mrp: 40, wholesalePrice: 40 },
  { id: '6', itemCode: 'CRK006', itemName: '15cm Crackling Sparklers (10 Pcs)', category: 'Sparklers', mrp: 45, wholesalePrice: 45 },
  { id: '7', itemCode: 'CRK007', itemName: '30cm Electric Sparklers (5 Pcs)', category: 'Sparklers', mrp: 40, wholesalePrice: 40 },
  { id: '8', itemCode: 'CRK008', itemName: '30cm Crackling Sparklers (5 Pcs)', category: 'Sparklers', mrp: 45, wholesalePrice: 45 },
  { id: '9', itemCode: 'CRK009', itemName: '30cm 5 in 1 Color Sparklers (5 Pcs)', category: 'Sparklers', mrp: 60, wholesalePrice: 60 },
  { id: '10', itemCode: 'CRK010', itemName: '50cm Electric Sparklers (5 Pcs)', category: 'Sparklers', mrp: 150, wholesalePrice: 150 },
  { id: '11', itemCode: 'CRK011', itemName: '50cm Crackling Sparklers (5 Pcs)', category: 'Sparklers', mrp: 165, wholesalePrice: 165 },
  { id: '12', itemCode: 'CRK012', itemName: '75cm Electric Sparklers (5 Pcs)', category: 'Sparklers', mrp: 220, wholesalePrice: 220 },
  { id: '13', itemCode: 'CRK013', itemName: '75cm Crackling Sparklers (5 Pcs)', category: 'Sparklers', mrp: 245, wholesalePrice: 245 },
  { id: '14', itemCode: 'CRK014', itemName: 'Rotating Sparklers (1 Pc)', category: 'Sparklers', mrp: 200, wholesalePrice: 200 },

  // Page 2: தரைச்சக்கரம் -> Ground Chakkars
  { id: '15', itemCode: 'CRK015', itemName: 'Ground Chakkar Big (10 Pcs)', category: 'Ground Chakkars', mrp: 40, wholesalePrice: 40 },
  { id: '16', itemCode: 'CRK016', itemName: 'Spinner Special (10 Pcs)', category: 'Ground Chakkars', mrp: 110, wholesalePrice: 110 },
  { id: '17', itemCode: 'CRK017', itemName: 'Spinner Deluxe (10 Pcs)', category: 'Ground Chakkars', mrp: 165, wholesalePrice: 165 },
  { id: '18', itemCode: 'CRK018', itemName: 'Butterfly Fancy Wheel (10 Pcs)', category: 'Ground Chakkars', mrp: 100, wholesalePrice: 100 },
  { id: '19', itemCode: 'CRK019', itemName: 'Chakkar Special (10 Pcs)', category: 'Ground Chakkars', mrp: 80, wholesalePrice: 80 },
  { id: '20', itemCode: 'CRK020', itemName: 'Chakkar Deluxe (10 Pcs)', category: 'Ground Chakkars', mrp: 150, wholesalePrice: 150 },
  { id: '21', itemCode: 'CRK021', itemName: 'Ninja Chakkar (2 Pcs)', category: 'Ground Chakkars', mrp: 160, wholesalePrice: 160 },
  { id: '22', itemCode: 'CRK022', itemName: '4x4 Wheel Fancy Chakkar (5 Pcs)', category: 'Ground Chakkars', mrp: 160, wholesalePrice: 160 },
  { id: '23', itemCode: 'CRK023', itemName: 'Bambaram Fancy Spinning Top (10 Pcs)', category: 'Ground Chakkars', mrp: 70, wholesalePrice: 70 },
  { id: '24', itemCode: 'CRK024', itemName: 'Motu Patlu Fancy Chakkar Siren with Crackling (2 Pcs)', category: 'Ground Chakkars', mrp: 270, wholesalePrice: 270 },

  // Page 2: புஸ்வானம் -> Flower Pots
  { id: '25', itemCode: 'CRK025', itemName: 'Flower Pots Special - Glassco (10 Pcs)', category: 'Flower Pots', mrp: 90, wholesalePrice: 90 },
  { id: '26', itemCode: 'CRK026', itemName: 'Flower Pots Ashoka - Glassco (10 Pcs)', category: 'Flower Pots', mrp: 135, wholesalePrice: 135 },
  { id: '27', itemCode: 'CRK027', itemName: 'Flower Pots Ashoka - Annai (10 Pcs)', category: 'Flower Pots', mrp: 165, wholesalePrice: 165 },
  { id: '28', itemCode: 'CRK028', itemName: 'Flower Pots Color Koti - Green Soda (10 Pcs)', category: 'Flower Pots', mrp: 190, wholesalePrice: 190 },
  { id: '29', itemCode: 'CRK029', itemName: 'Flower Pots Color Koti Deluxe - Green Soda (5 Pcs)', category: 'Flower Pots', mrp: 190, wholesalePrice: 190 },
  { id: '30', itemCode: 'CRK030', itemName: 'Flower Pots Mega Color Koti (10 Pcs)', category: 'Flower Pots', mrp: 360, wholesalePrice: 360 },
  { id: '31', itemCode: 'CRK031', itemName: 'Sony Flower Pots Violet Mega Color Koti (10 Pcs)', category: 'Flower Pots', mrp: 810, wholesalePrice: 810 },

  // Page 2: பென்சில் -> Sparkler Pencils
  { id: '32', itemCode: 'CRK032', itemName: 'Silver Pencil Sparklers (10 Pcs)', category: 'Sparkler Pencils', mrp: 75, wholesalePrice: 75 },
  { id: '33', itemCode: 'CRK033', itemName: 'Navrang Color Pencil Sparklers (3 Pcs)', category: 'Sparkler Pencils', mrp: 150, wholesalePrice: 150 },

  // Page 2: சாட்டை -> Cracker Whips
  { id: '34', itemCode: 'CRK034', itemName: 'Cracker Whip Small 1.5 ft (10 Pcs)', category: 'Cracker Whips', mrp: 30, wholesalePrice: 30 },
  { id: '35', itemCode: 'CRK035', itemName: 'Cracker Whip Big 4 ft (10 Pcs)', category: 'Cracker Whips', mrp: 65, wholesalePrice: 65 },

  // Page 3: பவுண்டன் ஃபேண்சி புஸ்வானம் -> Fancy Fountains
  { id: '36', itemCode: 'CRK036', itemName: 'Disco Shower Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 100, wholesalePrice: 100 },
  { id: '37', itemCode: 'CRK037', itemName: 'Wi-Fi Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 150, wholesalePrice: 150 },
  { id: '38', itemCode: 'CRK038', itemName: 'Lollipop Multicolor Fountain (2 Pcs)', category: 'Fancy Fountains', mrp: 165, wholesalePrice: 165 },
  { id: '39', itemCode: 'CRK039', itemName: 'High Voltage Crackling Fountain (2 Pcs)', category: 'Fancy Fountains', mrp: 165, wholesalePrice: 165 },
  { id: '40', itemCode: 'CRK040', itemName: 'Tri-Color Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 250, wholesalePrice: 250 },
  { id: '41', itemCode: 'CRK041', itemName: 'Dinakaran 5 in 1 Mega Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 225, wholesalePrice: 225 },
  { id: '42', itemCode: 'CRK042', itemName: 'Siren Mega Fountain (3 Pcs)', category: 'Fancy Fountains', mrp: 190, wholesalePrice: 190 },
  { id: '43', itemCode: 'CRK043', itemName: 'Mini Siren Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 160, wholesalePrice: 160 },
  { id: '44', itemCode: 'CRK044', itemName: 'Sona Mayur Mega Anar Fountain (2 Pcs)', category: 'Fancy Fountains', mrp: 150, wholesalePrice: 150 },
  { id: '45', itemCode: 'CRK045', itemName: 'Crackling Mega Coolie Fountain (3 Pcs)', category: 'Fancy Fountains', mrp: 270, wholesalePrice: 270 },
  { id: '46', itemCode: 'CRK046', itemName: 'Shanmugas Opera, Tripcop, Jazz Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 185, wholesalePrice: 185 },
  { id: '47', itemCode: 'CRK047', itemName: 'Sivam Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 80, wholesalePrice: 80 },
  { id: '48', itemCode: 'CRK048', itemName: 'Sundaram Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 80, wholesalePrice: 80 },
  { id: '49', itemCode: 'CRK049', itemName: 'Asurabi Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 160, wholesalePrice: 160 },
  { id: '50', itemCode: 'CRK050', itemName: 'Chakkalakka Mega Box Color Crackling Fountain (5 Pcs)', category: 'Fancy Fountains', mrp: 500, wholesalePrice: 500 },

  // Page 3: சிங்கிள் பீஸ் ஃபேன்சி பவுண்டன் புஸ்வானம் -> Single Piece Fountains
  { id: '51', itemCode: 'CRK051', itemName: 'Narakasuran Mega Double Function Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 220, wholesalePrice: 220 },
  { id: '52', itemCode: 'CRK052', itemName: 'Tin Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 90, wholesalePrice: 90 },
  { id: '53', itemCode: 'CRK053', itemName: 'Crackling King Mega Size Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 220, wholesalePrice: 220 },
  { id: '54', itemCode: 'CRK054', itemName: 'Peacock Pandiyan - Star Vel Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 180, wholesalePrice: 180 },
  { id: '55', itemCode: 'CRK055', itemName: 'Peacock Jeyarubi Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 135, wholesalePrice: 135 },
  { id: '56', itemCode: 'CRK056', itemName: 'Mega Peacock Ruthra, Anbu Fountain (1 Pc)', category: 'Single Piece Fountains', mrp: 400, wholesalePrice: 400 },

  // Page 3: கிட்ஸ் பேன்சி ஸ்பெஷல் -> Kids Special
  { id: '57', itemCode: 'CRK057', itemName: 'Chikki Mukki Crackers (10 Pcs)', category: 'Kids Special', mrp: 60, wholesalePrice: 60 },
  { id: '58', itemCode: 'CRK058', itemName: 'Cartoon Special Crackers (10 Pcs)', category: 'Kids Special', mrp: 25, wholesalePrice: 25 },
  { id: '59', itemCode: 'CRK059', itemName: 'Photo Flash (5 Pcs)', category: 'Kids Special', mrp: 70, wholesalePrice: 70 },
  { id: '60', itemCode: 'CRK060', itemName: 'Money Bank Rupee Bomb - Star Vel (3 Pcs)', category: 'Kids Special', mrp: 180, wholesalePrice: 180 },
  { id: '61', itemCode: 'CRK061', itemName: 'Color Smoke Mega Size (3 Pcs)', category: 'Kids Special', mrp: 150, wholesalePrice: 150 },
  { id: '62', itemCode: 'CRK062', itemName: 'Money Bomb Mini Size (1 Pc)', category: 'Kids Special', mrp: 20, wholesalePrice: 20 },
  { id: '63', itemCode: 'CRK063', itemName: 'Money Blast Out Cash Bomb (2 Pcs)', category: 'Kids Special', mrp: 200, wholesalePrice: 200 },
  { id: '64', itemCode: 'CRK064', itemName: 'Snake Tablets Mega Size (1 Pc)', category: 'Kids Special', mrp: 10, wholesalePrice: 10 },
  { id: '65', itemCode: 'CRK065', itemName: 'Pistol 5G Toy Gun (2 Pcs)', category: 'Kids Special', mrp: 250, wholesalePrice: 250 },
  { id: '66', itemCode: 'CRK066', itemName: 'Waterfalls Tin Fountain - Heatless (1 Pc)', category: 'Kids Special', mrp: 100, wholesalePrice: 100 },
  { id: '67', itemCode: 'CRK067', itemName: 'Black Money Day & Night Cash Bomb (3 Pcs)', category: 'Kids Special', mrp: 230, wholesalePrice: 230 },
  { id: '68', itemCode: 'CRK068', itemName: '90 Watts Digital Garland Crackers (3 Pcs)', category: 'Kids Special', mrp: 150, wholesalePrice: 150 },
  { id: '69', itemCode: 'CRK069', itemName: 'Velmayil Cold Fountain Shower - Heatless (2 Pcs)', category: 'Kids Special', mrp: 190, wholesalePrice: 190 },
  { id: '70', itemCode: 'CRK070', itemName: 'Welcome Hand Fountain Shower - Heatless (3 Pcs)', category: 'Kids Special', mrp: 220, wholesalePrice: 220 },
  { id: '71', itemCode: 'CRK071', itemName: 'Hanuman Gada Mega Multi-Color Shower (1 Pcs)', category: 'Kids Special', mrp: 180, wholesalePrice: 180 },
  { id: '71', itemCode: 'CRK071', itemName: 'Diamond Tri Color (5 Pcs)', category: 'Kids Special', mrp: 36, wholesalePrice: 36 },


  // Page 3: தீப்பெட்டி மத்தாப்பு -> Matchbox Sparklers
  { id: '72', itemCode: 'CRK072', itemName: 'Super Deluxe Matchbox Sparklers 10 in 1 (10 Pkt)', category: 'Matchbox Sparklers', mrp: 80, wholesalePrice: 80 },
  { id: '73', itemCode: 'CRK073', itemName: 'Classic Matchbox Sparklers 10 in 1 (5 Pkt)', category: 'Matchbox Sparklers', mrp: 130, wholesalePrice: 130 },

  // Page 4: ராக்கெட் -> Rockets
  { id: '74', itemCode: 'CRK074', itemName: 'Drone Flying Rocket (5 Pcs)', category: 'Rockets', mrp: 100, wholesalePrice: 100 },
  { id: '75', itemCode: 'CRK075', itemName: 'Helicopter Flying Rocket (5 Pcs)', category: 'Rockets', mrp: 100, wholesalePrice: 100 },
  { id: '76', itemCode: 'CRK076', itemName: 'Rocket Bomb - Color Rocket (10 Pcs)', category: 'Rockets', mrp: 80, wholesalePrice: 80 },
  { id: '77', itemCode: 'CRK077', itemName: 'Musical Whistling Rocket (5 Pcs)', category: 'Rockets', mrp: 130, wholesalePrice: 130 },
  { id: '78', itemCode: 'CRK078', itemName: 'Lunik Mega Rocket (10 Pcs)', category: 'Rockets', mrp: 115, wholesalePrice: 115 },
  { id: '79', itemCode: 'CRK079', itemName: 'Whistling Mega Rocket (10 Pcs)', category: 'Rockets', mrp: 220, wholesalePrice: 220 },

  // Page 4: ஒற்றை வெடிகள் -> Single Sound Crackers
  { id: '80', itemCode: 'CRK080', itemName: '2 3/4" Kuruvi Crackers (5 Pcs)', category: 'Single Sound Crackers', mrp: 9, wholesalePrice: 9 },
  { id: '81', itemCode: 'CRK081', itemName: '3 1/2" Lakshmi Crackers - Sri Narayana (5 Pcs)', category: 'Single Sound Crackers', mrp: 15, wholesalePrice: 15 },
  { id: '82', itemCode: 'CRK082', itemName: '4" Lakshmi Crackers (5 Pcs)', category: 'Single Sound Crackers', mrp: 20, wholesalePrice: 20 },
  { id: '83', itemCode: 'CRK083', itemName: '4" Gold Lakshmi - Machine Thread (5 Pcs)', category: 'Single Sound Crackers', mrp: 40, wholesalePrice: 40 },
  { id: '84', itemCode: 'CRK084', itemName: '4" Lakshmi Deluxe - Machine Thread (5 Pcs)', category: 'Single Sound Crackers', mrp: 37, wholesalePrice: 37 },
  { id: '85', itemCode: 'CRK085', itemName: '5" Mega Ganesh - Machine Thread (5 Pcs)', category: 'Single Sound Crackers', mrp: 50, wholesalePrice: 50 },
  { id: '86', itemCode: 'CRK086', itemName: '6" Lion Crackers - Machine Thread (5 Pcs)', category: 'Single Sound Crackers', mrp: 70, wholesalePrice: 70 },
  { id: '87', itemCode: 'CRK087', itemName: 'Paper Bomb 1/4 Kg (1 Pc)', category: 'Single Sound Crackers', mrp: 50, wholesalePrice: 50 },
  { id: '88', itemCode: 'CRK088', itemName: 'Paper Bomb 1/2 Kg (1 Pc)', category: 'Single Sound Crackers', mrp: 100, wholesalePrice: 100 },
  { id: '89', itemCode: 'CRK089', itemName: 'Paper Bomb 1 Kg (1 Pc)', category: 'Single Sound Crackers', mrp: 200, wholesalePrice: 200 },
  { id: '90', itemCode: 'CRK090', itemName: 'Color Paper Bomb (1 Pc)', category: 'Single Sound Crackers', mrp: 80, wholesalePrice: 80 },
  { id: '91', itemCode: 'CRK091', itemName: 'Red Bijili Crackers (100 Pcs)', category: 'Single Sound Crackers', mrp: 40, wholesalePrice: 40 },
  { id: '92', itemCode: 'CRK092', itemName: 'Stripped Bijili Crackers (100 Pcs)', category: 'Single Sound Crackers', mrp: 45, wholesalePrice: 45 },
  { id: '93', itemCode: 'CRK093', itemName: 'Avatar Mini Paper Bomb (10 Pcs)', category: 'Single Sound Crackers', mrp: 360, wholesalePrice: 360 },

  // Page 4: சோர்சா வெடி -> Garland Crackers
  { id: '94', itemCode: 'CRK094', itemName: '28 Chorsa Crackers (1 Pkt)', category: 'Garland Crackers', mrp: 15, wholesalePrice: 15 },
  { id: '95', itemCode: 'CRK095', itemName: '100 Wala Garland Crackers (1 Pkt)', category: 'Garland Crackers', mrp: 45, wholesalePrice: 45 },

  // Page 4: ஆட்டம் பாம்கள் -> Atom Bombs
  { id: '96', itemCode: 'CRK096', itemName: 'Hydro Bomb Green (10 Pcs)', category: 'Atom Bombs', mrp: 75, wholesalePrice: 75 },
  { id: '97', itemCode: 'CRK097', itemName: 'King of Kings Bomb (10 Pcs)', category: 'Atom Bombs', mrp: 100, wholesalePrice: 100 },
  { id: '98', itemCode: 'CRK098', itemName: 'Classic Bomb (10 Pcs)', category: 'Atom Bombs', mrp: 120, wholesalePrice: 120 },
  { id: '99', itemCode: 'CRK099', itemName: 'Deluxe Bomb (10 Pcs)', category: 'Atom Bombs', mrp: 190, wholesalePrice: 190 },
  { id: '100', itemCode: 'CRK100', itemName: 'Digital Bomb (10 Pcs)', category: 'Atom Bombs', mrp: 225, wholesalePrice: 225 },

  // Page 4: மினி ஸ்கை சாட் -> Mini Sky Shots
  { id: '101', itemCode: 'CRK101', itemName: 'Penta Sky Shot (5 Pcs)', category: 'Mini Sky Shots', mrp: 130, wholesalePrice: 130 },
  { id: '102', itemCode: 'CRK102', itemName: '7 Shot Mini Sky Shot (5 Pcs)', category: 'Mini Sky Shots', mrp: 110, wholesalePrice: 110 },
  { id: '103', itemCode: 'CRK103', itemName: 'Pep Mini Sky Shot (2 Pcs)', category: 'Mini Sky Shots', mrp: 60, wholesalePrice: 60 },

  // Page 4: சோட்டா ஃபேன்சி (Out) -> Chotta Fancy Shots
  { id: '104', itemCode: 'CRK104', itemName: '1.25" Fancy Rolls Royce Shot (1 Pc)', category: 'Chotta Fancy Shots', mrp: 38, wholesalePrice: 38 },
  { id: '105', itemCode: 'CRK105', itemName: '1.25" Fancy BMW Shot (1 Pc)', category: 'Chotta Fancy Shots', mrp: 38, wholesalePrice: 38 },
  { id: '106', itemCode: 'CRK106', itemName: '1.25" Fancy Jaguar Shot (1 Pc)', category: 'Chotta Fancy Shots', mrp: 38, wholesalePrice: 38 },
  { id: '107', itemCode: 'CRK107', itemName: '1.25" Fancy Audi Shot (1 Pc)', category: 'Chotta Fancy Shots', mrp: 38, wholesalePrice: 38 },

  // Page 4 & 5: 2" ஃபேன்சி ஸ்கை சாட் (Out) -> 2 Inch Fancy Sky Shots
  { id: '108', itemCode: 'CRK108', itemName: '2" Fancy Bugatti Sky Shot (1 Pc)', category: '2 Inch Fancy Sky Shots', mrp: 100, wholesalePrice: 100 },
  { id: '109', itemCode: 'CRK109', itemName: '2" Fancy Volvo Sky Shot (1 Pc)', category: '2 Inch Fancy Sky Shots', mrp: 100, wholesalePrice: 100 },
  { id: '110', itemCode: 'CRK110', itemName: '2" Fancy Land Rover Sky Shot (1 Pc)', category: '2 Inch Fancy Sky Shots', mrp: 100, wholesalePrice: 100 },
  { id: '111', itemCode: 'CRK111', itemName: '2" Fancy Hummer Sky Shot (1 Pc)', category: '2 Inch Fancy Sky Shots', mrp: 100, wholesalePrice: 100 },
  { id: '112', itemCode: 'CRK112', itemName: '2" Fancy Ferrari Sky Shot (1 Pc)', category: '2 Inch Fancy Sky Shots', mrp: 100, wholesalePrice: 100 },

  // Page 5: 2“ ஃபேன்சி 3 Pcs (Out) -> 2 Inch Fancy 3 Pcs Shots
  { id: '113', itemCode: 'CRK113', itemName: '2" Fancy Extreme Sky Shot (3 Pcs)', category: '2 Inch Fancy 3 Pcs Shots', mrp: 250, wholesalePrice: 250 },
  { id: '114', itemCode: 'CRK114', itemName: '2" Fancy Netflix Sky Shot (3 Pcs)', category: '2 Inch Fancy 3 Pcs Shots', mrp: 250, wholesalePrice: 250 },
  { id: '115', itemCode: 'CRK115', itemName: '2" Fancy Pinky Sky Shot (3 Pcs)', category: '2 Inch Fancy 3 Pcs Shots', mrp: 250, wholesalePrice: 250 },
  { id: '115', itemCode: 'CRK115', itemName: '3" Pandyan (3 Pcs)', category: '3 Inch Fancy 3 Pcs Shots', mrp: 500, wholesalePrice: 500 },

  // Page 5: 3½“ பேன்சி 2 பால் (Out) -> 3.5 Inch Fancy 2 Ball Shots
  { id: '116', itemCode: 'CRK116', itemName: 'Belli Belli 3.5" 2 Ball Shot (1 Pc)', category: '3.5 Inch Fancy 2 Ball Shots', mrp: 420, wholesalePrice: 420 },
  { id: '117', itemCode: 'CRK117', itemName: 'Chori Chori 3.5" 2 Ball Shot (1 Pc)', category: '3.5 Inch Fancy 2 Ball Shots', mrp: 420, wholesalePrice: 420 },

  // Page 5: ஸ்ரீ நாராயணா 3½“ பேன்சி (Out) -> Sri Narayana 3.5 Inch Fancy Shots
  { id: '118', itemCode: 'CRK118', itemName: 'Panchoon Red 3.5" Fancy Shot (1 Pc)', category: 'Sri Narayana 3.5 Inch Fancy Shots', mrp: 270, wholesalePrice: 270 },
  { id: '119', itemCode: 'CRK119', itemName: 'Twitter Green 3.5" Fancy Shot (1 Pc)', category: 'Sri Narayana 3.5 Inch Fancy Shots', mrp: 270, wholesalePrice: 270 },
  { id: '120', itemCode: 'CRK120', itemName: 'Warriors Silver 3.5" Fancy Shot (1 Pc)', category: 'Sri Narayana 3.5 Inch Fancy Shots', mrp: 270, wholesalePrice: 270 },

  // Page 5: ஸ்ரீ நாராயணா 4“ பேன்சி (Out) -> Sri Narayana 4 Inch Fancy Shots
  { id: '121', itemCode: 'CRK121', itemName: 'Sri Narayana 4" Fancy Shot - 3 Types (1 Pc)', category: 'Sri Narayana 4 Inch Fancy Shots', mrp: 340, wholesalePrice: 340 },

  // Page 5: 4“ பேன்சி 2 Pcs (Out) -> 4 Inch Fancy 2 Pcs Shots
  { id: '122', itemCode: 'CRK122', itemName: 'Fire Play 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },
  { id: '123', itemCode: 'CRK123', itemName: 'Green Signal 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },
  { id: '124', itemCode: 'CRK124', itemName: 'Niagara Falls 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },
  { id: '125', itemCode: 'CRK125', itemName: 'Paradise Dora 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },
  { id: '126', itemCode: 'CRK126', itemName: 'Rang Basanth 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },
  { id: '127', itemCode: 'CRK127', itemName: 'Raat Masti 4" Fancy Shot (2 Pcs)', category: '4 Inch Fancy 2 Pcs Shots', mrp: 660, wholesalePrice: 660 },

  // Page 5: 3 1/2 “ ஃபேன்சி ஸ்பெஷல் -> 3.5 Inch Fancy Special Shots
  { id: '128', itemCode: 'CRK128', itemName: 'Royal Palm Tree 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },
  { id: '129', itemCode: 'CRK129', itemName: 'Digital Mixer 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },
  { id: '130', itemCode: 'CRK130', itemName: 'Amazing Golden 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },
  { id: '131', itemCode: 'CRK131', itemName: 'Spyro Green 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },
  { id: '132', itemCode: 'CRK132', itemName: 'Red Boom Star 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },
  { id: '133', itemCode: 'CRK133', itemName: 'Max Fun 3.5" Special Shot (1 Pc)', category: '3.5 Inch Fancy Special Shots', mrp: 300, wholesalePrice: 300 },

  // Page 5: 5“ பேன்சி (2 Pcs) -> 5 Inch Fancy 2 Pcs Shots
  { id: '134', itemCode: 'CRK134', itemName: 'Beauty Lighting 5" Fancy Shot (2 Pcs)', category: '5 Inch Fancy 2 Pcs Shots', mrp: 880, wholesalePrice: 880 },
  { id: '135', itemCode: 'CRK135', itemName: 'Releasing King Beauty 5" Fancy Shot (2 Pcs)', category: '5 Inch Fancy 2 Pcs Shots', mrp: 880, wholesalePrice: 880 },
  { id: '136', itemCode: 'CRK136', itemName: 'Romantic Beauty 5" Fancy Shot (2 Pcs)', category: '5 Inch Fancy 2 Pcs Shots', mrp: 880, wholesalePrice: 880 },
  { id: '137', itemCode: 'CRK137', itemName: 'Glory Lines Beauty 5" Fancy Shot (2 Pcs)', category: '5 Inch Fancy 2 Pcs Shots', mrp: 880, wholesalePrice: 880 },

  // Page 5: 5“ பேன்சி (Out) -> 5 Inch Fancy Sky Shots
  { id: '138', itemCode: 'CRK138', itemName: 'Blue Special New 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 650, wholesalePrice: 650 },
  { id: '139', itemCode: 'CRK139', itemName: 'Bhayasaki Pink New 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 650, wholesalePrice: 650 },
  { id: '140', itemCode: 'CRK140', itemName: 'Tera Mera 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 620, wholesalePrice: 620 },
  { id: '141', itemCode: 'CRK141', itemName: 'Awaaz Baarish 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 620, wholesalePrice: 620 },
  { id: '142', itemCode: 'CRK142', itemName: 'Boomers 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 620, wholesalePrice: 620 },
  { id: '142', itemCode: 'CRK142', itemName: 'Golden Eye wow star 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 500, wholesalePrice: 500 },
  { id: '142', itemCode: 'CRK142', itemName: 'Star War wow star 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 500, wholesalePrice: 500 },
  { id: '142', itemCode: 'CRK142', itemName: 'Seven Step 5" Fancy Shot (1 Pc)', category: '5 Inch Fancy Sky Shots', mrp: 500, wholesalePrice: 500 },

  // Page 6: 6“ பேன்சி சோனி ஸ்பெஷல் -> 6 Inch Fancy Sony Special
  { id: '143', itemCode: 'CRK143', itemName: 'Oscar 6" Sony Special Shot (2 Pcs)', category: '6 Inch Fancy Sony Special', mrp: 1500, wholesalePrice: 1500 },
  { id: '144', itemCode: 'CRK144', itemName: 'Hercules 6" Sony Special Shot (2 Pcs)', category: '6 Inch Fancy Sony Special', mrp: 1500, wholesalePrice: 1500 },
  { id: '145', itemCode: 'CRK145', itemName: 'Kingsman 6" Sony Special Shot (2 Pcs)', category: '6 Inch Fancy Sony Special', mrp: 1500, wholesalePrice: 1500 },

  // Page 6: 6“ பேன்சி சிங்கிள் பீஸ் -> 6 Inch Fancy Single Piece
  { id: '146', itemCode: 'CRK146', itemName: 'Edge 6" Fancy Single Piece Shot (1 Box)', category: '6 Inch Fancy Single Piece', mrp: 900, wholesalePrice: 900 },

  // Page 6: ட்ரீ ஸீரிஷ் சூப்பர் மெகா -> Tree Series Super Mega
  { id: '147', itemCode: 'CRK147', itemName: 'Tree Max Super Mega Shot (2 Pcs)', category: 'Tree Series Super Mega', mrp: 1200, wholesalePrice: 1200 },
  { id: '148', itemCode: 'CRK148', itemName: 'Tree Power Super Mega Shot (2 Pcs)', category: 'Tree Series Super Mega', mrp: 1200, wholesalePrice: 1200 },
  { id: '149', itemCode: 'CRK149', itemName: 'Tree Force Super Mega Shot (2 Pcs)', category: 'Tree Series Super Mega', mrp: 1200, wholesalePrice: 1200 },

  // Page 6: ரிபிட்டிங் மல்டி கலர் ஷாட்ஸ் வித் கிராக்லிங் -> Repeating Multi Color Shots
  { id: '150', itemCode: 'CRK150', itemName: '12 Shots Multi Color Rider (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 200, wholesalePrice: 200 },
  { id: '151', itemCode: 'CRK151', itemName: '12 Shots Coco Multi Color (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 200, wholesalePrice: 200 },
  { id: '152', itemCode: 'CRK152', itemName: '25 Shots Luna Multi Color Long Box (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 425, wholesalePrice: 425 },
  { id: '153', itemCode: 'CRK153', itemName: '30 Shots Sri Narayana Multi Color (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 500, wholesalePrice: 500 },
  { id: '154', itemCode: 'CRK154', itemName: '30 Shots Multi Color Luna (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 450, wholesalePrice: 450 },
  { id: '155', itemCode: 'CRK155', itemName: '30 Shots Raja Jothi Multi Color (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 450, wholesalePrice: 450 },
  { id: '156', itemCode: 'CRK156', itemName: '25 Shots Whistling Multi Color (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 1100, wholesalePrice: 1100 },
  { id: '157', itemCode: 'CRK157', itemName: '60 Shots Multi Color Raja Jothi (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 900, wholesalePrice: 900 },
  { id: '158', itemCode: 'CRK158', itemName: '60 Shots Multi Color Sri Narayana (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 1000, wholesalePrice: 1000 },
  { id: '159', itemCode: 'CRK159', itemName: '200 Shots Multi Color - Annai (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 3300, wholesalePrice: 3300 },
  { id: '160', itemCode: 'CRK160', itemName: '120 Shots Multi Color Sri Narayana (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 1950, wholesalePrice: 1950 },
  { id: '161', itemCode: 'CRK161', itemName: '125 Shots Multi Color Crackling - Annai (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 2100, wholesalePrice: 2100 },
  { id: '162', itemCode: 'CRK162', itemName: '200 Shots Multi Color - Raja Jothi (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 3100, wholesalePrice: 3100 },
  { id: '163', itemCode: 'CRK163', itemName: '240 Shots Multi Color Sri Narayana (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 3400, wholesalePrice: 3400 },
  { id: '164', itemCode: 'CRK164', itemName: '520 Shots Ruthra Multi Color Mega Cake (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 8650, wholesalePrice: 8650 },
  { id: '165', itemCode: 'CRK165', itemName: '25 Shots Chakkar Spiderman (1 Pc)', category: 'Repeating Multi Color Shots', mrp: 1100, wholesalePrice: 1100 },

  // Page 6: ரிங்கேப் & கன் -> Ring Caps & Toy Guns
  { id: '166', itemCode: 'CRK166', itemName: 'Metal Gun Revolver Model (1 Pc)', category: 'Ring Caps & Toy Guns', mrp: 600, wholesalePrice: 600 },
  { id: '167', itemCode: 'CRK167', itemName: 'Ring Cap Gun Fancy Pistol (1 Pc)', category: 'Ring Caps & Toy Guns', mrp: 70, wholesalePrice: 70 },
  { id: '168', itemCode: 'CRK168', itemName: 'Ring Cap Gun Fancy SP18 PRO Cellphone Model (1 Pc)', category: 'Ring Caps & Toy Guns', mrp: 100, wholesalePrice: 100 },
  { id: '169', itemCode: 'CRK169', itemName: 'Ring Caps Box (1 Box)', category: 'Ring Caps & Toy Guns', mrp: 10, wholesalePrice: 10 },

  // Page 6: கிப்ட் பாக்ஸ் -> Gift Boxes
  { id: '170', itemCode: 'CRK170', itemName: 'Dance Dance Gift Box (50 Items)', category: 'Gift Boxes', mrp: 1250, wholesalePrice: 1250 },
  { id: '171', itemCode: 'CRK171', itemName: 'Kutti Kids Special Gift Box (31 Items)', category: 'Gift Boxes', mrp: 650, wholesalePrice: 650 },
  { id: '172', itemCode: 'CRK172', itemName: 'Sri Amman Thais Special Gift Box (31 Items)', category: 'Gift Boxes', mrp: 700, wholesalePrice: 700 },

  // Page 6: ப்ளாஷ் -> Mega Flash Crackers
  { id: '173', itemCode: 'CRK173', itemName: '1000 Flash Mega Sound (1 Box)', category: 'Mega Flash Crackers', mrp: 200, wholesalePrice: 200 },
  { id: '174', itemCode: 'CRK174', itemName: '2000 Flash Mega Sound (1 Box)', category: 'Mega Flash Crackers', mrp: 400, wholesalePrice: 400 },
  { id: '175', itemCode: 'CRK175', itemName: '5000 Flash Mega Sound (1 Box)', category: 'Mega Flash Crackers', mrp: 1000, wholesalePrice: 1000 },
  { id: '176', itemCode: 'CRK176', itemName: '10000 Flash Mega Sound (1 Box)', category: 'Mega Flash Crackers', mrp: 2000, wholesalePrice: 2000 },
  { id: '177', itemCode: 'CRK177', itemName: 'Color Smoke Cylinder Bomb (1 Box)', category: 'Mega Flash Crackers', mrp: 165, wholesalePrice: 165 },
  { id: '178', itemCode: 'CRK178', itemName: 'Gold Shower Cylinder Bomb (1 Box)', category: 'Mega Flash Crackers', mrp: 165, wholesalePrice: 165 }
];

module.exports = { items };
