/**
 * Local Question Bank — Fallback when Gemini API is unavailable
 * 20 questions per category × difficulty. 10 are randomly picked per test.
 */
const questionBank = {
  'Quantitative Aptitude': {
    Easy: [
      { question: "What is 15% of 200?", options: ["25", "30", "35", "40"], correctAnswer: "30" },
      { question: "If a train travels 60 km in 1 hour, how far does it travel in 2.5 hours?", options: ["120 km", "150 km", "180 km", "200 km"], correctAnswer: "150 km" },
      { question: "What is the square root of 144?", options: ["10", "11", "12", "13"], correctAnswer: "12" },
      { question: "A shopkeeper buys an article for ₹200 and sells it for ₹250. What is the profit percentage?", options: ["20%", "25%", "30%", "15%"], correctAnswer: "25%" },
      { question: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "16"], correctAnswer: "12" },
      { question: "If 5x = 25, then x = ?", options: ["3", "4", "5", "6"], correctAnswer: "5" },
      { question: "A rectangle has length 8 cm and width 5 cm. What is its area?", options: ["30 cm²", "35 cm²", "40 cm²", "45 cm²"], correctAnswer: "40 cm²" },
      { question: "What is 3/4 of 80?", options: ["50", "55", "60", "65"], correctAnswer: "60" },
      { question: "How many seconds are in 2 hours?", options: ["3600", "5400", "7200", "9000"], correctAnswer: "7200" },
      { question: "The average of 10, 20, 30, 40 and 50 is:", options: ["25", "30", "35", "40"], correctAnswer: "30" },
      { question: "What is 2⁵?", options: ["16", "24", "32", "64"], correctAnswer: "32" },
      { question: "A car covers 300 km in 5 hours. What is its speed?", options: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"], correctAnswer: "60 km/h" },
      { question: "What is the HCF of 12 and 18?", options: ["4", "6", "8", "9"], correctAnswer: "6" },
      { question: "If a shirt costs ₹500 after a 20% discount, what was its original price?", options: ["₹600", "₹625", "₹650", "₹700"], correctAnswer: "₹625" },
      { question: "What is 48 ÷ 6 × 2?", options: ["4", "8", "16", "24"], correctAnswer: "16" },
      { question: "The perimeter of a square with side 7 cm is:", options: ["21 cm", "28 cm", "35 cm", "49 cm"], correctAnswer: "28 cm" },
      { question: "What is 0.25 expressed as a fraction?", options: ["1/2", "1/4", "1/5", "1/8"], correctAnswer: "1/4" },
      { question: "If 8 items cost ₹120, what is the cost of 5 items?", options: ["₹65", "₹70", "₹75", "₹80"], correctAnswer: "₹75" },
      { question: "What is 12² − 10²?", options: ["22", "44", "44", "144"], correctAnswer: "44" },
      { question: "A worker earns ₹400 per day. How much does he earn in 15 days?", options: ["₹5500", "₹6000", "₹6500", "₹7000"], correctAnswer: "₹6000" }
    ],
    Medium: [
      { question: "Two pipes A and B can fill a tank in 20 and 30 minutes. If both are opened together, how long to fill the tank?", options: ["10 min", "12 min", "15 min", "18 min"], correctAnswer: "12 min" },
      { question: "A sum of money doubles in 10 years at simple interest. What is the rate of interest?", options: ["5%", "8%", "10%", "12%"], correctAnswer: "10%" },
      { question: "If the ratio of two numbers is 3:5 and their sum is 120, the larger number is:", options: ["45", "60", "72", "75"], correctAnswer: "75" },
      { question: "A boat travels 24 km upstream in 6 hours and 20 km downstream in 4 hours. Speed of current:", options: ["1 km/h", "2 km/h", "3 km/h", "4 km/h"], correctAnswer: "1 km/h" },
      { question: "What is 35% of 420?", options: ["137", "147", "157", "167"], correctAnswer: "147" },
      { question: "If the compound interest on ₹1000 for 2 years at 10% p.a. is:", options: ["₹200", "₹210", "₹220", "₹250"], correctAnswer: "₹210" },
      { question: "In a class of 40 students, 25% play cricket. How many students play cricket?", options: ["8", "10", "12", "15"], correctAnswer: "10" },
      { question: "The cost price of an item is ₹800. If sold at 12.5% profit, selling price is:", options: ["₹850", "₹875", "₹900", "₹950"], correctAnswer: "₹900" },
      { question: "If x + y = 10 and x − y = 4, then xy = ?", options: ["16", "18", "21", "24"], correctAnswer: "21" },
      { question: "A train 200m long passes a pole in 10 seconds. Speed in km/h:", options: ["60", "70", "72", "80"], correctAnswer: "72" },
      { question: "Find the next term: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "48"], correctAnswer: "42" },
      { question: "The diagonal of a square is 10√2. Its area is:", options: ["50", "100", "150", "200"], correctAnswer: "100" },
      { question: "A man walks at 4 km/h and cycles at 16 km/h. Total 5 hours for 40 km. How long walking?", options: ["1 hr", "1.5 hr", "2 hr", "2.5 hr"], correctAnswer: "1.5 hr" },
      { question: "The sum of first 20 natural numbers is:", options: ["180", "190", "200", "210"], correctAnswer: "210" },
      { question: "A 20% loss on selling an item for ₹400. Cost price is:", options: ["₹450", "₹480", "₹500", "₹520"], correctAnswer: "₹500" },
      { question: "Three numbers are in AP. Their sum is 27 and product is 648. Middle number:", options: ["7", "8", "9", "10"], correctAnswer: "9" },
      { question: "If a:b = 2:3 and b:c = 4:5, then a:c = ?", options: ["6:10", "8:15", "8:12", "10:15"], correctAnswer: "8:15" },
      { question: "8 men can do a work in 12 days. How many men needed to finish in 6 days?", options: ["12", "14", "16", "18"], correctAnswer: "16" },
      { question: "Circumference of a circle with diameter 14 cm (π=22/7):", options: ["42 cm", "44 cm", "46 cm", "48 cm"], correctAnswer: "44 cm" },
      { question: "The difference between simple and compound interest on ₹5000 at 4% for 2 years:", options: ["₹6", "₹8", "₹10", "₹12"], correctAnswer: "₹8" }
    ],
    Hard: [
      { question: "A sum triples in 15 years at simple interest. Rate per annum:", options: ["10%", "12%", "13.33%", "15%"], correctAnswer: "13.33%" },
      { question: "A cistern can be filled by A in 4 hrs and by B in 6 hrs, but emptied by C in 8 hrs. Time to fill if all open:", options: ["9.6 hrs", "8 hrs", "10 hrs", "12 hrs"], correctAnswer: "9.6 hrs" },
      { question: "A train overtakes two persons in 8 and 10 seconds walking at 2 and 4 km/h. Length of train:", options: ["50 m", "72 m", "100 m", "120 m"], correctAnswer: "50 m" },
      { question: "Find the remainder when 2¹⁰⁰ is divided by 7:", options: ["1", "2", "3", "4"], correctAnswer: "2" },
      { question: "A man sells 18 articles at the cost price of 24. Profit %:", options: ["25%", "30%", "33.33%", "40%"], correctAnswer: "33.33%" },
      { question: "The sides of a triangle are 13, 14, 15. Its area is:", options: ["84", "90", "96", "100"], correctAnswer: "84" },
      { question: "log₂(32) + log₃(9) = ?", options: ["7", "8", "9", "10"], correctAnswer: "7" },
      { question: "A can do a work in 10 days, B in 15 days. They work alternately starting with A. Days to finish:", options: ["12", "13", "12.5", "14"], correctAnswer: "12.5" },
      { question: "If x² - 5x + 6 = 0, then x = ?", options: ["2, 3", "1, 6", "2, 4", "-2, -3"], correctAnswer: "2, 3" },
      { question: "Volume of a cone with radius 7 cm and height 9 cm (π=22/7):", options: ["446 cm³", "462 cm³", "480 cm³", "500 cm³"], correctAnswer: "462 cm³" },
      { question: "How many 3-digit numbers are divisible by both 4 and 6?", options: ["50", "62", "75", "83"], correctAnswer: "75" },
      { question: "The probability of picking 2 red balls from a bag of 5 red and 4 blue balls:", options: ["5/18", "10/36", "5/18", "2/9"], correctAnswer: "5/18" },
      { question: "If a² + b² = 100 and ab = 48, then a + b = ?", options: ["14", "16", "18", "20"], correctAnswer: "14" },
      { question: "A dishonest merchant uses 900g weight instead of 1kg. Profit %:", options: ["9%", "10%", "11.11%", "12.5%"], correctAnswer: "11.11%" },
      { question: "Series: 1, 8, 27, 64, _. Next term:", options: ["100", "125", "144", "216"], correctAnswer: "125" },
      { question: "Arithmetic mean of 5 numbers is 40. If one number is removed, mean becomes 35. Removed number:", options: ["55", "60", "65", "70"], correctAnswer: "60" },
      { question: "Two circles of radius 5 cm and 3 cm. Distance between centers = 10 cm. Common tangents:", options: ["1", "2", "3", "4"], correctAnswer: "3" },
      { question: "Speed of sound is 330 m/s. Echo heard after 2 sec. Distance from wall:", options: ["165 m", "330 m", "500 m", "660 m"], correctAnswer: "330 m" },
      { question: "Solve: 4^(x+1) = 256. Value of x:", options: ["2", "3", "4", "5"], correctAnswer: "3" },
      { question: "A mixture of milk:water = 5:1. To make ratio 5:3, quantity of water to add per litre:", options: ["1/5", "1/3", "2/5", "1/2"], correctAnswer: "2/5" }
    ]
  },
  'Logical Reasoning': {
    Easy: [
      { question: "Find the odd one out: Dog, Cat, Parrot, Sparrow, Pigeon", options: ["Dog", "Cat", "Parrot", "Sparrow"], correctAnswer: "Dog" },
      { question: "If APPLE is coded as BQQMF, then MANGO is coded as:", options: ["NBOHP", "NBOHO", "NCOIP", "MBOHP"], correctAnswer: "NBOHP" },
      { question: "A is father of B. B is sister of C. C is son of D. How is A related to D?", options: ["Father", "Father-in-law", "Brother", "Uncle"], correctAnswer: "Father-in-law" },
      { question: "Pointing to a boy, a girl says 'He is the son of my father's only son.' How is the boy related to the girl?", options: ["Brother", "Nephew", "Son", "Cousin"], correctAnswer: "Son" },
      { question: "Which number comes next: 2, 4, 8, 16, 32, ?", options: ["48", "54", "64", "72"], correctAnswer: "64" },
      { question: "BOOK : LIBRARY :: PAINTING : ?", options: ["Artist", "Museum", "School", "Brush"], correctAnswer: "Museum" },
      { question: "If in a code language, 'CAT' is written as 'ECU', then 'DOG' is written as:", options: ["FQI", "FPI", "EQI", "GPJ"], correctAnswer: "FQI" },
      { question: "Which shape is different: Circle, Sphere, Square, Triangle", options: ["Circle", "Sphere", "Square", "Triangle"], correctAnswer: "Sphere" },
      { question: "Complete the series: Z, X, V, T, R, ?", options: ["P", "Q", "O", "S"], correctAnswer: "P" },
      { question: "If A = 1, B = 2... Z = 26, what is the sum of CAT?", options: ["24", "26", "28", "30"], correctAnswer: "24" },
      { question: "All cats are animals. All animals need food. Therefore:", options: ["All food is for cats", "All cats need food", "Some food is for animals", "Cats don't need food"], correctAnswer: "All cats need food" },
      { question: "Mirror image: If 3 is to the right of 4, in the mirror it is:", options: ["3 right of 4", "4 right of 3", "Unchanged", "Inverted"], correctAnswer: "4 right of 3" },
      { question: "A clock shows 3:15. Angle between hour and minute hand:", options: ["0°", "7.5°", "15°", "22.5°"], correctAnswer: "7.5°" },
      { question: "If yesterday was Monday, what day will be after tomorrow?", options: ["Wednesday", "Thursday", "Friday", "Saturday"], correctAnswer: "Thursday" },
      { question: "RICE : COOK :: WOOD : ?", options: ["Tree", "Paper", "Carpenter", "Forest"], correctAnswer: "Carpenter" },
      { question: "Find the missing: 3, 7, 13, 21, 31, ?", options: ["41", "43", "45", "47"], correctAnswer: "43" },
      { question: "Rearrange: RICED = ?", options: ["RIDER", "CIDER", "DICER", "RICER"], correctAnswer: "CIDER" },
      { question: "Which letter is 4th to the right of the 12th letter from the left?", options: ["O", "P", "Q", "R"], correctAnswer: "P" },
      { question: "Statement: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.", options: ["True", "False", "Uncertain", "Cannot say"], correctAnswer: "Uncertain" },
      { question: "Find odd one: 121, 144, 169, 196, 225, 250", options: ["169", "196", "225", "250"], correctAnswer: "250" }
    ],
    Medium: [
      { question: "In a row of 40 children, A is 11th from the left and B is 31st from right. How many children are between them?", options: ["0", "1", "2", "3"], correctAnswer: "0" },
      { question: "P, Q, R, S sit in a circle facing center. P is 2nd to Q's right. R is opposite P. S is to R's right. Who is to Q's left?", options: ["P", "R", "S", "Cannot say"], correctAnswer: "S" },
      { question: "Which diagram correctly shows relation: Doctors, Women, Lawyers?", options: ["Overlapping circles", "Concentric circles", "One inside another", "Separate circles"], correctAnswer: "Overlapping circles" },
      { question: "6 persons A-F. A is 3rd to F's right. C is between B and D. E is not next to A. Arrangement:", options: ["BECADF", "BFCEAD", "BCDAEF", "Cannot determine"], correctAnswer: "Cannot determine" },
      { question: "Cube painted red outside, cut into 27 small cubes. How many cubes have exactly 2 red faces?", options: ["6", "8", "10", "12"], correctAnswer: "12" },
      { question: "If the 1st and 4th letters of PAINT are interchanged along with 2nd and 5th, result:", options: ["TAPNI", "NIPAT", "TNIPA", "TIPAN"], correctAnswer: "TIPAN" },
      { question: "A is 3 years older than B. B is twice C's age. C is 5 years old. A's age:", options: ["11", "12", "13", "14"], correctAnswer: "13" },
      { question: "Find the missing: 2, 3, 5, 8, 13, 21, ?", options: ["29", "31", "33", "34"], correctAnswer: "34" },
      { question: "6 books arranged: Maths not first or last. Science next to Maths. English between History and Science. First book:", options: ["History", "English", "Physics", "Chemistry"], correctAnswer: "History" },
      { question: "Water image of '12:45' appears as:", options: ["12:45", "3:15", "9:15", "6:45"], correctAnswer: "9:15" },
      { question: "All men are mortal. Socrates is mortal. Therefore:", options: ["Socrates is a man", "Socrates may be a man", "All mortals are men", "None of these"], correctAnswer: "Socrates may be a man" },
      { question: "A series: 1, 1, 2, 3, 5, 8, 13. Next number:", options: ["18", "20", "21", "24"], correctAnswer: "21" },
      { question: "If Jan 1 is Monday 2024, what day is March 1?", options: ["Thursday", "Friday", "Saturday", "Sunday"], correctAnswer: "Friday" },
      { question: "Three containers have juice and water in ratios 1:2, 3:4, 5:6. Mixed equally. Overall ratio:", options: ["95:135", "33:47", "15:23", "Other"], correctAnswer: "Other" },
      { question: "A man goes 10 km North, 6 km East, 4 km South. Shortest distance from start:", options: ["10 km", "12 km", "10√2 km", "8 km"], correctAnswer: "10 km" },
      { question: "Find ODD: 8-15-17, 5-12-13, 7-24-25, 9-40-41", options: ["8-15-17", "5-12-13", "7-24-25", "9-40-41"], correctAnswer: "9-40-41" },
      { question: "Complete: AZ, BY, CX, DW, ?", options: ["EV", "EU", "FV", "EW"], correctAnswer: "EV" },
      { question: "A man points to a photograph: 'His mother is my mother's only daughter.' Relation:", options: ["Son", "Nephew", "Father", "Brother"], correctAnswer: "Son" },
      { question: "Series: 4, 12, 36, 108, ?", options: ["216", "324", "432", "540"], correctAnswer: "324" },
      { question: "Coded: CAR=3, BIKE=4, TRUCK=5. BUS=?", options: ["2", "3", "4", "5"], correctAnswer: "3" }
    ],
    Hard: [
      { question: "A, B, C, D, E, F, G, H sit around a circle. B is between A and C. D is 3rd right of B. H is not next to D or A. G is between H and F. E's position:", options: ["Between C and D", "Opposite B", "Between D and F", "Cannot determine"], correctAnswer: "Cannot determine" },
      { question: "All A are B. Some B are C. No C is D. Conclusions: I. Some A are C. II. No D is B.", options: ["Only I follows", "Only II follows", "Both follow", "Neither follows"], correctAnswer: "Neither follows" },
      { question: "Pattern: Z1A, Y2B, X3C, W4D... 10th term:", options: ["Q10J", "Q10K", "P10J", "R10K"], correctAnswer: "Q10J" },
      { question: "Input: bat 33 war 51 box 12 cat 87. Step 1: Numbers ascending. Step 2: Words alphabetical between numbers. Step 3 output:", options: ["12 bat 33 box 51 cat 87 war", "12 33 51 87 bat box cat war", "bat 12 box 33 cat 51 war 87", "Other"], correctAnswer: "12 bat 33 box 51 cat 87 war" },
      { question: "Cube of side 6 cm painted, cut into 1cm cubes. How many have exactly 1 face painted?", options: ["24", "48", "64", "96"], correctAnswer: "96" },
      { question: "If 25 * 3 = 21, 14 * 2 = 10, 36 * 5 = 31, then 43 * 7 = ?", options: ["34", "36", "38", "40"], correctAnswer: "36" },
      { question: "A is taller than B, shorter than C. D is taller than E, shorter than A. Shortest among A,B,C,D,E:", options: ["B or E", "B", "E", "Cannot say"], correctAnswer: "B or E" },
      { question: "Series: 3, 8, 18, 38, 78, ?", options: ["128", "148", "158", "168"], correctAnswer: "158" },
      { question: "Odd one: MPN, QTR, UXV, YBZ, CFD", options: ["MPN", "QTR", "CFD", "YBZ"], correctAnswer: "CFD" },
      { question: "8 persons: A-H. 4 pairs of couples. A is D's husband. E is B's wife. G is C's wife. H is F's husband. C is A's daughter. B and D are siblings. F is the son of E. Youngest generation:", options: ["C and F", "C, F and H", "C only", "F only"], correctAnswer: "C and F" },
      { question: "Statement: All tables are chairs. Some chairs are desks. No desk is a stool. Conclusions: I. Some tables are desks. II. No stool is a chair.", options: ["Only I", "Only II", "Both", "Neither"], correctAnswer: "Neither" },
      { question: "Next in series: 2, 5, 10, 17, 26, 37, ?", options: ["48", "49", "50", "51"], correctAnswer: "50" },
      { question: "Three containers have 12L, 18L, 30L of milk. Largest vessel to measure all exactly:", options: ["4L", "5L", "6L", "9L"], correctAnswer: "6L" },
      { question: "Find the missing: ?, 30, 56, 90, 132", options: ["12", "14", "16", "20"], correctAnswer: "12" },
      { question: "A word is formed with letters of STRANGE. Probability it starts with R:", options: ["1/7", "1/6", "2/7", "1/4"], correctAnswer: "1/7" },
      { question: "Matrix: 9,3,1 | 25,5,1 | 49,7,1 | ?,11,1", options: ["100", "121", "144", "169"], correctAnswer: "121" },
      { question: "ABCDEFG are 7 friends with different heights. C > A > E. F > G > B. D > F > C. Shortest:", options: ["A", "B", "E", "G"], correctAnswer: "B" },
      { question: "If 2nd and 6th letters of COMPLICATED are interchanged along with 3rd & 7th, 4th & 8th... New word:", options: ["CILCMOPATED", "CPMLICATED", "CPLICOMATED", "Other"], correctAnswer: "Other" },
      { question: "Find the odd: 2-3-7, 3-5-17, 4-7-31, 5-9-51", options: ["2-3-7", "3-5-17", "4-7-31", "5-9-51"], correctAnswer: "5-9-51" },
      { question: "100 people: 45 read A, 30 read B, 25 read C. 10 read A&B, 8 read B&C, 5 read A&C. 3 read all. Read none:", options: ["10", "12", "13", "15"], correctAnswer: "13" }
    ]
  },
  'Verbal Ability': {
    Easy: [
      { question: "Choose the synonym of HAPPY:", options: ["Sad", "Joyful", "Angry", "Tired"], correctAnswer: "Joyful" },
      { question: "Choose the antonym of BRAVE:", options: ["Strong", "Bold", "Cowardly", "Smart"], correctAnswer: "Cowardly" },
      { question: "Fill in the blank: She ___ to school every day.", options: ["go", "goes", "going", "went"], correctAnswer: "goes" },
      { question: "Find the correctly spelled word:", options: ["Recieve", "Receive", "Receve", "Receeve"], correctAnswer: "Receive" },
      { question: "Choose the meaning of 'Benevolent':", options: ["Cruel", "Kind and generous", "Lazy", "Angry"], correctAnswer: "Kind and generous" },
      { question: "Identify the noun: 'The beautiful girl sang a lovely song.'", options: ["beautiful", "sang", "lovely", "girl"], correctAnswer: "girl" },
      { question: "Choose the correct passive voice: 'She writes a letter.'", options: ["A letter is written by her", "A letter was written by her", "A letter will be written by her", "A letter written by her"], correctAnswer: "A letter is written by her" },
      { question: "Which word is a conjunction?", options: ["Quickly", "And", "Beautiful", "Run"], correctAnswer: "And" },
      { question: "The word 'Audacious' means:", options: ["Timid", "Fearless and bold", "Careful", "Polite"], correctAnswer: "Fearless and bold" },
      { question: "Fill in: He is good ___ mathematics.", options: ["in", "at", "on", "of"], correctAnswer: "at" },
      { question: "Identify the adjective: 'The tall man entered the room.'", options: ["man", "entered", "tall", "room"], correctAnswer: "tall" },
      { question: "Choose the plural of 'Child':", options: ["Childs", "Childes", "Children", "Childrens"], correctAnswer: "Children" },
      { question: "Synonym of BEAUTIFUL:", options: ["Ugly", "Pretty", "Dull", "Plain"], correctAnswer: "Pretty" },
      { question: "Choose correct tense: 'By tomorrow, I ___ the book.'", options: ["read", "reading", "will have read", "have read"], correctAnswer: "will have read" },
      { question: "Antonym of ANCIENT:", options: ["Old", "Modern", "Historic", "Classic"], correctAnswer: "Modern" },
      { question: "One word substitution: 'A place where birds are kept':", options: ["Aquarium", "Aviary", "Kennel", "Stable"], correctAnswer: "Aviary" },
      { question: "Identify the verb: 'The cat jumped over the fence.'", options: ["cat", "jumped", "over", "fence"], correctAnswer: "jumped" },
      { question: "'Panacea' means:", options: ["A cure for all diseases", "A type of bread", "A musical instrument", "A foreign language"], correctAnswer: "A cure for all diseases" },
      { question: "Choose the correct spelling:", options: ["Accommodation", "Accomodation", "Accommadation", "Accomodatoin"], correctAnswer: "Accommodation" },
      { question: "Fill in: Neither the boys nor the girl ___ responsible.", options: ["are", "is", "were", "have been"], correctAnswer: "is" }
    ],
    Medium: [
      { question: "Choose the word closest in meaning to EPHEMERAL:", options: ["Eternal", "Transient", "Permanent", "Ancient"], correctAnswer: "Transient" },
      { question: "Identify the error: 'He don't know the answer to the question.'", options: ["He", "don't", "answer", "question"], correctAnswer: "don't" },
      { question: "Complete the analogy: Hunger : Food :: Thirst : ?", options: ["Sleep", "Water", "Rest", "Air"], correctAnswer: "Water" },
      { question: "One word substitution: 'Fear of heights':", options: ["Agoraphobia", "Claustrophobia", "Acrophobia", "Hydrophobia"], correctAnswer: "Acrophobia" },
      { question: "Identify the figure of speech: 'The wind howled angrily.'", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], correctAnswer: "Personification" },
      { question: "Which sentence is grammatically correct?", options: ["She suggested him to leave", "She suggested that he leave", "She suggested him leaving", "She suggested he to leave"], correctAnswer: "She suggested that he leave" },
      { question: "Antonym of VERBOSE:", options: ["Talkative", "Concise", "Elaborate", "Detailed"], correctAnswer: "Concise" },
      { question: "Choose the idiom meaning 'to cost a lot of money':", options: ["Break a leg", "Cost an arm and a leg", "Hit the nail on the head", "Under the weather"], correctAnswer: "Cost an arm and a leg" },
      { question: "Fill in: He behaves as if he ___ the owner.", options: ["is", "was", "were", "be"], correctAnswer: "were" },
      { question: "Rearrange: THOUGH/HARD/WORKED/HE/PASSED/NOT/HE", options: ["He worked hard though he not passed", "Though he worked hard, he did not pass", "He not passed though worked hard", "Hard though he worked he passed not"], correctAnswer: "Though he worked hard, he did not pass" },
      { question: "The word 'Laconic' means:", options: ["Talkative", "Using few words", "Emotional", "Careful"], correctAnswer: "Using few words" },
      { question: "Indirect speech: He said, 'I am going to Delhi.' becomes:", options: ["He said he was going to Delhi", "He said he is going to Delhi", "He said he will go to Delhi", "He said I was going to Delhi"], correctAnswer: "He said he was going to Delhi" },
      { question: "Choose the correct sentence:", options: ["Less people came", "Fewer people came", "Little people came", "Small people came"], correctAnswer: "Fewer people came" },
      { question: "Synonym of MAGNANIMOUS:", options: ["Petty", "Generous", "Selfish", "Timid"], correctAnswer: "Generous" },
      { question: "Comprehension: A person who cannot be bribed is:", options: ["Incorrigible", "Incorruptible", "Infallible", "Ineffable"], correctAnswer: "Incorruptible" },
      { question: "Spot the error: 'She is one of the girls who has won the prize.'", options: ["She is one", "of the girls", "who has", "won the prize"], correctAnswer: "who has" },
      { question: "Choose the correct preposition: 'She has been ill ___ Monday.'", options: ["from", "for", "since", "during"], correctAnswer: "since" },
      { question: "Antonym of COMPLACENT:", options: ["Satisfied", "Dissatisfied", "Pleased", "Content"], correctAnswer: "Dissatisfied" },
      { question: "Identify: 'As brave as a lion.'", options: ["Metaphor", "Simile", "Alliteration", "Oxymoron"], correctAnswer: "Simile" },
      { question: "One word for 'A person who is new to a job or situation':", options: ["Expert", "Novice", "Veteran", "Master"], correctAnswer: "Novice" }
    ],
    Hard: [
      { question: "Synonym of OBFUSCATE:", options: ["Clarify", "Confuse", "Simplify", "Explain"], correctAnswer: "Confuse" },
      { question: "Sentence with correct usage of 'whom':", options: ["Whom is calling?", "To whom did you speak?", "Whom are you?", "Whom called me?"], correctAnswer: "To whom did you speak?" },
      { question: "Identify the rhetorical device: 'Ask not what your country can do for you.'", options: ["Anaphora", "Antithesis", "Chiasmus", "Epiphora"], correctAnswer: "Chiasmus" },
      { question: "The term 'Sesquipedalian' refers to:", options: ["One who studies history", "One who uses long words", "A rare bird species", "An ancient ritual"], correctAnswer: "One who uses long words" },
      { question: "Antonym of GARRULOUS:", options: ["Talkative", "Reserved", "Eloquent", "Fluent"], correctAnswer: "Reserved" },
      { question: "Error: 'Had I been there, I will have helped them.'", options: ["Had I", "been there", "I will", "helped them"], correctAnswer: "I will" },
      { question: "Cloze: In ___ to the rising crime, the government ___ stricter laws.", options: ["response, imposed", "respond, impose", "responding, imposing", "response, imposing"], correctAnswer: "response, imposed" },
      { question: "'Pyrrhic victory' means:", options: ["A decisive win", "A win at too great a cost", "A surprise win", "A fair win"], correctAnswer: "A win at too great a cost" },
      { question: "Identify: 'Life is a roller coaster.'", options: ["Simile", "Metaphor", "Personification", "Irony"], correctAnswer: "Metaphor" },
      { question: "Correctly punctuated: 'Lets eat Grandma' should be:", options: ["Lets eat, Grandma!", "Let's eat Grandma!", "Let's eat, Grandma!", "Lets eat Grandma!"], correctAnswer: "Let's eat, Grandma!" },
      { question: "Synonym of PUSILLANIMOUS:", options: ["Brave", "Cowardly", "Generous", "Honest"], correctAnswer: "Cowardly" },
      { question: "Indirect: 'Will you help me?' he asked. Becomes:", options: ["He asked if I will help him", "He asked if I would help him", "He asked would I help him", "He asked me to help him"], correctAnswer: "He asked if I would help him" },
      { question: "'Oxymoron' in: 'Deafening silence':", options: ["Yes, it's an oxymoron", "No, it's a simile", "No, it's a metaphor", "No, it's alliteration"], correctAnswer: "Yes, it's an oxymoron" },
      { question: "Best synonym for ICONOCLAST:", options: ["Traditionalist", "Radical reformer", "Conservative", "Conformist"], correctAnswer: "Radical reformer" },
      { question: "Error: 'Neither of the students have submitted their assignment.'", options: ["Neither of", "students have", "submitted their", "assignment"], correctAnswer: "students have" },
      { question: "One word for 'Killing of one's own brother':", options: ["Patricide", "Fratricide", "Homicide", "Infanticide"], correctAnswer: "Fratricide" },
      { question: "Antonym of SANGUINE:", options: ["Optimistic", "Pessimistic", "Cheerful", "Confident"], correctAnswer: "Pessimistic" },
      { question: "Sentence showing 'litotes' (understatement):", options: ["She is the best!", "That's not bad at all!", "He's a giant!", "Life is short"], correctAnswer: "That's not bad at all!" },
      { question: "Fill in: ___ to say, he was the most talented person in the room.", options: ["Needlessly", "Needless", "Needful", "Needed"], correctAnswer: "Needless" },
      { question: "Cloze: The committee ___ its decision after ___ all the evidence.", options: ["announce, consider", "announced, considering", "announcing, considered", "announces, considers"], correctAnswer: "announced, considering" }
    ]
  }
};

/**
 * Returns 10 random questions for the given category and difficulty.
 */
const getRandomQuestions = (category, difficulty) => {
  const pool = questionBank[category]?.[difficulty];
  if (!pool || pool.length === 0) return [];

  // Fisher-Yates shuffle and pick 10
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(10, shuffled.length)).map(q => ({
    ...q,
    category,
    difficulty
  }));
};

module.exports = { getRandomQuestions };
