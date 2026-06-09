export interface Task {
  id: string;
  subject: 'Accounting' | 'Business Studies' | 'ICT' | 'General';
  title: string;
  duration: string;
  isPaper?: boolean;
}

export interface DayPlan {
  day: number;
  dateStr: string;
  phase: string;
  phasePhaseNumber: number;
  tasks: Task[];
}

const getPhase = (day: number) => {
  if (day <= 22) return { name: 'ROUTINE A: DAYS 01 - 22 (සිද්ධාන්ත හා ප්‍රායෝගික තර්කන මාස්ටරි)', num: 1 };
  if (day <= 62) return { name: 'ROUTINE B: DAYS 23 - 62 (THE ACTUAL EXAM BODY-CLOCK SIMULATION)', num: 2 };
  return { name: 'PHASE 3: SPEED, SIMULATION & ERROR ELIMINATION (DAYS 63 - 77)', num: 3 };
};

const customPlan85Days = [
  // Day 01
  [{ id: 'd1-bs', subject: 'Business Studies', title: 'Unit 4: කළමනාකරණ මූලධර්ම තියරි + 2015-2018 Essays.', duration: '4 Hours' },
   { id: 'd1-ac', subject: 'Accounting', title: 'MCQ 15 + ප්‍රාග්ධන/ජංගම ගිණුම් තියරි + 2012, 2013 ගණන්.', duration: '3.5 Hours' },
   { id: 'd1-ict', subject: 'ICT', title: 'Unit 4: Subnetting මූලධර්ම + IP Addressing MCQ 15ක්.', duration: '2.5 Hours' }],
  // Day 02
  [{ id: 'd2-bs', subject: 'Business Studies', title: 'Unit 4: ප්‍රේරක න්‍යායන් (Maslow/Herzberg) + කෙටි ප්‍රශ්න.', duration: '4 Hours' },
   { id: 'd2-ac', subject: 'Accounting', title: 'MCQ 15 + හවුල් වැටුප්, පොලී ගැලපුම් + 2014, 2015 ගණන්.', duration: '3.5 Hours' },
   { id: 'd2-ict', subject: 'ICT', title: 'Unit 4: OSI හා TCP/IP මාදිලි + Networking Essays 2ක්.', duration: '2.5 Hours' }],
  // Day 03
  [{ id: 'd3-bs', subject: 'Business Studies', title: 'Unit 4: නායකත්ව විලාසයන් + 2024 පේපර් එකේ 45 ප්‍රශ්නය.', duration: '4 Hours' },
   { id: 'd3-ac', subject: 'Accounting', title: 'MCQ 15 + හවුල්කරුවන් බඳවා ගැනීම්/විශ්‍රාම ගැන්වීම් + 2016, 2017 ගණන්.', duration: '3.5 Hours' },
   { id: 'd3-ict', subject: 'ICT', title: 'Unit 7 (Python): දත්ත ප්‍රභේද, විචල්‍ය + Live Compiler.', duration: '2.5 Hours' }],
  // Day 04
  [{ id: 'd4-bs', subject: 'Business Studies', title: 'Unit 5: අලෙවිකරණ සංකල්ප + 2024 පේපර් එකේ 42 ප්‍රශ්නය.', duration: '4 Hours' },
   { id: 'd4-ac', subject: 'Accounting', title: 'MCQ 15 + 2018-2021 දක්වා ආපු හවුල් ව්‍යාපාර ප්‍රශ්න.', duration: '3.5 Hours' },
   { id: 'd4-ict', subject: 'ICT', title: 'Unit 7 (Python): Loop Tracing + Live Debugging.', duration: '2.5 Hours' }],
  // Day 05
  [{ id: 'd5-bs', subject: 'Business Studies', title: 'Unit 5: වෙළඳපොළ ඛණ්ඩනය + 2015-2019 Marketing Essays.', duration: '4 Hours' },
   { id: 'd5-ac', subject: 'Accounting', title: 'MCQ 15 + 2022-2024 හවුල් ව්‍යාපාර ප්‍රශ්න (හවුල් අවසන්).', duration: '3.5 Hours' },
   { id: 'd5-ict', subject: 'ICT', title: 'Unit 7 (Python): Lists සහ Functions භාවිතය + Coding ප්‍රශ්න.', duration: '2.5 Hours' }],
  // Day 06
  [{ id: 'd6-gen', subject: 'General', title: 'CATCH-UP DAY 01: මුල් දින 5 ඇතුළත මඟහැරුණු දේවල් කවර් කර මනස රීසෙට් කරගන්නා Buffer දිනය.', duration: '10 Hours' }],
  // Day 07
  [{ id: 'd7-bs', subject: 'Business Studies', title: 'Unit 5: අලෙවිකරණ මිශ්‍රණය (4Ps / 7Ps) + 2020-2024 Essays.', duration: '4 Hours' },
   { id: 'd7-ac', subject: 'Accounting', title: 'MCQ 15 + මූල්‍ය ප්‍රකාශන ආකෘති, කොටස් නිකුතු තියරි.', duration: '3.5 Hours' },
   { id: 'd7-ict', subject: 'ICT', title: 'Unit 6 (SQL): DDL සහ DML මූලධර්ම + Live Run.', duration: '2.5 Hours' }],
  // Day 08
  [{ id: 'd8-bs', subject: 'Business Studies', title: 'Unit 6: නිෂ්පාදන පද්ධති + 2024 පේපර් එකේ 35 (අ) ප්‍රශ්නය.', duration: '4 Hours' },
   { id: 'd8-ac', subject: 'Accounting', title: 'MCQ 15 + සවිස්තරාත්මක ආදායම් ප්‍රකාශන ගැලපුම් + 2015 ගණන.', duration: '3.5 Hours' },
   { id: 'd8-ict', subject: 'ICT', title: 'Unit 6 (SQL): GROUP BY, HAVING සහ Joins + Live Run.', duration: '2.5 Hours' }],
  // Day 09
  [{ id: 'd9-bs', subject: 'Business Studies', title: 'Unit 6: තත්ත්ව පාලන මෙවලම් (5S, TQM, ISO) + 35 (ආ) ප්‍රශ්නය.', duration: '4 Hours' },
   { id: 'd9-ac', subject: 'Accounting', title: 'MCQ 15 + මූල්‍ය තත්ත්ව ප්‍රකාශන (Balance Sheet) + 2016 ගණන.', duration: '3.5 Hours' },
   { id: 'd9-ict', subject: 'ICT', title: 'Unit 6 (ERD): Entities, Attributes සහ ERD අතින් ඇඳීම.', duration: '2.5 Hours' }],
  // Day 10
  [{ id: 'd10-bs', subject: 'Business Studies', title: 'Unit 7: රැකියා විශ්ලේෂණය (Description/Specification).', duration: '4 Hours' },
   { id: 'd10-ac', subject: 'Accounting', title: 'MCQ 15 + 2018, 2019 ලකුණු 50 සමාගම් ගණන් 2ම.', duration: '3.5 Hours' },
   { id: 'd10-ict', subject: 'ICT', title: 'Unit 5 (Web): HTML මූලික Tags + MCQ 20ක්.', duration: '2.5 Hours' }],
  // Day 11
  [{ id: 'd11-bs', subject: 'Business Studies', title: 'Unit 7: බඳවා ගැනීම්, පුහුණුව, ඇගයීම් + 2015-2020 HRM Essays.', duration: '4 Hours' },
   { id: 'd11-ac', subject: 'Accounting', title: 'MCQ 15 + 2020-2024 සමාගම් මූල්‍ය ප්‍රකාශන ප්‍රශ්න ඉවර කිරීම.', duration: '3.5 Hours' },
   { id: 'd11-ict', subject: 'ICT', title: 'Unit 5 (Web): CSS විලාසිතා සහ Forms නිර්මාණය + Essays 2ක්.', duration: '2.5 Hours' }],
  // Day 12
  [{ id: 'd12-bs', subject: 'Business Studies', title: 'Unit 2: PESTEL බාහිර පරිසර සාධක + 32 (අ) ප්‍රශ්නය.', duration: '4 Hours' },
   { id: 'd12-ac', subject: 'Accounting', title: 'MCQ 15 + මූල්‍ය අනුපාත: ද්‍රවශීලතා, ලාභදායීතා සමීකරණ.', duration: '3.5 Hours' },
   { id: 'd12-ict', subject: 'ICT', title: 'Unit 1 & 2: දත්ත/තොරතුරු ගුණාංග + සංඛ්‍යා පද්ධති සුළු කිරීම්.', duration: '2.5 Hours' }],
  // Day 13
  [{ id: 'd13-gen', subject: 'General', title: 'CATCH-UP DAY 02: ජූනි 15 සිට 20 දක්වා මඟහැරුණු දේවල් කවර් කරගන්නා දෙවැනි Buffer දිනය.', duration: '10 Hours' }],
  // Day 14
  [{ id: 'd14-bs', subject: 'Business Studies', title: 'Unit 3: ඒක පුද්ගල, හවුල් ව්‍යාපාර + 13-20 පරාසයේ MCQ 15ක්.', duration: '4 Hours' },
   { id: 'd14-ac', subject: 'Accounting', title: 'MCQ 15 + 2015-2024 දක්වා ආපු හැම අනුපාත ප්‍රශ්නයක්ම හැදීම.', duration: '3.5 Hours' },
   { id: 'd14-ict', subject: 'ICT', title: 'Unit 3: Logic Gates සහ Karnaugh Maps Shortcuts.', duration: '2.5 Hours' }],
  // Day 15
  [{ id: 'd15-bs', subject: 'Business Studies', title: 'Unit 3: සීමිත සමාගම් පනත්, ලක්ෂණ + Essays Structuring.', duration: '4 Hours' },
   { id: 'd15-ac', subject: 'Accounting', title: 'MCQ 15 + නිෂ්පාදන පිරිවැය: අමුද්‍රව්‍ය, ශ්‍රම, පොදු පිරිවැය තියරි.', duration: '3.5 Hours' },
   { id: 'd15-ict', subject: 'ICT', title: 'Unit 8: පද්ධති සංවර්ධන ජීවන චක්‍රය (SDLC) අවධි + Essays 2ක්.', duration: '2.5 Hours' }],
  // Day 16
  [{ id: 'd16-bs', subject: 'Business Studies', title: 'Unit 1: ව්‍යාපාර පරිණාමය, අවශ්‍යතා සහ උවමනා, අරමුණු.', duration: '4 Hours' },
   { id: 'd16-ac', subject: 'Accounting', title: 'MCQ 15 + නිෂ්පාදන පිරිවැය ගිණුම්කරණ ආකෘති + 2015-2019 ගණන්.', duration: '3.5 Hours' },
   { id: 'd16-ict', subject: 'ICT', title: 'Unit 9: මෙහෙයුම් පද්ධති (OS) කාර්යයන් + 2016-2018 Essays.', duration: '2.5 Hours' }],
  // Day 17
  [{ id: 'd17-bs', subject: 'Business Studies', title: 'Unit 8: තොරතුරු පද්ධති, සන්නිවේදනය, ඩිජිටල්කරණය.', duration: '4 Hours' },
   { id: 'd17-ac', subject: 'Accounting', title: 'MCQ 15 + 2020-2024 නිෂ්පාදන පිරිවැය ගණන් (පිරිවැය අවසන්).', duration: '3.5 Hours' },
   { id: 'd17-ict', subject: 'ICT', title: 'Unit 9: Memory Management සහ Process Scheduling ගණන්.', duration: '2.5 Hours' }],
  // Day 18
  [{ id: 'd18-bs', subject: 'Business Studies', title: 'Unit 9: මූල්‍ය ආයතන, ශ්‍රී ලංකා මහ බැංකුව (CBSL) කාර්යභාරය.', duration: '4 Hours' },
   { id: 'd18-ac', subject: 'Accounting', title: 'MCQ 15 + පිරිවැය-පරිමාව-ලාභ විශ්ලේෂණය (CVP) මූලධර්ම.', duration: '3.5 Hours' },
   { id: 'd18-ict', subject: 'ICT', title: 'Unit 10: ඊ-වාණිජ්‍යය (E-Commerce) වර්ග සහ තාක්ෂණයන්.', duration: '2.5 Hours' }],
  // Day 19
  [{ id: 'd19-bs', subject: 'Business Studies', title: 'Unit 10: ව්‍යාපාර සහ රජය, බදුකරණය, පාරිභෝගික ආරක්ෂණය.', duration: '4 Hours' },
   { id: 'd19-ac', subject: 'Accounting', title: 'MCQ 15 + CVP සූත්‍ර භාවිතය + 2015-2019 Past Paper ප්‍රශ්න.', duration: '3.5 Hours' },
   { id: 'd19-ict', subject: 'ICT', title: 'Unit 11: තොරතුරු තාක්ෂණය සහ සමාජය (Cyber Crimes / Ethics).', duration: '2.5 Hours' }],
  // Day 20
  [{ id: 'd20-gen', subject: 'General', title: 'CATCH-UP DAY 03: ජූනි 22 සිට 27 දක්වා මඟහැරුණු දේවල් සම්පූර්ණයෙන්ම කවර් කර අවසන් කිරීමේ Buffer දිනය.', duration: '10 Hours' }],
  // Day 21
  [{ id: 'd21-bs', subject: 'Business Studies', title: 'Unit 11: ජාත්‍යන්තර ව්‍යාපාර, ගෝලීයකරණය, WTO සංකල්ප.', duration: '4 Hours' },
   { id: 'd21-ac', subject: 'Accounting', title: 'MCQ 15 + 2020-2024 දක්වා ආපු හැම CVP ප්‍රශ්නයක්ම හැදීම.', duration: '3.5 Hours' },
   { id: 'd21-ict', subject: 'ICT', title: 'Unit 12: නව නැඹුරුවීම් (IoT, Cloud Computing, AI) + Essays 2ක්.', duration: '2.5 Hours' }],
  // Day 22
  [{ id: 'd22-bs', subject: 'Business Studies', title: 'Unit 12: ව්‍යවසායකත්වය, ව්‍යවසායකයෙකුගේ ලක්ෂණ + Essays.', duration: '4 Hours' },
   { id: 'd22-ac', subject: 'Accounting', title: 'MCQ 15 + මූදල් ප්‍රකාශ ප්‍රභව (Cash Flow) බේසික් හඳුන්වාදීම.', duration: '3.5 Hours' },
   { id: 'd22-ict', subject: 'ICT', title: 'Past Paper Sprint: 2024 Full MCQ Paper එක ටයිමර් එකකට හැදීම.', duration: '2.5 Hours' }],
  // Day 23
  [{ id: 'd23-bs', subject: 'Business Studies', title: 'Unit 9 & 10: රජය හා ව්‍යාපාර, බදුකරණය සහ මහ බැංකු කාර්යභාරය. [Part 1]', duration: '4 Hours' },
   { id: 'd23-ac', subject: 'Accounting', title: 'MCQ 15 + මුදල් ප්‍රවාහ ප්‍රකාශන (Cash Flow) ආකෘති + 2018-2022 ගණන්. [Part 1]', duration: '3.5 Hours' },
   { id: 'd23-ict', subject: 'ICT', title: 'Unit 9 (OS): Memory Management සහ Scheduling ගණන් ප්‍රගුණ කිරීම. [Part 1]', duration: '2.5 Hours' }],
  // Day 24
  [{ id: 'd24-bs', subject: 'Business Studies', title: 'Unit 9 & 10: රජය හා ව්‍යාපාර, බදුකරණය සහ මහ බැංකු කාර්යභාරය. [Part 2]', duration: '4 Hours' },
   { id: 'd24-ac', subject: 'Accounting', title: 'MCQ 15 + මුදල් ප්‍රවාහ ප්‍රකාශන (Cash Flow) ආකෘති + 2018-2022 ගණන්. [Part 2]', duration: '3.5 Hours' },
   { id: 'd24-ict', subject: 'ICT', title: 'Unit 9 (OS): Memory Management සහ Scheduling ගණන් ප්‍රගුණ කිරීම. [Part 2]', duration: '2.5 Hours' }],
  // Day 25
  [{ id: 'd25-bs', subject: 'Business Studies', title: 'Unit 11 & 12: ජාත්‍යන්තර ව්‍යාපාර (WTO) සහ ව්‍යවසායකත්වය රචනා. [Part 1]', duration: '4 Hours' },
   { id: 'd25-ac', subject: 'Accounting', title: 'MCQ 15 + අසම්පූර්ණ වාර්තා (Incomplete Records) තියරි + බේසික් ගණන්. [Part 1]', duration: '3.5 Hours' },
   { id: 'd25-ict', subject: 'ICT', title: 'Unit 8 & 12: SDLC අවධි සහ නව නැඹුරුවීම් (AI/Cloud) කෙටි සටහන්. [Part 1]', duration: '2.5 Hours' }],
  // Day 26
  [{ id: 'd26-bs', subject: 'Business Studies', title: 'Unit 11 & 12: ජාත්‍යන්තර ව්‍යාපාර (WTO) සහ ව්‍යවසායකත්වය රචනා. [Part 2]', duration: '4 Hours' },
   { id: 'd26-ac', subject: 'Accounting', title: 'MCQ 15 + අසම්පූර්ණ වාර්තා (Incomplete Records) තියරි + බේසික් ගණන්. [Part 2]', duration: '3.5 Hours' },
   { id: 'd26-ict', subject: 'ICT', title: 'Unit 8 & 12: SDLC අවධි සහ නව නැඹුරුවීම් (AI/Cloud) කෙටි සටහන්. [Part 2]', duration: '2.5 Hours' }],
  // Day 27
  [{ id: 'd27-bs', subject: 'Business Studies', title: 'Unit 4 & 5 Revision: කළමනාකරණය සහ අලෙවිකරණය Keywords බැලීම.', duration: '4 Hours' },
   { id: 'd27-ac', subject: 'Accounting', title: 'MCQ 15 + 2020-2024 දක්වා ආපු හැම Cash Flow ප්‍රශ්නයක්ම හැදීම.', duration: '3.5 Hours' },
   { id: 'd27-ict', subject: 'ICT', title: 'Unit 7 (Python): OOP (වස්තුශ්‍රිත) මූලධර්ම සහ වැදගත් Syntax රටා.', duration: '2.5 Hours' }],
  // Day 28
  [{ id: 'd28-gen', subject: 'General', title: '🛑 CATCH-UP DAY 04: ජූලි මුල් දින 5 ඇතුළත මඟහැරුණු දේවල් කවර් කරගන්නා Buffer දිනය.', duration: '10 Hours' }],
  // Day 29
  [{ id: 'd29-bs', subject: 'Business Studies', title: 'Unit 1 & 2 Revision: ව්‍යාපාර පසුබිම සහ PESTEL සාධක වේගයෙන් කියවීම. [Part 1]', duration: '4 Hours' },
   { id: 'd29-ac', subject: 'Accounting', title: 'MCQ 15 + 2015-2024 දක්වා ආපු අසම්පූර්ණ වාර්තා ප්‍රශ්න ඔක්කොම හැදීම. [Part 1]', duration: '3.5 Hours' },
   { id: 'd29-ict', subject: 'ICT', title: 'Unit 6 (SQL & ERD): සංකීර්ණ Queries සහ ER Diagrams අතින් ඇඳීම. [Part 1]', duration: '2.5 Hours' }],
  // Day 30
  [{ id: 'd30-bs', subject: 'Business Studies', title: 'Unit 1 & 2 Revision: ව්‍යාපාර පසුබිම සහ PESTEL සාධක වේගයෙන් කියවීම. [Part 2]', duration: '4 Hours' },
   { id: 'd30-ac', subject: 'Accounting', title: 'MCQ 15 + 2015-2024 දක්වා ආපු අසම්පූර්ණ වාර්තා ප්‍රශ්න ඔක්කොම හැදීම. [Part 2]', duration: '3.5 Hours' },
   { id: 'd30-ict', subject: 'ICT', title: 'Unit 6 (SQL & ERD): සංකීර්ණ Queries සහ ER Diagrams අතින් ඇඳීම. [Part 2]', duration: '2.5 Hours' }],
  // Day 31
  [{ id: 'd31-bs', subject: 'Business Studies', title: 'Unit 1 & 2 Revision: ව්‍යාපාර පසුබිම සහ PESTEL සාධක වේගයෙන් කියවීම. [Part 3]', duration: '4 Hours' },
   { id: 'd31-ac', subject: 'Accounting', title: 'MCQ 15 + 2015-2024 දක්වා ආපු අසම්පූර්ණ වාර්තා ප්‍රශ්න ඔක්කොම හැදීම. [Part 3]', duration: '3.5 Hours' },
   { id: 'd31-ict', subject: 'ICT', title: 'Unit 6 (SQL & ERD): සංකීර්ණ Queries සහ ER Diagrams අතින් ඇඳීම. [Part 3]', duration: '2.5 Hours' }],
  // Day 32
  [{ id: 'd32-bs', subject: 'Business Studies', title: 'Unit 6 & 7 Revision: නිෂ්පාදනය සහ HRM පාඩම්වල Past Paper ව්‍යුහයන් විශ්ලේෂණය. [Part 1]', duration: '4 Hours' },
   { id: 'd32-ac', subject: 'Accounting', title: 'MCQ 15 + ගිණුම්කරණ ප්‍රමිති (LKAS) සහ සිද්ධාන්ත (Theory) කෙටි ප්‍රශ්න. [Part 1]', duration: '3.5 Hours' },
   { id: 'd32-ict', subject: 'ICT', title: 'Unit 4 (Networking): IP Addressing, Subnetting සහ Routing ප්‍රශ්න 10ක් හැදීම. [Part 1]', duration: '2.5 Hours' }],
  // Day 33
  [{ id: 'd33-bs', subject: 'Business Studies', title: 'Unit 6 & 7 Revision: නිෂ්පාදනය සහ HRM පාඩම්වල Past Paper ව්‍යුහයන් විශ්ලේෂණය. [Part 2]', duration: '4 Hours' },
   { id: 'd33-ac', subject: 'Accounting', title: 'MCQ 15 + ගිණුම්කරණ ප්‍රමිති (LKAS) සහ සිද්ධාන්ත (Theory) කෙටි ප්‍රශ්න. [Part 2]', duration: '3.5 Hours' },
   { id: 'd33-ict', subject: 'ICT', title: 'Unit 4 (Networking): IP Addressing, Subnetting සහ Routing ප්‍රශ්න 10ක් හැදීම. [Part 2]', duration: '2.5 Hours' }],
  // Day 34
  [{ id: 'd34-gen', subject: 'General', title: '🛑 CATCH-UP DAY 05: පේපර් බ්ලාස්ට් පියවරට පෙර සියලුම තියරි කොටස් අවසන් කරන අවසාන Buffer දිනය.', duration: '10 Hours' }],
  // Day 35
  [{ id: 'd35-ac', subject: 'Accounting', title: '📊 Accounting 2019 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 36
  [{ id: 'd36-bs', subject: 'Business Studies', title: '🏢 Business Studies 2019 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 37
  [{ id: 'd37-ict', subject: 'ICT', title: '💻 ICT 2019 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 38
  [{ id: 'd38-gen', subject: 'General', title: '🛑 Paper Review Day: 2019 පේපර් තුනේම මාකින් ස්කීම් බලලා, වරදින තැන් Error Log එකට ලියාගැනීම.', duration: '10 Hours' }],
  // Day 39
  [{ id: 'd39-ac', subject: 'Accounting', title: '📊 Accounting 2020 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 40
  [{ id: 'd40-bs', subject: 'Business Studies', title: '🏢 Business Studies 2020 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 41
  [{ id: 'd41-ict', subject: 'ICT', title: '💻 ICT 2020 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 42
  [{ id: 'd42-gen', subject: 'General', title: '🛑 Paper Review Day: 2020 පේපර් තුනේම වැරදුණු තැන් විශ්ලේෂණය කිරීම.', duration: '10 Hours' }],
  // Day 43
  [{ id: 'd43-ac', subject: 'Accounting', title: '📊 Accounting 2021 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 44
  [{ id: 'd44-bs', subject: 'Business Studies', title: '🏢 Business Studies 2021 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 45
  [{ id: 'd45-ict', subject: 'ICT', title: '💻 ICT 2021 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 46
  [{ id: 'd46-gen', subject: 'General', title: '🛑 Paper Review Day: 2021 පේපර් තුනේම වැරදුණු තැන් විශ්ලේෂණය කිරීම.', duration: '10 Hours' }],
  // Day 47
  [{ id: 'd47-ac', subject: 'Accounting', title: '📊 Accounting 2022 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 48
  [{ id: 'd48-bs', subject: 'Business Studies', title: '🏢 Business Studies 2022 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 49
  [{ id: 'd49-ict', subject: 'ICT', title: '💻 ICT 2022 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 50
  [{ id: 'd50-gen', subject: 'General', title: '🛑 Paper Review Day: 2022 පේපර් තුනේම වැරදුණු තැන් විශ්ලේෂණය කිරීම.', duration: '10 Hours' }],
  // Day 51
  [{ id: 'd51-ac', subject: 'Accounting', title: '📊 Accounting 2023 Full Paper (I & II) [08:30 AM - 02:00 PM]', duration: '10 Hours', isPaper: true }],
  // Day 52
  [{ id: 'd52-bs', subject: 'Business Studies', title: '🏢 Business Studies 2023 Full Paper (I & II)', duration: '5 Hours', isPaper: true },
   { id: 'd52-ict', subject: 'ICT', title: '💻 ICT 2023 Full Paper (I & II)', duration: '5 Hours', isPaper: true }],
// Day 53
  [{ id: 'd53-ict', subject: 'ICT', title: '2019 Full Paper (I & II) ලිවීම + හවස Logic Gates සහ K-Maps Shortcuts බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 54
  [{ id: 'd54-gen', subject: 'General', title: 'WEEKLY REVISION DAY 04: මුළු සතියේම Error Log එක මුල සිට අගටම සම්පූර්ණයෙන් ක්ලීන් කිරීම.', duration: '10 Hours' }],
  // Day 55
  [{ id: 'd55-bs', subject: 'Business Studies', title: 'කොළඹ කලාප පූර්ණ ප්‍රශ්න පත්‍රය (Zonal Paper) ලියා හුරුපුරුදු වීමේ මායාව කැඩීම.', duration: '10 Hours', isPaper: true }],
  // Day 56
  [{ id: 'd56-ac', subject: 'Accounting', title: 'දකුණු පළාත් පූර්ණ ප්‍රශ්න පත්‍රය ලියා අලුත්ම මාරක adjustments වලට මුහුණ දීම.', duration: '10 Hours', isPaper: true }],
  // Day 57
  [{ id: 'd57-ict', subject: 'ICT', title: 'කලාපීය වාර විභාග පූර්ණ ප්‍රශ්න පත්‍රය ලියා අලුත්ම system analysis ප්‍රශ්න රටා බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 58
  [{ id: 'd58-bs', subject: 'Business Studies', title: '2021 Full Paper (I & II) ලිවීම + (FIXED): 2021 නිවැරදි වසර මෙතැනට ඇතුළත් කර ඇත.', duration: '10 Hours', isPaper: true }],
  // Day 59
  [{ id: 'd59-ac', subject: 'Accounting', title: '2021 Full Paper (I & II) ලිවීම + හවස අලුත්ම පේපර් එකේ මූල්‍ය ප්‍රකාශන බැලන්ස් කිරීම.', duration: '10 Hours', isPaper: true }],
  // Day 60
  [{ id: 'd60-ict', subject: 'ICT', title: '2021 Full Paper (I & II) ලිවීම + හවස IoT සහ AI අලුත් තියරි රචනා ප්‍රශ්න බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 61
  [{ id: 'd61-gen', subject: 'General', title: 'THE ULTIMATE MARATHON RESET: පේපර්ස් ඔක්කොම ලියලා ඉවර කර, මනස උපරිමයෙන් සැහැල්ලු කරගැනීම.', duration: '10 Hours' }],
  // Day 62
  [{ id: 'd62-gen', subject: 'General', title: 'THE ULTIMATE MARATHON RESET: Error Log එකේ ලියවුණු ලොකුම වැරදි ටික විතරක් නැවත බලා Master Panel අවසන් කිරීම.', duration: '10 Hours' }],
  // Day 63
  [{ id: 'd63-bs', subject: 'Business Studies', title: 'විභාගයට පෙර දින: මුළු සිලබස් එකේම Keywords/Definitions Error Log එකෙන් වේගයෙන් කියවීම + Past Paper MCQ 1 ස්කෑන් කිරීම.', duration: '10 Hours' }],
  // Day 64
  [{ id: 'd64-bs', subject: 'Business Studies', title: 'විභාගයට පෙර දින: මුළු සිලබස් එකේම Keywords/Definitions Error Log එකෙන් වේගයෙන් කියවීම + Past Paper MCQ 2 ස්කෑන් කිරීම.', duration: '10 Hours' }],
  // Day 65
  [{ id: 'd65-bs', subject: 'Business Studies', title: 'විභාගයට පෙර දින: රෑ 09:30 වෙද්දී පොත් ඔක්කොම වසා දැමීම. විභාග හෝල් එකේදී මොළය උපරිමයෙන් ඇක්ටිව් වෙන්න පැය 7ක නින්දක් ලබාගැනීම අනිවාර්යයි.', duration: '10 Hours' }],
  // Day 66
  [{ id: 'd66-bs', subject: 'Business Studies', title: 'BS I පේපර් එකේ දින: දවල් 10:30 ට පේපර් එක ඉවර වෙලා ගෙදර ඇවිත් දවල් 03:00 වෙනකන් නිදාගැනීම (Brain Break). හවස 04:00 ට Unit 4 (කළමනාකරණය) බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 67
  [{ id: 'd67-bs', subject: 'Business Studies', title: 'BS II පේපර් එකට ගැප් එක: Unit 4 (කළමනාකරණය) සහ Unit 5 (අලෙවිකරණය) රචනා ප්‍රශ්නවල Keywords බැලීම.', duration: '10 Hours' }],
  // Day 68
  [{ id: 'd68-bs', subject: 'Business Studies', title: 'BS II පේපර් එකට ගැප් එක: Unit 6 (නිෂ්පාදනය) සහ Unit 7 (HRM) ප්‍රධාන ප්‍රශ්න රටා බැලීම.', duration: '10 Hours' }],
  // Day 69
  [{ id: 'd69-bs', subject: 'Business Studies', title: 'BS II පේපර් එකට ගැප් එක: ඉතිරි සියලුම ඒකකවල (1, 2, 3, 8, 9, 10, 11, 12) රචනා සඳහා වැදගත් කරුණු මතක් කරගැනීම.', duration: '10 Hours' }],
  // Day 70
  [{ id: 'd70-bs', subject: 'Business Studies', title: 'BS II පේපර් එක (රචනා): විභාගය අවසන් වූ පසු උත්තර මැච් කිරීම සපුරා තහනම්!', duration: '10 Hours', isPaper: true }],
  // Day 71
  [{ id: 'd71-ac', subject: 'Accounting', title: 'Accounting MCQ ගැප් එක: MCQ 50ට ලෑස්ති වීම සඳහා කලින් වැරදුණු MCQ වලින් 100ක් නැවත හදන ක්‍රම බලාගැනීම.', duration: '10 Hours' }],
  // Day 72
  [{ id: 'd72-ac', subject: 'Accounting', title: 'Accounting MCQ ගැප් එක: MCQ 50ට ලෑස්ති වීම සඳහා කලින් වැරදුණු MCQ වලින් 100ක් නැවත හදන ක්‍රම බලාගැනීම.', duration: '10 Hours' }],
  // Day 73
  [{ id: 'd73-ac', subject: 'Accounting', title: 'Accounting MCQ ගැප් එක: MCQ 50ට ලෑස්ති වීම සඳහා කලින් වැරදුණු MCQ වලින් ඉතිරි 100ක් නැවත හදන ක්‍රම බලාගැනීම.', duration: '10 Hours' }],
  // Day 74
  [{ id: 'd74-ac', subject: 'Accounting', title: 'Accounting ගැප් එක: සමාගම් මූල්‍ය ප්‍රකාශනවල එන ප්‍රධානම ගැලපුම් (Adjustments) අතින් හදලා ප්‍රගුණ කිරීම.', duration: '10 Hours' }],
  // Day 75
  [{ id: 'd75-ac', subject: 'Accounting', title: 'Accounting ගැප් එක: හවුල් ව්‍යාපාරවල එන ප්‍රධානම ගැලපුම් (Adjustments) අතින් හදලා ප්‍රගුණ කිරීම.', duration: '10 Hours' }],
  // Day 76
  [{ id: 'd76-ac', subject: 'Accounting', title: 'Accounting ගැප් එක: තවත් වැදගත් Adjustments 20ක් විතර අතින් හදලා ප්‍රගුණ කිරීම.', duration: '10 Hours' }],
  // Day 77
  [{ id: 'd77-ac', subject: 'Accounting', title: 'Accounting MCQ පෙරදා: ගිණුම්කරණ ප්‍රමිති (LKAS) සහ පිරිවැය සූත්‍ර ටික බලාගෙන ඉක්මනින් නිදාගැනීම.', duration: '10 Hours' }],
  // Day 78
  [{ id: 'd78-ac', subject: 'Accounting', title: 'Accounting I පේපර් එක: හවස 04:00 ට වාඩි වෙලා ICT I වෙනුවෙන් Networking, Python, SQL වල Shortcuts සහ Logic Gates රටා බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 79
  [{ id: 'd79-ict', subject: 'ICT', title: 'ICT MCQ ගැප් එක: ICT MCQ පේපර්ස් වලින් වැරදුණු ප්‍රශ්න නැවත විශ්ලේෂණය කිරීම. [Part 1]', duration: '10 Hours' }],
  // Day 80
  [{ id: 'd80-ict', subject: 'ICT', title: 'ICT MCQ ගැප් එක: ICT MCQ පේපර්ස් වලින් වැරදුණු ප්‍රශ්න නැවත විශ්ලේෂණය කිරීම. [Part 2]', duration: '10 Hours' }],
  // Day 81
  [{ id: 'd81-ict', subject: 'ICT', title: 'ICT MCQ ගැප් එක: ICT MCQ පේපර්ස් වලින් වැරදුණු ප්‍රශ්න නැවත විශ්ලේෂණය කිරීම. [Part 3]', duration: '10 Hours' }],
  // Day 82
  [{ id: 'd82-ict', subject: 'ICT', title: 'ICT I පේපර් එක: හවස ගෙදර ඇවිත් Accounting II (රචනා) වෙනුවෙන් නිෂ්පාදන පිරිවැය සහ මූල්‍ය අනුපාත සූත්‍ර රිවිෂන් කිරීම.', duration: '10 Hours', isPaper: true }],
  // Day 83
  [{ id: 'd83-ac', subject: 'Accounting', title: 'Accounting II පෙරදා: මුළු දවසම වෙන් වෙන්නේ සමාගම් සහ හවුල් ව්‍යාපාරවල ආකෘති (Formats) මතක් කරගැනීමටයි.', duration: '10 Hours' }],
  // Day 84
  [{ id: 'd84-ac', subject: 'Accounting', title: 'Accounting II පේපර් එක: විභාගය ලියා පැමිණි විගස, ICT II වෙනුවෙන් Python Coding ලියන රටා සහ SQL බේසික් Queries ටික රෑ 09:00 වෙනකන් බැලීම.', duration: '10 Hours', isPaper: true }],
  // Day 85
  [{ id: 'd85-ict', subject: 'ICT', title: 'ICT II පේපර් එක (අවසාන සටන): පේපර් එක ඉවර වෙලා එළියට ආවම සෝෂල් මීඩියා සහ උත්තර මැච් කිරීමෙන් ඈත් වෙන්න!', duration: '10 Hours', isPaper: true }]
] as Task[][];

const generateTasksForDay = (day: number): Task[] => {
  if (day >= 1 && day <= 85) {
    return customPlan85Days[day - 1];
  }
  return [];
};

export const generate85DayPlan = (startDateStr: string = '2026-06-09'): DayPlan[] => {
  const plan: DayPlan[] = [];
  const startDate = new Date(startDateStr);
  for (let i = 1; i <= 85; i++) {
    const phase = getPhase(i);
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + (i - 1));
    const dateStr = currentDate.toISOString().split('T')[0];
    let overridePhase = phase.name;
    let overridePhaseNum = phase.num;
    if (i >= 63 && i <= 85) {
      overridePhaseNum = 4;
    }
    
    if (i >= 63 && i <= 65) {
      overridePhase = "PHASE 3: SPEED, SIMULATION & ERROR ELIMINATION (DAYS 63 - 65)";
      overridePhaseNum = 3;
    } else if (i >= 66 && i <= 70) {
      overridePhase = "🏢 PHASE 4: BS මෙහෙයුම (අගෝස්තු 13 - අගෝස්තු 17)";
      overridePhaseNum = 4;
    } else if (i >= 71 && i <= 77) {
      overridePhase = "📊 PHASE 5: Accounting සඳහා දින 7ක මහා ගැප් එක (අගෝස්තු 18 - අගෝස්තු 24)";
      overridePhaseNum = 5;
    } else if (i >= 78 && i <= 85) {
      overridePhase = "💻 PHASE 6: ICT සහ අවසාන සටන (අගෝස්තු 25 - සැප්තැම්බර් 01)";
      overridePhaseNum = 6;
    }

    plan.push({
      day: i,
      dateStr,
      phase: overridePhase,
      phasePhaseNumber: overridePhaseNum,
      tasks: generateTasksForDay(i),
    });
  }
  return plan;
};
