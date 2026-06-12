/* ============================================================
   THE FRAGMENTS
   ============================================================ */
const FRAGS = {
f1: { title:'The Welcome Stone', loc:'MONUMENT PLAZA — OUTER RING', text:
'The glyphs resolve under your lamp:\n\n"WE BUILT THIS WORLD FROM MEMORY. EVERY STONE STANDS WHERE A STONE ONCE STOOD, ON A WORLD WE COULD NOT KEEP. BE GENTLE WITH IT. IT IS A PORTRAIT OF SOMETHING LOVED."\n\nThe coastlines, the mountains, the river valleys. They copied all of it. This is not Earth. It is Earth, remembered perfectly.' },
f2: { title:'The Census Stone', loc:'MONUMENT PLAZA', text:
'A wall of names. Your suit counts them by density alone: eleven billion, give or take a city.\n\nThere are no dates. No causes. Beside each name, the same single glyph, repeated eleven billion times.\n\nThe translator offers two readings: "chose", or "became".\n\nNone of these are graves.' },
f3: { title:"A Child's Instrument", loc:'MONUMENT PLAZA', text:
'A small spiral of silver, light as a leaf. When your glove closes around it, it plays one low, patient note.\n\nThe note bends, pitch rising, softening, as if adjusting itself to the shape of your hand. As if it had been waiting to learn a new hand.\n\nIt is ten thousand years old, and it is still in tune.' },
f4: { title:'The Spire Door', loc:'THE DATA SPIRE — FACADE', text:
'Letters three meters tall, cut into the facade:\n\n"HERE WE KEPT EVERYTHING WE COULD NOT BEAR TO LOSE."\n\nBelow, smaller, almost an afterthought:\n\n"WHICH WAS EVERYTHING."' },
f5: { title:'Archive Log 11,408', loc:'THE DATA SPIRE — TERMINAL', text:
'"...capacity exceeded again. Eleven billion lives. Every sunrise each of them ever saw, every voice they ever loved. No vault of matter holds it."\n\nThe final entry is not an apology. It is a solution:\n\n"We will stop building vaults. We have taught the stone itself to remember. The walls hold us now. Storage is no longer a place. It is everywhere."' },
f6: { title:'The Standing Choir', loc:'THE DATA SPIRE — NAVE', text:
'Five figures of light, singing without sound. Your suit renders the pressure waves as a slow chord, older than any music you know.\n\nWhen you step closer, they pause.\n\nNot the way recordings pause. The way singers do, when someone enters the hall: leaving room in the music for one more voice.' },
f7: { title:'The Departures Board', loc:'TRANSIT HUB — CONCOURSE', text:
'Ten thousand years of weather, and it still flickers. Hundreds of routes, every one of them marked complete.\n\nThe final line has no destination glyph at all. The translator renders it:\n\n"ALL ROUTES CONVERGE."' },
f8: { title:'Platform Echo', loc:'TRANSIT HUB — PLATFORM 1', text:
'A pressure-image, replaying: a crowd, on the last day. No luggage. No queues. No panic.\n\nThey are embracing. Someone is laughing. You can see the shape of the laugh travel through the crowd like wind through a field.\n\nThey are not fleeing anything. They look like people arriving early for something wonderful.' },
f9: { title:'Maintenance Log, Final', loc:'TRANSIT HUB — DROWNED TERMINAL', text:
'The pump system did not fail. It was decommissioned. Gently, deliberately, the way you put a tool back in its drawer.\n\nThe last entry:\n\n"Let the water in. It remembers the shape of rivers better than we do. Let it hold the station for us. It will know what to keep."' },
f10:{ title:'A Recorded Voice', loc:'RESIDENTIAL TOWER — A HOME', text:
'A voice, kept in a prism the size of your thumb. A parent, speaking low, the cadence of bedtime:\n\n"You’ll see. It isn’t an ending, little one. It’s just a wider way of being a person. Like a river reaching the sea. You don’t stop being water."\n\nA child answers, too soft to translate. The parent laughs.\n\nThe recording does not end. It only becomes quiet.' },
f11:{ title:'Scratched Into the Sill', loc:'RESIDENTIAL TOWER — A HOME', text:
'Small, uneven glyphs. A child’s handwriting, scratched with something dull. The translator hesitates, then offers:\n\n"THE WALLS ARE WARM."\n\nYou pull off one glove and press your palm flat against the concrete.\n\nThe walls are warm.' },
f12:{ title:'Research Log — THE TRANSLATION', loc:'RESEARCH DOME', text:
'"Consciousness is a pattern. We have spent three centuries proving the pattern does not care what carries it.\n\nNeurons. Light. Lattices of stone. Slow cellulose. Anything patient enough can hold a person, if the person is willing to move at its speed.\n\nStone is patient. Water is patient. We are done being brief."\n\nThe project glyph repeats across every surface in the dome. You have seen it before: on the Census Stone, beside eleven billion names.' },
f13:{ title:'The First Volunteer', loc:'RESEARCH DOME — THE GARDEN', text:
'A tree of light grows through the center of the dome. The record beside it is half hymn, half lab note:\n\n"Subject ELEN SAYR, 141st year. Volunteer zero. Translation into the dome garden completed without loss.\n\nThe vines learned her laugh in three days. She says, and the garden agrees, that she has never been less afraid."\n\nThe blue leaves above you turn, very slightly, in your direction. There is no wind.' },
f14:{ title:'The One Who Stayed', loc:'RESEARCH DOME — BY THE DOOR', text:
'A bench beside the door, facing where the sun rises. A final log, in a plainer hand:\n\n"Someone had to stay shaped like this long enough to turn off the lights. I volunteered. I am not sad. I had ten thousand mornings, and I spent them all here, talking to the garden.\n\nWhen I am done, I will walk into the grove and stop being brief, like everyone I love."\n\nThere are no bones on the bench. At its foot, the moss glows brighter than anywhere else in the city.' },
f15:{ title:'The Tide Clock', loc:'THE BREAKWATER', text:
'A seawall curves out of sight, taller than the city. Set into it, a vast dial worn almost smooth, and statues of figures facing the water, eroded faceless by ten thousand tides.\n\nThe inscription is nearly gone. Your suit reconstructs the fragments:\n\n"WE BUILT THIS WALL NOT TO KEEP THE SEA OUT, BUT TO MARK HOW PATIENTLY IT WAITED. WHEN THE LAST OF US IS WATER, THIS CLOCK WILL STILL BE RIGHT TWICE A DAY. WE FOUND THAT COMFORTING."\n\nThe statues are not mourning. They are watching the tide come in, the way you wait for someone you love at a door.' },
f16:{ title:'The Ladder They Climbed Down', loc:'THE TETHER', text:
'A column of impossible engineering rises from a ruined anchor and ends, sheared clean, a kilometer up. A snapped cable arcs across the sky and vanishes into the sea. Once it reached orbit.\n\n"THE TETHER WAS OUR FIRST WAY OUT. FOR CENTURIES WE CLIMBED IT TOWARD THE STARS, CERTAIN THAT WAS WHERE A SPECIES GOES TO LAST FOREVER.\n\nThen the Translation taught us that forever was never up there. It was here, underfoot, in the stone and the rain. So we climbed back down, and we cut the ladder behind us, gently, the way you close a door on a room you have outgrown but still love."\n\nThe beacons still blink, patiently, for ships that will never come. You are the first in ten thousand years.' },
LOCKED:{ title:'The Sealed Gate', loc:'THE FINAL CHAMBER', text:
'The gate does not move. Deep inside, something is waiting, the way a held breath waits.\n\nThe city has not finished speaking to you. Find more of what it left behind, and come back.' }
};
