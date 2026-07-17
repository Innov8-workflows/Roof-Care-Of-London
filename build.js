/* Roof Care of London — SEO sub-page generator
   Mirrors the legacy WordPress URL structure (5 service × area combos) and
   extends it to the full client area list, plus standalone service pages,
   /services/, /areas/, /about/, /contact/, /faq/, sitemap + robots.
   Run: node build.js            (writes pages into this folder)
   NOTE: staging on GitHub Pages project path, so all internal links are
   RELATIVE (depth-aware). Canonicals point at the production domain. */

const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

/* ============ CONFIG ============ */
const DOMAIN = 'https://roofcareoflondonltd.co.uk';
const BIZ = 'Roof Care of London Ltd';
const MOBILE = '07877 533880';
const MOBILE_INTL = '+447877533880';
const LANDLINE = '020 7043 3772';
const LANDLINE_INTL = '+442070433772';
const EMAIL = 'info@roofcareoflondonltd.co.uk';
const ADDRESS = { street: 'Warwick Chambers, Pater Street', locality: 'London', postcode: 'W8 6EW' };
const CHECKATRADE = 'https://www.checkatrade.com/trades/roofcareoflondon5932305';
const MYBUILDER = 'https://www.mybuilder.com/profile/roof-care-of-london';
const YEARS = 20;

/* ============ AREAS ============ */
const AREAS = [
  { slug:'battersea', name:'Battersea', blurb:'From the mansion blocks around Battersea Park to the Victorian terraces off Lavender Hill, Battersea rooftops take a battering from wind funnelling along the Thames. We work on slate, clay tile and flat roofs across SW11 and know the quirks of the area’s late-Victorian housing stock inside out.', nearby:['clapham','wandsworth','chelsea','vauxhall'] },
  { slug:'clapham', name:'Clapham', blurb:'Clapham’s tall Victorian terraces around the Common and Abbeville Village mean steep pitches, parapet gutters and butterfly roofs — details that catch out general builders. We’ve repaired and re-roofed properties across SW4 for years and carry the right access kit for tight rear returns.', nearby:['battersea','balham','brixton','wandsworth'] },
  { slug:'hammersmith', name:'Hammersmith', blurb:'Between the conservation streets of Brackenbury Village and the mansion flats along the A4, Hammersmith roofs range from London slate to Edwardian clay tile. Our team covers all of W6 with fast response times from our West London base.', nearby:['chiswick','fulham','kensington','paddington'] },
  { slug:'kensington', name:'Kensington', blurb:'Kensington’s stucco-fronted terraces and listed properties demand careful, conservation-minded roofing — natural slate, lead detailing and discreet scaffolding. Based minutes away on Pater Street, W8 is our home patch and we treat it that way.', nearby:['chelsea','knightsbridge','hammersmith','paddington'] },
  { slug:'lewisham', name:'Lewisham', blurb:'From Victorian terraces in Brockley borders to inter-war semis towards Catford, Lewisham’s mixed housing stock throws up everything from slipped slates to tired concrete tiles. We cover the whole of SE13 with the same fast, tidy service we’re known for west of the river.', nearby:['dulwich','southwark','brixton','camden'] },
  { slug:'paddington', name:'Paddington', blurb:'Paddington’s grand stucco terraces and mews houses around Little Venice combine parapet roofs, hidden gutters and lead flats — leak-prone details that need a specialist eye. We’re ten minutes away and work across W2 all year round.', nearby:['westminster','kensington','kilburn','mayfair'] },
  { slug:'westminster', name:'Westminster', blurb:'Working in Westminster means listed buildings, conservation areas and strict access rules — all familiar territory for our team. From Pimlico terraces to mansion blocks off Victoria Street, we deliver discreet, fully insured roofing in the heart of London.', nearby:['mayfair','paddington','vauxhall','chelsea'] },
  { slug:'wimbledon', name:'Wimbledon', blurb:'From the village’s period cottages to the Edwardian semis of Wimbledon Park, SW19 properties deserve roofing that lasts. We handle everything from heritage slate work to modern flat roofs on rear extensions across Wimbledon and Merton.', nearby:['putney','wandsworth','balham','streatham'] },
  { slug:'streatham', name:'Streatham', blurb:'Streatham’s long Edwardian avenues and 1930s semis mean big roof areas, original clay tiles and plenty of chimneys. We re-roof, repair and repoint across SW16, keeping the character while bringing the weatherproofing up to modern standards.', nearby:['balham','brixton','dulwich','wimbledon'] },
  { slug:'wandsworth', name:'Wandsworth', blurb:'Between the Tonsleys’ compact Victorian terraces and larger family homes towards the Common, Wandsworth keeps our team busy year-round. We’re a short hop over the river, so SW18 enquiries get quick surveys and fast starts.', nearby:['battersea','putney','clapham','wimbledon'] },
  { slug:'balham', name:'Balham', blurb:'Balham’s Victorian terraces — many with butterfly roofs and shared parapet valleys — need roofers who understand how neighbouring roofs drain together. We work across SW12 on repairs, re-roofs and flat roof replacements for rear additions.', nearby:['clapham','streatham','wandsworth','brixton'] },
  { slug:'dulwich', name:'Dulwich', blurb:'From Dulwich Village’s period homes to the Edwardian terraces of East Dulwich, SE21 and SE22 roofs mix heritage slate with clay tile and timber detailing. We deliver conservation-sensitive work with tidy sites and honest pricing.', nearby:['brixton','lewisham','southwark','streatham'] },
  { slug:'putney', name:'Putney', blurb:'Putney’s riverside exposure and hilltop streets around West Putney give roofs a hard life — wind-lifted tiles and worn flashings are common calls. We cover all of SW15 with rapid repairs and full re-roofing.', nearby:['wandsworth','fulham','wimbledon','battersea'] },
  { slug:'fulham', name:'Fulham', blurb:'Fulham’s tight terraced streets between the Broadway and the river are classic London roofing territory: slate fronts, tiled backs, parapet gutters and rear extension flat roofs. SW6 is minutes from our base and one of our busiest patches.', nearby:['chelsea','putney','hammersmith','battersea'] },
  { slug:'chelsea', name:'Chelsea', blurb:'Chelsea’s garden squares and stucco terraces call for discreet, high-spec roofing — natural slate, zinc and lead, delivered with respect for conservation rules. We’re based just up the road in W8 and know the borough’s requirements well.', nearby:['kensington','knightsbridge','fulham','battersea'] },
  { slug:'knightsbridge', name:'Knightsbridge', blurb:'Roofing in Knightsbridge means listed facades, mansion blocks and zero tolerance for mess or disruption. Our 10-strong team delivers quiet, fully insured work at the standard SW1X expects, from lead flats to slate mansards.', nearby:['chelsea','kensington','mayfair','westminster'] },
  { slug:'mayfair', name:'Mayfair', blurb:'Mayfair’s Georgian terraces and mansard roofs are some of London’s most demanding — lead detailing, slate verticals and strict conservation oversight. We bring two decades of heritage roofing experience to every W1 project.', nearby:['westminster','knightsbridge','paddington','camden'] },
  { slug:'camden', name:'Camden', blurb:'From Camden Town’s Victorian terraces to warehouse conversions near the Lock, NW1 roofs mix traditional pitches with big flat sections and rooflights. We repair, replace and maintain them all, with scaffolding and access handled in-house.', nearby:['kilburn','mayfair','paddington','westminster'] },
  { slug:'kilburn', name:'Kilburn', blurb:'Kilburn’s long Victorian terraces and Edwardian semis across NW6 keep their looks but their roofs work hard. Slipped slates, tired valleys and leaking back additions are daily work for our team, minutes away across West London.', nearby:['paddington','camden','hammersmith','westminster'] },
  { slug:'chiswick', name:'Chiswick', blurb:'Chiswick’s leafy avenues of Edwardian and 1930s family homes mean generous roof areas, original clay tiles and long gutter runs. We keep W4 watertight with sympathetic repairs and full re-roofs that match the street.', nearby:['hammersmith','fulham','putney','kensington'] },
  { slug:'vauxhall', name:'Vauxhall', blurb:'Vauxhall mixes Georgian terraces around Bonnington Square with modern riverside blocks — two very different roofing challenges. We handle both: heritage pitched work and modern flat roof systems across SW8.', nearby:['westminster','battersea','brixton','southwark'] },
  { slug:'southwark', name:'Southwark', blurb:'From Georgian terraces off Trinity Church Square to converted warehouses near Borough, Southwark’s roofscape is as varied as anywhere in London. We bring the same care to SE1’s heritage stock as to its modern flat roofs.', nearby:['lewisham','dulwich','vauxhall','brixton'] },
  { slug:'brixton', name:'Brixton', blurb:'Brixton’s Victorian terraces and Edwardian villas across SW2 and SW9 are prime candidates for sympathetic re-roofing as original slates reach the end of their life. We repair what can be saved and replace what can’t — honestly.', nearby:['clapham','streatham','dulwich','vauxhall'] },
];
const areaBySlug = Object.fromEntries(AREAS.map(a => [a.slug, a]));

/* ============ COMBO SERVICES (mirror legacy slugs) ============ */
const COMBOS = [
  {
    prefix: 'roofing-repairs', name: 'Roofing Repairs',
    lead: a => `Fast, lasting roof repairs across ${a.name} from a local, fully insured team with ${YEARS} years’ experience. Slipped tiles, leaks, storm damage, flashings and valleys — no job too small.`,
    paras: a => [
      `A small roof problem never stays small. A slipped slate or cracked tile in ${a.name} lets water track onto timbers and ceilings long before a stain appears indoors — and by then the repair bill has grown. Our team diagnoses the actual source of the leak (rarely where the drip shows) and fixes it properly the first time, using materials matched to your existing roof.`,
      `We repair every type of roof found in ${a.name}: natural slate and clay tile pitched roofs, felt, GRP fibreglass and EPDM rubber flat roofs, lead valleys and parapet gutters. Whether it’s one tile or a section of roof brought down by a storm, you get the same tidy workmanship, clear pricing and photographic evidence of the work done.`,
      `As a 10-strong team we can usually get an experienced roofer to ${a.name} quickly — often the same week for urgent leaks — and every job is backed by £5 million public liability insurance.`,
    ],
    bullets: ['Leak detection and permanent repairs','Slipped, cracked and missing tiles or slates','Storm damage and emergency make-safe','Lead flashings, valleys and parapet gutters','Chimney, verge and ridge repointing','Flat roof patch repairs (felt, GRP, EPDM)'],
    faqs: a => [
      [`How quickly can you repair a roof in ${a.name}?`, `For urgent leaks we aim to make the roof safe within days, with the permanent repair scheduled straight after. Most standard repairs in ${a.name} are completed within one to two weeks of your free survey.`],
      ['Will the repair match my existing roof?', 'Yes — we source reclaimed slates and matching tiles wherever possible so the repair blends in, which matters on the period streets we work on every day.'],
      ['Is it worth repairing, or do I need a new roof?', `We’ll tell you straight. If a repair will genuinely last, that’s what we quote. If the roof is at the end of its life we’ll explain why, show you photos, and price a re-roof alongside so you can compare.`],
    ],
  },
  {
    prefix: 'flat-roof-repairs', name: 'Flat Roof Repairs',
    lead: a => `Specialist flat roof repairs in ${a.name} — felt, GRP fibreglass and EPDM rubber. Ponding, blisters, splits and leaking outlets fixed properly, with honest advice on repair versus replacement.`,
    paras: a => [
      `Flat roofs fail in predictable places: around outlets and upstands, at laps in ageing felt, and wherever water ponds instead of draining. If your extension, garage or dormer in ${a.name} is leaking, we’ll find the failure point and repair it with materials compatible with your existing covering — not a smear of bitumen that fails again next winter.`,
      `We repair all three common flat roof systems found across ${a.name}: traditional torch-on felt, GRP fibreglass and EPDM rubber. Where a covering still has life left, a proper localised repair is money well spent. Where it doesn’t, we’ll show you clear photos and give you a straight recommendation — including an honest price for replacement so you’re never guessing.`,
      `Every repair comes with tidy workmanship, ${YEARS} years’ experience and £5 million public liability cover behind it.`,
    ],
    bullets: ['Torch-on felt repairs and re-covering','GRP fibreglass crack and joint repairs','EPDM rubber patch repairs','Leaking outlets, upstands and flashings','Ponding water and fall correction','Rooflight and lantern leak repairs'],
    faqs: a => [
      ['Can you repair my flat roof or does it need replacing?', 'If the deck is sound and the covering has life left, we repair. If moisture has got into the deck or the covering has perished overall, a repair only buys months — we’ll show you photos and let the evidence speak.'],
      [`Do you repair garage and extension roofs in ${a.name}?`, `Yes — extension, garage, porch, dormer and balcony roofs are the bulk of our flat roofing work in ${a.name}. No job is too small.`],
      ['How long does a flat roof repair take?', 'Most localised repairs are completed in a day, weather permitting. Larger re-covering work typically takes two to three days.'],
    ],
  },
  {
    prefix: 'flat-roof-replacement', name: 'Flat Roof Replacement',
    lead: a => `Complete flat roof replacement in ${a.name} using EPDM rubber, GRP fibreglass or high-performance felt — with upgraded insulation, proper falls and long manufacturer-backed life expectancy.`,
    paras: a => [
      `When a flat roof reaches the end of its life, patch repairs become false economy. Our flat roof replacement service in ${a.name} strips the old covering back to the deck, replaces any water-damaged timber, corrects the falls so water actually drains, and installs a modern covering with a design life measured in decades — not years.`,
      `We install the three leading systems and will recommend the right one for your roof: EPDM rubber for clean, seamless durability; GRP fibreglass for a hard-wearing finish on complex shapes; and modern high-performance felt where budget leads. Replacements can include upgraded insulation to current building regulations, which cuts heat loss through what is often the coldest part of the house.`,
      `From terraced back additions to whole-garage roofs across ${a.name}, you get a fixed written quote, a tidy site, and a team that turns up when it says it will.`,
    ],
    bullets: ['EPDM rubber, GRP fibreglass and felt systems','Deck inspection and timber replacement','Insulation upgrades to building regs','Falls corrected to eliminate ponding','New edge trims, outlets and flashings','Fixed written quotations — no surprises'],
    faqs: a => [
      ['Which flat roof system is best?', 'It depends on the roof. EPDM suits large simple roofs, GRP suits complex shapes and roofs that get foot traffic, and high-performance felt remains a solid budget option. We’ll recommend honestly rather than pushing one system.'],
      ['How long does a replacement take?', `A typical extension or garage roof in ${a.name} takes two to four days including any timber work, longer if insulation is being upgraded or the deck needs significant replacement.`],
      ['How long will my new flat roof last?', 'Installed properly, EPDM and GRP systems routinely exceed 25 years; high-performance felt around 20. We install to manufacturer specification so the guarantee actually stands.'],
    ],
  },
  {
    prefix: 're-roofs', name: 'Re-Roofs',
    lead: a => `Full strip-and-re-roof service in ${a.name}: new battens, breathable membrane, slates or tiles, leadwork and ridge — done once, done properly, by a team with ${YEARS} years on London roofs.`,
    paras: a => [
      `Most of the roofs we replace in ${a.name} are original — laid when the house was built and quietly failing after a century of London weather. Nail fatigue, delaminating slates and crumbling torching can’t be patched forever. A full re-roof strips the covering back to the rafters and rebuilds it with modern materials that keep the street’s character while performing to today’s standards.`,
      `Every re-roof includes new treated battens, a breathable membrane, your choice of natural slate, reclaimed slate or clay/concrete tile, plus new leadwork to chimneys and valleys and mechanically fixed ridge and verge. We manage scaffolding, skips and any parking permissions, and we leave the site clean every evening — something your neighbours in ${a.name} will appreciate.`,
      `You’ll get a detailed written specification and fixed price before we start, and photographic progress updates while we’re on the roof.`,
    ],
    bullets: ['Full strip back to rafters','New treated battens and breathable membrane','Natural slate, reclaimed slate, clay or concrete tile','New leadwork, valleys, ridge and verge','Scaffolding, skips and permits managed','Detailed written specification and fixed price'],
    faqs: a => [
      ['How long does a re-roof take?', `A typical terraced house in ${a.name} takes one to two weeks including scaffolding. Larger or more complex roofs — mansards, butterfly roofs, multiple valleys — can take longer, and we’ll give you an honest programme up front.`],
      ['Will you match the original roof?', 'Yes. On period streets we default to like-for-like: reclaimed or new natural slate, matching clay tiles, and traditional lead detailing. In conservation areas we’ll advise on any constraints before work starts.'],
      ['Do I need to move out during the work?', 'No — the house stays weathertight throughout. We strip and felt in sections so the roof is never left open overnight.'],
    ],
  },
  {
    prefix: 'roofing-contractors', name: 'Roofing Contractors',
    lead: a => `Trusted local roofing contractors covering ${a.name}: repairs, re-roofs, flat roofing, leadwork, chimneys, fascias and guttering — one experienced, fully insured team for every roofing job.`,
    paras: a => [
      `Finding a roofing contractor in ${a.name} you can actually trust shouldn’t be hard. We’re Roof Care of London Ltd — a 10-strong local team led by James Smith, with ${YEARS} years’ experience on London roofs and £5 million public liability insurance on every job. No pressure selling, no vague day rates: a free survey, a written fixed quote, and workmanship we’re happy to be judged on.`,
      `As full-service roofing contractors we handle everything above your gutters and plenty below them: pitched roof repairs and complete re-roofs, flat roof repair and replacement, leadwork and flashings, chimney repairs and repointing, fascias, soffits and guttering, plus rendering, external painting and garden walls. One contractor, one point of contact, one standard of finish across ${a.name}.`,
      `Check our reviews on Checkatrade and MyBuilder, then call for a free, no-obligation quote — we’re usually able to survey ${a.name} properties within days.`,
    ],
    bullets: ['All roofing work — pitched, flat, heritage','Chimneys, leadwork, fascias and guttering','Free surveys and fixed written quotes','£5m public liability insurance','10-strong team, 20 years’ experience','Reviewed on Checkatrade and MyBuilder'],
    faqs: a => [
      ['Are you insured and experienced?', `Yes — £5 million public liability insurance, a 10-strong team and ${YEARS} years of London roofing behind every job in ${a.name}.`],
      ['Do you charge for quotes?', 'Never. Surveys and written quotations are free and without obligation, and we won’t chase you with sales calls afterwards.'],
      [`Which areas near ${a.name} do you cover?`, `All of the surrounding neighbourhoods — see the areas list below, or call us: if you’re anywhere in South West or Central London, we cover you.`],
    ],
  },
];

/* ============ STANDALONE SERVICES ============ */
const SERVICES = [
  { slug:'new-roofs', name:'New Roofs', title:'New Roofs London', h1:'New Roofs',
    lead:'Complete new roofs for extensions, new builds and full replacements — pitched or flat, slate, tile, EPDM or GRP — designed and installed to last for decades.',
    paras:[ 'Whether you’re extending, converting a loft or replacing a roof that’s beyond repair, a new roof is a once-in-a-generation investment — and it shows when it’s done properly. We design and install complete new roof structures and coverings: cut roofs and trusses, insulation to current building regulations, breathable membranes, and your choice of covering from natural slate to modern single-ply systems.',
      'Our team handles the whole package — structural timber, coverings, leadwork, fascias, soffits and guttering — so there’s no gap between trades for problems to hide in. You get a detailed specification, a fixed price and a roof that’s guaranteed and built to outlast its guarantee.' ],
    bullets:['Extension and loft conversion roofs','Full structural replacements','Slate, tile, EPDM and GRP coverings','Insulation to building regulations','All leadwork, fascias and guttering included','Detailed written specification'] },
  { slug:'roof-repairs', name:'Roof Repairs', title:'Roof Repairs London', h1:'Roof Repairs',
    lead:'Prompt, permanent roof repairs across London — leaks traced and fixed, tiles and slates replaced, storm damage made safe fast. No job too small.',
    paras:[ 'Leaks rarely show where they start. Water can enter at a cracked ridge, track down a rafter and appear two rooms away — which is why guesswork repairs fail. We survey properly, photograph what we find, and fix the actual fault: slipped or broken slates and tiles, failed flashings, cracked valleys, perished mortar or blocked parapet gutters.',
      'From a single tile to major storm damage, every repair is carried out by an experienced roofer, matched to your existing materials, and covered by our £5 million public liability insurance. If a repair isn’t the right answer, we’ll say so and show you why.' ],
    bullets:['Leak tracing and permanent repairs','Slates, tiles, ridges and verges','Valleys, flashings and parapet gutters','Storm damage and emergency make-safe','Moss removal and preventative maintenance','Photo evidence with every job'] },
  { slug:'flat-roofing', name:'Flat Roofing', title:'Flat Roofing London', h1:'Flat Roofing',
    lead:'Flat roof specialists — EPDM rubber, GRP fibreglass and high-performance felt. Repairs, replacements and brand-new installations for extensions, garages, dormers and balconies.',
    paras:[ 'London runs on flat roofs — every back addition, garage, dormer and balcony has one, and most were built with materials that had a 15-year life at best. We repair, replace and install modern flat roofing systems that last decades: seamless EPDM rubber, hard-wearing GRP fibreglass, and high-performance felt where budget leads.',
      'Every replacement includes deck inspection, timber repairs where needed, corrected falls so water drains rather than ponds, and the option to upgrade insulation while the roof is open — the cheapest moment you’ll ever have to do it.' ],
    bullets:['EPDM rubber — seamless, 25+ year life','GRP fibreglass — tough, ideal for complex shapes','High-performance felt systems','Repairs to all existing coverings','Insulation upgrades and fall correction','Rooflights and lanterns fitted'] },
  { slug:'pitched-roofing', name:'Pitched Roofing', title:'Pitched Roofing London', h1:'Pitched Roofing',
    lead:'Traditional pitched roofing done properly: slate and tile repairs, partial and full re-roofs, ridges, valleys and heritage detailing across London’s period housing stock.',
    paras:[ 'London’s streetscape is pitched roofs — slate fronts, tiled backs, butterfly valleys and mansards — and keeping them right takes real roofing, not general building. Our team has spent two decades on exactly these roofs: replacing nail-fatigued slates, rebuilding valleys, repointing ridges and re-roofing whole elevations while keeping the street’s character intact.',
      'We work in natural and reclaimed slate, clay and concrete tile, with traditional lead detailing throughout. Whether it’s a handful of slipped slates or a complete strip and re-cover, the job gets the same specification-first approach and fixed written price.' ],
    bullets:['Natural and reclaimed slate work','Clay and concrete tile roofs','Butterfly roofs, mansards and valleys','Ridge and verge repointing or re-fixing','Partial and complete re-roofs','Conservation-minded heritage detailing'] },
  { slug:'leadwork', name:'Leadwork & Flashing', title:'Leadwork & Flashing London', h1:'Leadwork & Flashing',
    lead:'Traditional leadwork by hand: flashings, valleys, bay tops, parapet and box gutters, dormers and full lead flats — the details that keep period roofs dry.',
    paras:[ 'Lead is where most period roof leaks start and where cheap repairs fail fastest. Flashings smeared with mastic, valleys patched with bitumen — they all end the same way. We dress, weld and fit lead the traditional way: correct codes for the application, proper laps and upstands, and fixings that let the metal move with the seasons instead of splitting.',
      'From chimney flashings and stepped abutments to complete lead flat roofs and ornate bay tops, our leadwork blends into the roof it protects — which on London’s conservation streets is exactly how it should be.' ],
    bullets:['Chimney flashings and stepped abutments','Lead valleys, gulleys and secret gutters','Parapet and box gutter linings','Bay window tops and porch roofs','Full lead flat roofs and dormers','Correct lead codes, traditionally fixed'] },
  { slug:'chimney-repairs', name:'Chimney Repairs', title:'Chimney Repairs London', h1:'Chimney Repairs',
    lead:'Chimney repairs, repointing, rebuilding and removal — plus new flashings, cowls and pots. Keep the most exposed brickwork on your house safe and watertight.',
    paras:[ 'Your chimney takes more weather than any other part of the house, and when the mortar goes it goes fast — frost gets in, bricks spall, and in the worst cases stacks become genuinely unsafe. We repoint, rebuild and (where they’re redundant) safely remove chimney stacks across London, always with matching bricks and mortar so the repair doesn’t shout.',
      'Every chimney job includes a check of the flashings, flaunching and pots — because a rebuilt stack with a failed flashing still leaks. Bird guards and cowls fitted while the scaffold’s up cost pennies compared to a return visit.' ],
    bullets:['Repointing in matching mortar','Partial and full stack rebuilds','Redundant stack removal','Flaunching, pots, cowls and bird guards','New lead flashings and back gutters','Structural checks and honest advice'] },
  { slug:'fascias-soffits-guttering', name:'Fascias, Soffits & Guttering', title:'Fascias, Soffits & Guttering London', h1:'Fascias, Soffits & Guttering',
    lead:'New uPVC and timber fascias, soffits and guttering — plus repairs, realignment and unblocking. Protect your roofline and keep rainwater going where it should.',
    paras:[ 'Fascias and soffits do quiet, vital work: they close the roof edge, ventilate the loft and carry your gutters. When they rot — and timber ones eventually do — water gets into rafter feet and the damage spreads out of sight. We replace tired rooflines in low-maintenance uPVC or like-for-like timber, always with correct ventilation so the loft can breathe.',
      'Guttering gets the same treatment: correctly sized, properly aligned to falls, and fixed to brackets that will hold London rainfall. We also repair, realign and unblock existing runs — often the cheapest fix for damp walls there is.' ],
    bullets:['uPVC and timber fascias and soffits','Ventilated rooflines — lofts that breathe','New guttering, correctly sized and aligned','Repairs, realignment and unblocking','Downpipes, hoppers and rainwater goods','Colour-matched finishes'] },
  { slug:'painting-rendering', name:'Painting & Rendering', title:'Painting & Rendering London', h1:'Painting & Rendering',
    lead:'External rendering repairs, re-rendering and masonry painting — weatherproof finishes that lift the whole look of the house while protecting the brickwork beneath.',
    paras:[ 'Cracked, blown or stained render doesn’t just look tired — it lets water behind the surface where frost turns small defects into big ones. We patch-repair where the render is sound, re-render where it isn’t, and finish with breathable masonry paint systems that keep the weather out without trapping moisture in.',
      'From front elevations and bay reveals to whole-house re-renders and parapet walls, the preparation is where the job is won: raking out, stabilising, priming — then the finish everyone sees.' ],
    bullets:['Render crack and patch repairs','Full re-rendering — sand/cement and modern systems','Breathable masonry painting','Parapets, bays and porticos','Preparation-first approach','Scaffold and access included'] },
  { slug:'garden-walls-brickwork', name:'Brickwork & Garden Walls', title:'Brickwork & Garden Walls London', h1:'Brickwork & Garden Walls',
    lead:'Garden walls built and rebuilt, repointing, and general brickwork repairs — the same care we put into chimneys, at ground level. No job too small.',
    paras:[ 'Leaning, cracked or frost-damaged garden walls are one of those jobs that’s hard to find a good tradesman for — too small for builders, outside most roofers’ comfort zone. Not ours. Our team builds new garden and boundary walls, rebuilds failing ones from sound foundations, and repoints tired brickwork in mortar matched to the original.',
      'It’s the same bricklaying skill we use on chimney stacks every week, at ground level. One wall panel or a whole boundary — you’ll get a straight price and a wall that stands plumb.' ],
    bullets:['New garden and boundary walls','Rebuilds from sound foundations','Repointing in matched mortar','Crack stitching and pier repairs','Coping stones and brick-on-edge details','Small jobs genuinely welcome'] },
];

/* ============ FAQ (site-wide page) ============ */
const FAQS = [
  ['How much experience does Roof Care of London have?', `We’ve been roofing across London for ${YEARS} years. The company is led by James Smith and run by a 10-strong team of experienced roofers, so jobs are never handed to subcontractors you’ve never met.`],
  ['Are you insured?', 'Yes — we carry £5 million public liability insurance, and we’re happy to show you the certificate before work starts.'],
  ['Which areas do you cover?', 'South West and Central London: Wimbledon, Streatham, Wandsworth, Balham, Battersea, Dulwich, Lewisham, Clapham, Putney, Fulham, Chelsea, Kensington, Knightsbridge, Mayfair, Westminster, Paddington, Camden, Kilburn, Chiswick, Hammersmith, Vauxhall, Southwark and Brixton — and if you’re just outside those, call us anyway.'],
  ['Do you charge for quotes or surveys?', 'No. Surveys and written quotations are always free and without obligation, whether it’s a single slipped tile or a complete re-roof.'],
  ['What roofing services do you offer?', 'Everything: new roofs, roof repairs, pitched and flat roofing, full re-roofs, leadwork and flashings, chimney repairs, fascias, soffits and guttering, external painting and rendering, and brickwork including garden walls. No job too big, no job too small.'],
  ['How quickly can you attend a leak?', 'For urgent leaks we prioritise making the roof safe — usually within days. The permanent repair is then scheduled as soon as materials and weather allow.'],
  ['How long does a full re-roof take?', 'A typical London terraced house takes one to two weeks including scaffolding up and down. We’ll give you an honest programme with your quote, and the house stays weathertight throughout.'],
  ['Which flat roof system should I choose?', 'EPDM rubber for large simple roofs and the longest maintenance-free life; GRP fibreglass for complex shapes or roofs with foot traffic; high-performance felt where budget is the priority. We’ll recommend honestly for your specific roof.'],
  ['Do you work on listed buildings and in conservation areas?', 'Yes — much of our patch (Kensington, Chelsea, Westminster, Mayfair) is conservation territory. We work in natural slate, clay tile and traditional leadwork, and we’ll flag any consents you need before work starts.'],
  ['Will you handle scaffolding and permits?', 'Yes. Scaffolding, skips and any parking suspensions or licences are arranged by us and included in your written quote.'],
  ['Do you guarantee your work?', 'Yes — workmanship is guaranteed, and the flat roofing systems we install carry manufacturer-backed guarantees on top when installed to specification, which is how we install them.'],
  ['Where can I read your reviews?', 'On Checkatrade (11 reviews) and MyBuilder (4 reviews) — links are on our reviews page — plus the Google reviews featured on our homepage.'],
];

/* ============ TEMPLATE HELPERS ============ */
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
const P = d => '../'.repeat(d); // relative prefix for page depth

const CSS = `
:root{--blue:#63C6EA;--blue-light:#8BD8F3;--blue-deep:#1E90BE;--blue-deeper:#15789E;--ink:#0E1A22;--ink-2:#13232D;--ink-3:#1C303B;--paper:#F3F7FA;--text:#1B2A33;--muted:#5C6B75;--line:#DBE4EA;--white:#fff;--radius:16px;--radius-sm:10px;--shadow:0 10px 30px rgba(14,26,34,.10);--shadow-lg:0 24px 60px -20px rgba(14,26,34,.35)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;color:var(--text);line-height:1.65;background:var(--white)}
h1,h2,h3,h4{font-family:'Barlow',sans-serif;line-height:1.15;color:var(--ink)}
img{max-width:100%;display:block}
.wrap{max-width:1080px;margin:0 auto;padding:0 22px}
a{color:var(--blue-deeper)}
.nav{position:sticky;top:0;z-index:60;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;height:84px;gap:18px}
.nav-inner .brand img{height:64px;width:auto}
.nav-links{display:flex;gap:22px;font-weight:600;font-size:.95rem}
.nav-links a{color:var(--text);text-decoration:none}
.nav-links a:hover{color:var(--blue-deeper)}
.nav-call{display:inline-flex;align-items:center;gap:9px;background:var(--ink);color:#fff;text-decoration:none;font-family:'Barlow',sans-serif;font-weight:700;padding:11px 20px;border-radius:999px;font-size:.95rem;white-space:nowrap}
.nav-call svg{width:15px;height:15px}
.phero{position:relative;background:var(--ink);color:#fff;text-align:center;overflow:hidden}
.phero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.28}
.phero-in{position:relative;z-index:2;padding:72px 22px 66px;max-width:820px;margin:0 auto}
.crumbs{font-size:.82rem;color:rgba(255,255,255,.65);margin-bottom:16px}
.crumbs a{color:rgba(255,255,255,.85);text-decoration:none}
.phero h1{color:#fff;font-size:clamp(2rem,5vw,3.1rem);font-weight:800;letter-spacing:-.01em}
.phero .lead{color:rgba(255,255,255,.85);max-width:640px;margin:16px auto 28px;font-size:1.06rem}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:'Barlow',sans-serif;font-weight:700;font-size:1rem;padding:14px 28px;border-radius:999px;text-decoration:none;transition:transform .15s ease}
.btn:hover{transform:translateY(-2px)}
.btn-primary{background:var(--blue);color:var(--ink)}
.btn-ghost{border:1.5px solid rgba(255,255,255,.55);color:#fff}
.btn-dark{background:var(--ink);color:#fff}
.hero-actions{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
.sec{padding:64px 0}
.sec-alt{background:var(--paper)}
.sec h2{font-size:clamp(1.6rem,3.4vw,2.2rem);font-weight:800;margin-bottom:18px}
.sec p{margin-bottom:16px;max-width:70ch}
.grid2{display:grid;grid-template-columns:1.15fr .85fr;gap:44px;align-items:start}
.checks{list-style:none;display:grid;gap:12px;margin:8px 0 4px}
.checks li{display:flex;gap:12px;align-items:flex-start;font-size:.98rem}
.checks .tk{flex-shrink:0;width:26px;height:26px;border-radius:8px;background:rgba(99,198,234,.18);display:flex;align-items:center;justify-content:center;color:var(--blue-deeper);font-weight:800;font-size:.85rem}
.side-card{background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);padding:26px;position:sticky;top:104px}
.side-card h3{font-size:1.2rem;margin-bottom:10px}
.side-card p{font-size:.94rem;color:var(--muted)}
.side-card .btn{width:100%;margin-top:12px}
.side-card .tel{display:block;text-align:center;font-family:'Barlow',sans-serif;font-weight:800;font-size:1.3rem;color:var(--ink);text-decoration:none;margin-top:14px}
.side-note{font-size:.82rem;color:var(--muted);text-align:center;margin-top:8px}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.photos img{border-radius:var(--radius-sm);aspect-ratio:4/3;object-fit:cover;width:100%}
.faq{max-width:760px}
.faq details{border:1px solid var(--line);border-radius:var(--radius-sm);padding:16px 20px;margin-bottom:12px;background:#fff}
.faq summary{font-family:'Barlow',sans-serif;font-weight:700;font-size:1.02rem;cursor:pointer;color:var(--ink)}
.faq details p{margin:10px 0 2px;color:var(--muted);font-size:.96rem}
.chips{display:flex;flex-wrap:wrap;gap:10px}
.chips a{display:inline-block;padding:9px 16px;border:1px solid var(--line);border-radius:999px;font-size:.88rem;font-weight:600;color:var(--text);text-decoration:none;background:#fff}
.chips a:hover{border-color:var(--blue-deep);color:var(--blue-deeper)}
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.hub-card{background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:24px;height:100%}
.hub-card h3{margin-bottom:8px;font-size:1.12rem}
.hub-card p{font-size:.92rem;color:var(--muted);margin:0}
.trustline{display:flex;flex-wrap:wrap;gap:12px 34px;justify-content:center;padding:22px 0;background:var(--ink-2);color:rgba(255,255,255,.9);font-family:'Barlow',sans-serif;font-weight:600;font-size:.95rem}
.trustline span{display:inline-flex;align-items:center;gap:8px}
.trustline b{color:var(--blue-light)}
.cta-band{background:var(--ink);color:#fff;text-align:center;padding:64px 22px}
.cta-band h2{color:#fff;font-size:clamp(1.7rem,3.6vw,2.4rem);margin-bottom:10px}
.cta-band p{color:rgba(255,255,255,.8);max-width:520px;margin:0 auto 26px}
.foot{background:#0A141B;color:rgba(255,255,255,.7);padding:52px 0 0;font-size:.93rem}
.foot-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1.2fr;gap:36px;padding-bottom:38px}
.foot h4{color:#fff;font-size:1.02rem;margin-bottom:13px}
.foot a{display:block;color:rgba(255,255,255,.68);text-decoration:none;padding:4px 0}
.foot a:hover{color:var(--blue-light)}
.foot .brand img{height:60px;margin-bottom:12px}
.foot p{margin-bottom:8px}
.foot-bottom{border-top:1px solid rgba(255,255,255,.08);padding:20px 0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;font-size:.8rem}
.foot-bottom a{display:inline;color:var(--blue-light)}
@media(max-width:880px){.nav-links{display:none}.grid2{grid-template-columns:1fr;gap:30px}.side-card{position:static}.photos{grid-template-columns:1fr 1fr}.foot-grid{grid-template-columns:1fr 1fr}}
@media(max-width:540px){.sec{padding:36px 0}.sec h2{margin-bottom:14px}.phero-in{padding:42px 18px 38px}.phero .lead{margin:12px auto 22px}.trustline{gap:8px 20px;padding:14px 12px;font-size:.85rem}.grid2{gap:22px}.side-card{padding:18px}.photos{grid-template-columns:1fr 1fr;gap:10px}.checks{gap:9px}.faq details{padding:13px 16px}.chips{gap:8px}.chips a{padding:7px 12px;font-size:.8rem}.card-grid{gap:10px}.hub-card{padding:14px 16px}.hub-card h3{font-size:1rem;margin-bottom:3px}.hub-card p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.cta-band{padding:42px 18px}.foot-grid{grid-template-columns:1fr 1fr;gap:20px 14px}.foot-grid>div:first-child,.foot-grid>div:last-child{grid-column:1/-1}.nav-inner{height:72px}.nav-inner .brand img{height:52px}}
`;

function head(d, { title, desc, canonicalPath }) {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none'; img-src 'self' data: https://*.basemaps.cartocdn.com; media-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://unpkg.com; connect-src 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${DOMAIN}${canonicalPath}">
<meta name="theme-color" content="#0E1A22">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BIZ}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${DOMAIN}${canonicalPath}">
<meta property="og:image" content="https://innov8-workflows.github.io/Roof-Care-Of-London/og-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://innov8-workflows.github.io/Roof-Care-Of-London/og-card.jpg">
<link rel="icon" type="image/png" href="${P(d)}assets/favicon.png">
<link rel="apple-touch-icon" href="${P(d)}assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${P(d)}assets/site.css">
</head>
<body>`;
}

function nav(d) {
  return `<header class="nav"><div class="wrap nav-inner">
  <a class="brand" href="${P(d)}" aria-label="${BIZ} home"><img src="${P(d)}assets/logo.webp" alt="${BIZ}"></a>
  <nav class="nav-links" aria-label="Primary">
    <a href="${P(d)}services/">Services</a>
    <a href="${P(d)}our-work/">Our Work</a>
    <a href="${P(d)}areas/">Areas</a>
    <a href="${P(d)}about/">About</a>
    <a href="${P(d)}faq/">FAQ</a>
    <a href="${P(d)}reviews/">Reviews</a>
    <a href="${P(d)}contact/">Contact</a>
  </nav>
  <a class="nav-call" href="tel:${LANDLINE_INTL}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>${LANDLINE}</a>
</div></header>`;
}

const trustline = `<div class="trustline"><span><b>${YEARS} Years’</b>&nbsp;Experience</span><span><b>£5m</b>&nbsp;Public Liability Insurance</span><span><b>10-Strong</b>&nbsp;Local Team</span><span>Free No-Obligation Quotes</span></div>`;

function ctaBand(d, areaName) {
  const where = areaName ? ` in ${areaName}` : '';
  return `<section class="cta-band"><h2>Need a roofer${esc(where)} you can rely on?</h2><p>Free survey, fixed written quote, and a team that turns up. Call, WhatsApp or send us a message.</p><div class="hero-actions"><a class="btn btn-primary" href="tel:${LANDLINE_INTL}">Call ${LANDLINE}</a><a class="btn btn-ghost" href="${P(d)}contact/">Request a quote</a></div></section>`;
}

function footer(d) {
  const y = new Date().getFullYear();
  return `<footer class="foot"><div class="wrap">
  <div class="foot-grid">
    <div><span class="brand"><img src="${P(d)}assets/logo.webp" alt="${BIZ}"></span><p>Trusted roofing specialists across South West &amp; Central London. ${YEARS} years’ experience, £5m public liability insurance.</p></div>
    <div><h4>Services</h4>${SERVICES.slice(0,6).map(s=>`<a href="${P(d)}${s.slug}/">${s.name}</a>`).join('')}<a href="${P(d)}services/">All services</a></div>
    <div><h4>Popular areas</h4>${['battersea','clapham','wimbledon','fulham','kensington','wandsworth'].map(sl=>`<a href="${P(d)}roofing-contractors-${sl}/">Roofers ${areaBySlug[sl].name}</a>`).join('')}<a href="${P(d)}areas/">All areas</a></div>
    <div><h4>Contact</h4><p><a href="tel:${LANDLINE_INTL}">${LANDLINE}</a><a href="tel:${MOBILE_INTL}">${MOBILE}</a><a href="mailto:${EMAIL}">${EMAIL}</a></p><p>${ADDRESS.street},<br>${ADDRESS.locality} ${ADDRESS.postcode}</p><p><a href="${CHECKATRADE}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:9px"><img src="${P(d)}assets/checkatrade.png" alt="" width="20" height="20">Checkatrade reviews</a><a href="${MYBUILDER}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:9px"><img src="${P(d)}assets/mybuilder.png" alt="" width="20" height="20">MyBuilder reviews</a></p></div>
  </div>
  <div class="foot-bottom"><span>&copy; ${y} ${BIZ} &middot; ${ADDRESS.postcode}, London</span><span>Website by <a href="https://innov8workflows.co.uk" target="_blank" rel="noopener">Innov8 Workflows</a></span></div>
</div></footer></body></html>`;
}

function pageHero(d, { crumb, h1, lead }) {
  return `<section class="phero"><img class="phero-bg" src="${P(d)}assets/hero.jpg" alt="" aria-hidden="true"><div class="phero-in">
  <p class="crumbs"><a href="${P(d)}">Home</a> &rsaquo; ${crumb}</p>
  <h1>${esc(h1)}</h1><p class="lead">${esc(lead)}</p>
  <div class="hero-actions"><a class="btn btn-primary" href="tel:${LANDLINE_INTL}">Call ${LANDLINE}</a><a class="btn btn-ghost" href="${P(d)}contact/">Free written quote</a></div>
</div></section>${trustline}`;
}

const sideCard = d => `<aside class="side-card"><h3>Free survey &amp; quote</h3><p>Tell us what the roof’s doing and we’ll take a look — free, no obligation, no pressure.</p><a class="btn btn-dark" href="${P(d)}contact/">Request a quote</a><a class="tel" href="tel:${LANDLINE_INTL}">${LANDLINE}</a><p class="side-note">or ${LANDLINE} · ${EMAIL}</p></aside>`;

const photosBlock = d => `<div class="photos"><img src="${P(d)}assets/work-1.jpg" alt="Completed roofing work in London" loading="lazy"><img src="${P(d)}assets/work-2.jpg" alt="Roof repair by Roof Care of London" loading="lazy"><img src="${P(d)}assets/work-3.jpg" alt="Finished roof in South West London" loading="lazy"></div>`;

function faqBlock(faqs) {
  return `<div class="faq">${faqs.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
}

function faqSchema(faqs, url) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context':'https://schema.org','@type':'FAQPage','url':url,
    mainEntity: faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))
  })}</script>`;
}

function bizSchema(extra = {}) {
  return `<script type="application/ld+json">${JSON.stringify(Object.assign({
    '@context':'https://schema.org','@type':'RoofingContractor',name:BIZ,url:DOMAIN+'/', telephone:LANDLINE_INTL,
    email:EMAIL, foundingDate:String(new Date().getFullYear()-YEARS), founder:{'@type':'Person',name:'James Smith'},
    numberOfEmployees:{'@type':'QuantitativeValue',value:10},
    address:{'@type':'PostalAddress',streetAddress:ADDRESS.street,addressLocality:ADDRESS.locality,postalCode:ADDRESS.postcode,addressCountry:'GB'},
    areaServed:AREAS.map(a=>({'@type':'Place',name:a.name+', London'})),
    sameAs:[CHECKATRADE,MYBUILDER],
  }, extra))}</script>`;
}

function write(rel, html) {
  const f = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}

/* ============ PAGE BUILDERS ============ */
const urls = ['/']; // sitemap collector (home exists already)

function comboPage(svc, area) {
  const d = 1, slug = `${svc.prefix}-${area.slug}`;
  const canonical = `/${slug}/`;
  urls.push(canonical);
  const title = `${svc.name} ${area.name} – Roof Care Of London`;
  const desc = `${svc.name} in ${area.name} by ${BIZ} — ${YEARS} years’ experience, £5m insured, free written quotes. Call ${LANDLINE}.`;
  const faqs = svc.faqs(area);
  const others = COMBOS.filter(c=>c.prefix!==svc.prefix).map(c=>`<a href="../${c.prefix}-${area.slug}/">${c.name} ${area.name}</a>`).join('');
  const nearby = area.nearby.map(sl=>`<a href="../${svc.prefix}-${sl}/">${svc.name} ${areaBySlug[sl].name}</a>`).join('');
  const html = head(d,{title,desc,canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:`${svc.name} ${area.name}`, h1:`${svc.name} ${area.name}`, lead:svc.lead(area)})
    + `<section class="sec"><div class="wrap grid2"><div>
        <h2>${svc.name} in ${area.name}, done properly</h2>
        ${svc.paras(area).map(p=>`<p>${esc(p)}</p>`).join('')}
        <ul class="checks">${svc.bullets.map(b=>`<li><span class="tk">✓</span><span>${esc(b)}</span></li>`).join('')}</ul>
      </div>${sideCard(d)}</div></section>
      <section class="sec sec-alt"><div class="wrap">
        <h2>Local roofers who know ${area.name}</h2>
        <p>${esc(area.blurb)}</p>
        ${photosBlock(d)}
      </div></section>
      <section class="sec"><div class="wrap">
        <h2>${svc.name} ${area.name} — common questions</h2>
        ${faqBlock(faqs)}
      </div></section>
      <section class="sec sec-alt"><div class="wrap">
        <h2>Other roofing services in ${area.name}</h2>
        <div class="chips">${others}</div>
        <h2 style="margin-top:34px">${svc.name} nearby</h2>
        <div class="chips">${nearby}</div>
      </div></section>`
    + ctaBand(d, area.name)
    + bizSchema({'@type':'RoofingContractor', makesOffer:{'@type':'Offer',itemOffered:{'@type':'Service',name:`${svc.name} ${area.name}`,areaServed:`${area.name}, London`}}})
    + faqSchema(faqs, DOMAIN+canonical)
    + footer(d);
  write(`${slug}/index.html`, html);
}

function servicePage(svc) {
  const d = 1, canonical = `/${svc.slug}/`;
  urls.push(canonical);
  const title = `${svc.title} – Roof Care Of London`;
  const desc = `${svc.lead.slice(0,150)}`;
  const areaChips = AREAS.map(a=>`<a href="../roofing-contractors-${a.slug}/">${a.name}</a>`).join('');
  const html = head(d,{title,desc,canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:svc.name, h1:svc.h1, lead:svc.lead})
    + `<section class="sec"><div class="wrap grid2"><div>
        <h2>${svc.name} across London</h2>
        ${svc.paras.map(p=>`<p>${esc(p)}</p>`).join('')}
        <ul class="checks">${svc.bullets.map(b=>`<li><span class="tk">✓</span><span>${esc(b)}</span></li>`).join('')}</ul>
      </div>${sideCard(d)}</div></section>
      <section class="sec sec-alt"><div class="wrap"><h2>Recent work</h2>${photosBlock(d)}</div></section>
      <section class="sec"><div class="wrap"><h2>Areas we cover</h2><div class="chips">${areaChips}</div></div></section>`
    + ctaBand(d)
    + bizSchema({makesOffer:{'@type':'Offer',itemOffered:{'@type':'Service',name:svc.name,areaServed:'London'}}})
    + footer(d);
  write(`${svc.slug}/index.html`, html);
}

function servicesHub() {
  const d = 1, canonical = '/services/';
  urls.push(canonical);
  const cards = SERVICES.map(s=>`<a href="../${s.slug}/" style="text-decoration:none"><div class="hub-card"><h3>${s.name}</h3><p>${esc(s.lead.split(' —')[0].split('. ')[0])}.</p></div></a>`).join('');
  const html = head(d,{title:'Services – Roof Care Of London',desc:`Every roofing service under one roof: repairs, re-roofs, flat roofing, leadwork, chimneys, fascias, rendering and more. ${YEARS} years’ experience across London.`,canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'Services', h1:'Our Services', lead:'Every roofing trade under one roof — pitched, flat, heritage and everything around it. No job too big, no job too small.'})
    + `<section class="sec"><div class="wrap"><div class="card-grid">${cards}</div></div></section>
       <section class="sec sec-alt"><div class="wrap"><h2>Areas we cover</h2><div class="chips">${AREAS.map(a=>`<a href="../roofing-contractors-${a.slug}/">${a.name}</a>`).join('')}</div></div></section>`
    + ctaBand(d) + bizSchema() + footer(d);
  write('services/index.html', html);
}

function areasHub() {
  const d = 1, canonical = '/areas/';
  urls.push(canonical);
  const cards = AREAS.map(a=>`<a href="../roofing-contractors-${a.slug}/" style="text-decoration:none"><div class="hub-card"><h3>Roofers in ${a.name}</h3><p>${esc(a.blurb.split('. ')[0])}.</p></div></a>`).join('');
  const html = head(d,{title:'Areas We Cover – Roof Care Of London',desc:'Roofers covering South West & Central London: Wimbledon, Battersea, Clapham, Fulham, Kensington, Chelsea, Westminster and 16 more areas. Free quotes.',canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'Areas', h1:'Areas We Cover', lead:'Based in Kensington W8 and working across South West and Central London — if you’re near one of these areas, you’re on our patch.'})
    + `<section class="sec"><div class="wrap"><div class="card-grid">${cards}</div></div></section>`
    + ctaBand(d) + bizSchema() + footer(d);
  write('areas/index.html', html);
}

function aboutPage() {
  const d = 1, canonical = '/about/';
  urls.push(canonical);
  const html = head(d,{title:'About – Roof Care Of London',desc:`${BIZ}: a 10-strong London roofing team led by James Smith, with ${YEARS} years’ experience and £5m public liability insurance. Based in Kensington W8.`,canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'About', h1:'About Roof Care of London', lead:`A local, family-feel roofing company: 10 experienced roofers, ${YEARS} years on London’s roofs, and a reputation we protect on every job.`})
    + `<section class="sec"><div class="wrap grid2"><div>
        <h2>Led from the top, on the tools</h2>
        <p>Roof Care of London Ltd is led by founder James Smith, who has spent ${YEARS} years working on London’s roofs — from Victorian terraces in Battersea and Clapham to listed properties in Kensington, Chelsea and Westminster. James still leads projects personally, which is why the standard doesn’t slip between the quote and the finished roof.</p>
        <p>The team behind him is 10 strong: experienced roofers, leadworkers and bricklayers who’ve worked together for years. We don’t hand your job to unknown subcontractors, and we don’t disappear when the deposit clears. Every project carries £5 million public liability insurance and a workmanship guarantee.</p>
        <p>We’re based at ${ADDRESS.street}, London ${ADDRESS.postcode} — in the heart of the area we serve. Our reviews on Checkatrade and MyBuilder say more than we ever could: honest pricing, tidy sites, and roofs that stay fixed.</p>
        <ul class="checks"><li><span class="tk">✓</span><span>${YEARS} years’ roofing experience</span></li><li><span class="tk">✓</span><span>10-strong team — no unknown subcontractors</span></li><li><span class="tk">✓</span><span>£5 million public liability insurance</span></li><li><span class="tk">✓</span><span>Free surveys and fixed written quotes</span></li><li><span class="tk">✓</span><span>Reviewed on Checkatrade and MyBuilder</span></li></ul>
      </div><div><img src="../assets/team.jpg" alt="The Roof Care of London team" style="border-radius:var(--radius);box-shadow:var(--shadow-lg)"><div style="margin-top:16px">${sideCard(d)}</div></div></div></section>
      <section class="sec sec-alt"><div class="wrap"><h2>Recent work</h2>${photosBlock(d)}</div></section>`
    + ctaBand(d) + bizSchema() + footer(d);
  write('about/index.html', html);
}

function contactPage() {
  const d = 1, canonical = '/contact/';
  urls.push(canonical);
  const html = head(d,{title:'Contact – Roof Care Of London',desc:`Get a free roofing quote from ${BIZ}. Call ${LANDLINE} or ${LANDLINE}, email ${EMAIL}, or send a message — no obligation, no pressure.`,canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'Contact', h1:'Get In Touch', lead:'Free surveys, fixed written quotes, honest advice. Tell us what the roof’s doing and we’ll take it from there.'})
    + `<section class="sec"><div class="wrap grid2"><div>
        <h2>Talk to a roofer, not a call centre</h2>
        <p>Call us on <a href="tel:${LANDLINE_INTL}"><b>${LANDLINE}</b></a> and you’ll get straight through to the team. Prefer mobile or WhatsApp? We’re on <a href="tel:${MOBILE_INTL}"><b>${MOBILE}</b></a>. Email works too: <a href="mailto:${EMAIL}"><b>${EMAIL}</b></a>.</p>
        <p>We’re based at ${ADDRESS.street}, London ${ADDRESS.postcode}, and cover the whole of South West and Central London. Surveys are free and quotes are fixed and in writing — no estimates that drift.</p>
        <ul class="checks"><li><span class="tk">✓</span><span>Office: ${LANDLINE}</span></li><li><span class="tk">✓</span><span>Mobile / WhatsApp: ${MOBILE}</span></li><li><span class="tk">✓</span><span>Email: ${EMAIL}</span></li><li><span class="tk">✓</span><span>${ADDRESS.street}, London ${ADDRESS.postcode}</span></li></ul>
        <div class="hero-actions" style="justify-content:flex-start;margin-top:22px"><a class="btn btn-dark" href="tel:${LANDLINE_INTL}">Call ${LANDLINE}</a><a class="btn btn-primary" href="https://wa.me/447877533880?text=Hi%20Roof%20Care%20of%20London%2C%20I%20found%20you%20through%20your%20website%20%E2%80%94%20I'd%20like%20a%20quote." target="_blank" rel="noopener">WhatsApp us</a></div>
      </div><div><img src="../assets/hero.jpg" alt="Roof Care of London at work" style="border-radius:var(--radius);box-shadow:var(--shadow-lg)"></div></div></section>`
    + ctaBand(d) + bizSchema() + footer(d);
  write('contact/index.html', html);
}

function faqPage() {
  const d = 1, canonical = '/faq/';
  urls.push(canonical);
  const html = head(d,{title:'FAQs – Roof Care Of London',desc:'Answers to the questions London homeowners ask us most: insurance, quotes, timescales, flat roof systems, conservation areas and more.',canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'FAQ', h1:'Frequently Asked Questions', lead:'Straight answers to the questions we’re asked most. Can’t see yours? Call us — we’ll give you a straight answer too.'})
    + `<section class="sec"><div class="wrap">${faqBlock(FAQS)}</div></section>`
    + ctaBand(d) + bizSchema() + faqSchema(FAQS, DOMAIN+canonical) + footer(d);
  write('faq/index.html', html);
}

function geoStub() {
  // legacy WP taxonomy page — redirect home
  write('geo/standard-geo/index.html', `<!DOCTYPE html><html lang="en-GB"><head><meta charset="UTF-8"><title>Roof Care Of London</title><meta name="robots" content="noindex"><link rel="canonical" href="${DOMAIN}/"><meta http-equiv="refresh" content="0; url=../../"><script>location.replace('../../');</script></head><body><p><a href="../../">Roof Care of London</a></p></body></html>`);
}

function notFound() {
  const d = 0;
  const html = head(d,{title:'Page not found – Roof Care Of London',desc:'Sorry, that page doesn’t exist. Head back to Roof Care of London’s homepage.',canonicalPath:'/404.html'}) + nav(d)
    + `<section class="sec" style="text-align:center;padding:110px 0"><div class="wrap"><h1 style="font-size:3rem;margin-bottom:12px">Page not found</h1><p style="margin:0 auto 28px">That page doesn’t exist — but the roofers do. Try the homepage or give us a call.</p><div class="hero-actions"><a class="btn btn-dark" href="./">Back to homepage</a><a class="btn btn-primary" href="tel:${LANDLINE_INTL}">Call ${LANDLINE}</a></div></div></section>`
    + footer(d);
  write('404.html', html);
}

function workPage() {
  const d = 1, canonical = '/our-work/';
  urls.push(canonical);
  const photos = ['gallery-01','hero','work-5','work-2','work-4','work-3','work-1','g-1','g-2','g-3','g-4','g-5'];
  const grid = photos.map((p,i)=>`<a href="../assets/${p}.jpg" target="_blank" rel="noopener"><img src="../assets/${p}.jpg" alt="Roofing project by Roof Care of London ${i+1}" loading="lazy" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:var(--radius-sm);display:block"></a>`).join('');
  const html = head(d,{title:'Our Work – Roof Care Of London',desc:'Recent roofing projects by Roof Care of London: re-roofs, flat roofs, leadwork and chimney repairs across South West and Central London.',canonicalPath:canonical}) + nav(d)
    + pageHero(d,{crumb:'Our Work', h1:'Our Work', lead:'Real projects, photographed by our own team — re-roofs, flat roofs, leadwork and more across London. Tap any photo to view it full size.'})
    + `<section class="sec"><div class="wrap"><div class="card-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${grid}</div></div></section>`
    + ctaBand(d) + bizSchema() + footer(d);
  write('our-work/index.html', html);
}

/* ============ RUN ============ */
fs.writeFileSync(path.join(ROOT,'assets','site.css'), CSS);
COMBOS.forEach(svc => AREAS.forEach(area => comboPage(svc, area)));
SERVICES.forEach(servicePage);
servicesHub(); areasHub(); aboutPage(); contactPage(); faqPage(); workPage(); geoStub(); notFound();
urls.push('/reviews/');

fs.writeFileSync(path.join(ROOT,'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u=>`  <url><loc>${DOMAIN}${u}</loc></url>`).join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(ROOT,'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`);

console.log(`built ${urls.length} sitemap URLs (${COMBOS.length}x${AREAS.length} combos + ${SERVICES.length} services + hubs)`);
