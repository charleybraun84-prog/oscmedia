// Sermon Agentic Analysis Service

export const SERMON_SAMPLES = [
  {
    id: 'sermon-1',
    title: 'Stepping Over the Threshold',
    speaker: 'Pastor Marcus Vance',
    date: 'June 14, 2026',
    content: `[00:05] Welcome church! Today, we are opening a new series called "Thresholds".
[01:30] A threshold is the boundary between where you've been and where you're going. It's the wood and stone under the doorway. But spiritually, it represents the gap between comfort and faith.
[03:15] Most of us live our entire lives looking at the threshold. We admire it, we study it, we think about what's on the other side. But we never actually step over.
[04:22] Let me tell you about a rickety swing bridge I had to cross in Costa Rica. It was suspended 150 feet above a rushing gorge. The wind was howling, and the wooden slats were damp and slippery. I stood there, clutching the guide wire, frozen. And in that moment, I realized: You cannot cross the chasm of your fears if you keep one foot anchored to the safety of the shore. The bridge will shake, but the builder is faithful!
[07:10] In Joshua chapter 3, the priests had to step into the Jordan River while it was still at flood stage. God didn't part the water while they stood dry on the bank. They had to get their feet wet first.
[09:32] Comfort is a cozy bed, but you can’t run a race in your sleep. Divine momentum is waiting for you outside the borders of what feels safe. We have stylized our lives to avoid all risk, and then we wonder why we don't see the power of God.
[12:15] What threshold are you standing at today? Is it a difficult conversation you've been avoiding? Is it a step of generosity that scares you? Is it admitting that you need help with an addiction or a failing marriage?
[14:05] The threshold isn't a barrier; it's an invitation. Today, you aren't just looking at the door—you are walking through it. Don't look back at the safety of yesterday. God is already waiting in your tomorrow.
[17:20] Let us pray. Father, give us the courage of the priests at the Jordan. Give us feet that are willing to get wet, and hearts that trust in the shaking.
[18:45] If you need to make a decision today to follow Jesus, or to step over a threshold in your life, I want you to know that the shore you are leaving behind is nothing compared to the horizon He is opening before you. Thank you, and amen.`,
    analysis: {
      themes: [
        {
          name: 'Faith Over Fear',
          description: 'Navigating transition and fear by trusting God during moments of instability.',
          tags: ['#Faith', '#OvercomingFear', '#Trust']
        },
        {
          name: 'Divine Momentum',
          description: 'Spiritual growth requires action; momentum begins when we step out of comfort.',
          tags: ['#Growth', '#Purpose', '#Momentum']
        },
        {
          name: 'Active Obedience',
          description: 'Reflected in the Joshua 3 Jordan River crossing—taking the step before the miracle manifests.',
          tags: ['#Obedience', '#Joshua3', '#Miracles']
        }
      ],
      crescendos: [
        { time: '00:05', value: 30, label: 'Intro & Welcome' },
        { time: '02:00', value: 45, label: 'Defining the Threshold' },
        { time: '04:35', value: 85, label: 'Costa Rica Swing Bridge Story' },
        { time: '07:30', value: 70, label: 'Biblical Application (Joshua 3)' },
        { time: '09:45', value: 88, label: 'Comfort Zone Challenge' },
        { time: '12:30', value: 65, label: 'Practical Personal Application' },
        { time: '14:15', value: 96, label: 'The Climax Call to Action' },
        { time: '17:30', value: 50, label: 'Reflective Prayer' },
        { time: '19:00', value: 75, label: 'Altar Invitation Climax' }
      ],
      ctas: [
        {
          timestamp: '04:38',
          quote: 'You cannot cross the chasm of your fears if you keep one foot anchored to the safety of the shore.',
          action: 'Identify the "shore" of security you are clinging to and write it down.'
        },
        {
          timestamp: '14:05',
          quote: "The threshold isn't a barrier; it's an invitation. Today, you aren't just looking at the door—you are walking through it.",
          action: 'Commit to stepping over one practical boundary of obedience this week.'
        }
      ],
      clips: [
        {
          id: 'clip-1-1',
          title: 'The Shaking Bridge of Faith',
          start: '04:22',
          end: '04:47',
          duration: 25,
          quote: 'You cannot cross the chasm of your fears if you keep one foot anchored to the safety of the shore. The bridge will shake, but the builder is faithful!',
          description: 'Vivid illustration of crossing a suspension bridge in Costa Rica, illustrating trust in the face of natural fear.',
          visualTheme: 'Tight close-up focusing on the speaker\'s eyes and expressions. Warm spot beam on the preacher with dark background, emphasizing focal tension.',
          draftCaption: 'Are you letting fear keep you anchored to the shore? 🌊 The bridge might shake, but the Builder is faithful. Step out in faith today! #FaithOverFear #StepOut #TrustGod #MarcusVance'
        },
        {
          id: 'clip-1-2',
          title: 'Comfort vs Momentum',
          start: '09:32',
          end: '10:02',
          duration: 30,
          quote: 'Comfort is a cozy bed, but you can’t run a race in your sleep. Divine momentum is waiting for you outside the borders of what feels safe.',
          description: 'A challenge regarding spiritual complacency and how seeking risk-free lives dampens active faith.',
          visualTheme: 'Medium shot from a low angle, moving slowly on a camera slider to create dynamic momentum. High-key amber backlight highlighting preacher gestures.',
          draftCaption: 'Comfort is cozy, but you can\'t run a race in your sleep! 🏃‍♂️ Real growth and divine momentum are found outside what feels safe. #Purpose #Growth #GetUncomfortable #ChristianMotivation'
        },
        {
          id: 'clip-1-3',
          title: 'An Invitation, Not a Barrier',
          start: '14:05',
          end: '14:32',
          duration: 27,
          quote: 'The threshold isn\'t a barrier; it\'s an invitation. Today, you aren\'t just looking at the door—you are walking through it.',
          description: 'The primary emotional climax urging a transition from passive contemplation to active faith-filled decisions.',
          visualTheme: 'Wide cinematic camera crane shot from the back of the auditorium, slowly dipping down to capture the preacher framed against the illuminated congregation.',
          draftCaption: 'The door in front of you isn\'t a roadblock—it\'s He inviting you in. Will you look at it, or will you walk through it? 👇 #Invitation #NewBeginning #FaithWalk #ChurchCommunity'
        }
      ]
    }
  },
  {
    id: 'sermon-2',
    title: 'The Architecture of Rest',
    speaker: 'Dr. Sarah Bennett',
    date: 'June 7, 2026',
    content: `[00:10] Good morning. Let's talk about the ambient noise of our lives. We live in a culture that treats busyness as a status symbol.
[02:05] If you ask someone how they are doing, nine times out of ten, their immediate answer is, "So busy, but good!" We wear our exhaustion like a badge of honor, a gold medal in the race of self-importance.
[05:15] But let's be honest. We plug our phones in every single night, but we expect our souls to run on a single percentage point for months. Your exhaustion is not a badge of honor. It is a warning light on the dashboard of your life, telling you that your engine is about to seize.
[08:40] God did not design human beings to be linear production machines. In Genesis, the first full day of human existence wasn't a workday; it was the Sabbath. We were created to work out of our rest, not rest from our work.
[11:50] Sabbath is not a luxury; it is resistance. It is standing before a world that demands "more" and declaring, "I am enough because He is enough." It is unplugging the notifications, silencing the comparison, and reclaiming your attention.
[15:10] Rest requires structure. It requires an architecture. If you don't build a container for your rest, the demands of your schedule will flood every empty corner.
[16:22] God did not build you to be a machine. He built you to be a garden. Gardens require seasons of winter, waiting, and quiet soil to bloom. If you force a plant to produce year-round, you kill the root. Rest is how we water the root.
[19:30] Let us practice silence. For the next thirty seconds, I want us to sit in quietness, letting go of the need to do, and simply resting in the presence of He who holds the universe.
[21:10] Father, teach us the rhythm of grace. Help us build an architecture of rest in our busy weeks. Amen.`,
    analysis: {
      themes: [
        {
          name: 'Sabbath Rhythms',
          description: 'Realigning our schedule with God\'s design, starting our week from a place of secure rest.',
          tags: ['#Sabbath', '#Rest', '#SpiritualRhythms']
        },
        {
          name: 'Defiant Grace',
          description: 'Rejecting the productivity-obsession of modern culture through quiet trust.',
          tags: ['#Grace', '#MentalHealth', '#Resistance']
        },
        {
          name: 'Root Maintenance',
          description: 'Investing in the spiritual root system during seasons of winter and waiting.',
          tags: ['#Patience', '#SpiritualHealth', '#Growth']
        }
      ],
      crescendos: [
        { time: '00:10', value: 35, label: 'Culture of Busyness' },
        { time: '02:00', value: 50, label: 'Exhaustion as Status' },
        { time: '05:25', value: 82, label: 'Soul Battery Analogy' },
        { time: '08:40', value: 68, label: 'Creation Sabbath Design' },
        { time: '11:55', value: 90, label: 'Sabbath as Resistance Climax' },
        { time: '15:10', value: 70, label: 'Structuring Rest' },
        { time: '16:35', value: 94, label: 'Gardens vs Machines Climax' },
        { time: '19:30', value: 40, label: 'Practice of Silence' },
        { time: '21:10', value: 45, label: 'Closing Prayer' }
      ],
      ctas: [
        {
          timestamp: '05:15',
          quote: 'We plug our phones in every single night, but we expect our souls to run on a single percentage point for months.',
          action: 'Implement a digital Sabbath: turn off your smartphone for 3 contiguous hours this Sunday.'
        },
        {
          timestamp: '16:22',
          quote: 'God did not build you to be a machine. He built you to be a garden. Gardens require seasons of winter, waiting, and quiet soil to bloom.',
          action: 'Audit your current commitments and identify one activity to prune this season.'
        }
      ],
      clips: [
        {
          id: 'clip-2-1',
          title: 'Charging the Soul Battery',
          start: '05:15',
          end: '05:40',
          duration: 25,
          quote: 'We plug our phones in every single night, but we expect our souls to run on a single percentage point for months. Your exhaustion is not a badge of honor.',
          description: 'A comparison of modern battery charging habits to our lack of spiritual self-care, refuting exhaustion as a metric of value.',
          visualTheme: 'Medium tight portrait shot. Soft cool blue stage lighting offset by a warm spotlight on the face. Very clean and modern presentation style.',
          draftCaption: 'Why do we treat our phone batteries better than our own souls? 🔋 Exhaustion is a dashboard warning light, not a medal. Stop running on empty! #SoulCare #Rest #BurnoutPrevention #SarahBennett'
        },
        {
          id: 'clip-2-2',
          title: 'Rest as Resistance',
          start: '11:50',
          end: '12:18',
          duration: 28,
          quote: 'Sabbath is not a luxury; it is resistance. It is standing before a world that demands "more" and declaring, "I am enough because He is enough."',
          description: 'Sabbath rest defined as a counter-cultural act of rebellion against comparison and productivity idolatry.',
          visualTheme: 'Stable center-aligned medium shot. Slow zoom-in (digital or manual) to draw focus on the weight of the speaker\'s words. Moody violet background lights.',
          draftCaption: 'Rest is an act of spiritual resistance. 🛡️ In a world shouting for "more", dare to declare: "I am enough because He is enough." #RestAsResistance #SabbathRhythm #Contentment #FaithQuotes'
        },
        {
          id: 'clip-2-3',
          title: 'Gardens, Not Machines',
          start: '16:22',
          end: '16:47',
          duration: 25,
          quote: 'God did not build you to be a machine. He built you to be a garden. Gardens require seasons of winter, waiting, and quiet soil to bloom.',
          description: 'A poetic comparison of human life to agricultural seasons, emphasizing the necessity of quiet winter waiting.',
          visualTheme: 'Cinematic wide frame capturing the atmosphere of the room. Warm spotlight fading out slightly at the edges. Calm, static camera angle.',
          draftCaption: 'You are a garden, not a machine. 🌱 Gardens need seasons of quiet soil and winter waiting before they can bloom. Give yourself permission to rest. #HealedSoul #SlowDown #Patience #GodsTiming'
        }
      ]
    }
  },
  {
    id: 'sermon-3',
    title: 'Everyday Miracles',
    speaker: 'Pastor David Cho',
    date: 'May 31, 2026',
    content: `[00:05] Hey everyone! Open your eyes. No, really—open them. We walk through our days asleep to the supernatural.
[02:15] We have defined miracles in such sensational terms that we miss them when they show up in denim and t-shirts. We want the sky to split open, but God is whispering in the grocery checkout line.
[05:40] Let me tell you about last Tuesday. I was in a hurry, stressed about my sermon prep, standing in the supermarket. The cashier was moving slowly, struggling to scan an item. I felt my chest tightening. I wanted to tap my foot, to complain. But I felt a nudge: *Look at her. Really look at her.*
[06:30] I noticed her eyes were red. I asked, "Are you doing okay today?" She paused, looked up, and her eyes filled with tears. She whispered that her mother had passed away that morning, but she couldn't afford to miss a shift. We talked for just two minutes. I prayed with her right there. You don't need a parting sea to see the hand of God. Sometimes His hand is in the extra five minutes you spent listening to a cashier who felt invisible.
[10:15] That is a miracle. It was a supernatural insertion of divine comfort into an ordinary, painful day.
[12:15] If you only look for God in the spectacular, you will walk past Him in the ordinary. He lives in the routine. He is there in the laundry, the commute, the quiet kitchen. If we do not cultivate grateful sight, we will die of spiritual thirst surrounded by living water.
[15:40] How do we find this? It starts with looking up from our screens. It starts with asking God, "Give me eyes to see who is hurting in my path today."
[17:48] Stop asking God to send a miracle to your neighbor, and start asking Him to send you. You might be the answer to the prayer they whispered last night. When you buy that coffee, when you write that text, when you shovel that driveway—you are extending the hands of Jesus.
[20:30] Let's pray. Lord, wake us up. Break our self-centered focus and give us eyes that see the everyday miracles. Amen.`,
    analysis: {
      themes: [
        {
          name: 'Grateful Sight',
          description: 'Cultivating the awareness to notice God\'s presence and promptings in the mundane routines of life.',
          tags: ['#Gratitude', '#Mindfulness', '#Presence']
        },
        {
          name: 'Ordinary Interventions',
          description: 'Understanding that small, compassionate acts can be monumental answers to prayer.',
          tags: ['#Compassion', '#Kindness', '#EverydayMiracles']
        },
        {
          name: 'Being Sent',
          description: 'Shifting prayers from asking God to do things, to offering ourselves as His active agents.',
          tags: ['#Service', '#Mission', '#LoveInAction']
        }
      ],
      crescendos: [
        { time: '00:05', value: 40, label: 'Opening Call to Awareness' },
        { time: '02:30', value: 55, label: 'Sensationalizing Miracles' },
        { time: '05:50', value: 75, label: 'Grocery Line Narrative' },
        { time: '06:45', value: 90, label: 'Cashier Prayer Climax' },
        { time: '10:15', value: 65, label: 'Redefining the Supernatural' },
        { time: '12:30', value: 85, label: 'Mundane Holiness Climax' },
        { time: '15:40', value: 60, label: 'Practical Habits (Screens Down)' },
        { time: '18:00', value: 98, label: 'Be the Answer Climax' },
        { time: '20:45', value: 50, label: 'Closing Awakening Prayer' }
      ],
      ctas: [
        {
          timestamp: '12:15',
          quote: 'If you only look for God in the spectacular, you will walk past Him in the ordinary.',
          action: 'Keep a "Grateful Sight" journal for 5 days, writing down 3 everyday miracles each night.'
        },
        {
          timestamp: '17:48',
          quote: 'Stop asking God to send a miracle to your neighbor, and start asking Him to send you.',
          action: 'Reach out to one person who crossed your mind today with an encouraging word or gift.'
        }
      ],
      clips: [
        {
          id: 'clip-3-1',
          title: 'Miracles in the Grocery Line',
          start: '06:30',
          end: '06:58',
          duration: 28,
          quote: 'You don\'t need a parting sea to see the hand of God. Sometimes His hand is in the extra five minutes you spent listening to a cashier who felt invisible.',
          description: 'A moving narrative of stopping to pray with a grieving supermarket worker, illustrating that attention is a holy act.',
          visualTheme: 'Warm, slightly handheld camera movement with subtle zooms to convey empathy. Soft focus background, lens flares allowed for organic warmth.',
          draftCaption: 'Miracles aren\'t always parting seas. 🌊 Sometimes He just asks for 5 minutes of your attention for someone who feels invisible. Let\'s look up today. #Kindness #EverydayMiracles #Empathy #DavidCho'
        },
        {
          id: 'clip-3-2',
          title: 'God in the Routine',
          start: '12:15',
          end: '12:40',
          duration: 25,
          quote: 'If you only look for God in the spectacular, you will walk past He in the ordinary. He lives in the routine. He is there in the laundry, the commute, the quiet kitchen.',
          description: 'A call to shift our focus from seeking emotional highs to encountering God in our daily responsibilities.',
          visualTheme: 'Medium shot using a dolly slow-pan. Cozy, warm gold and teal stage colors. Preacher framed slightly off-center for visual variety.',
          draftCaption: 'God is in the laundry, the commute, and the quiet kitchen. ☕ Stop waiting for the spectacular and discover Him in your routine today. #SpiritualGrowth #DailyDevotion #FaithQuotes #OrdinaryDays'
        },
        {
          id: 'clip-3-3',
          title: 'Be the Miracle',
          start: '17:48',
          end: '18:18',
          duration: 30,
          quote: 'Stop asking God to send a miracle to your neighbor, and start asking He to send you. You might be the answer to the prayer they whispered last night.',
          description: 'A high-energy, convicting call to action challenge to become the physical hands and feet of God\'s answer.',
          visualTheme: 'Tight portrait crop focusing on speaker hands and expressions. Dramatic spotlights highlighting the preacher\'s physical delivery. High energy.',
          draftCaption: 'Stop asking God to send a miracle—and ask Him to send YOU. 🕊️ You might be the answer to the quiet prayer they whispered last night. #BeTheAnswer #LoveYourNeighbor #InspirationalWords #ChallengingFaith'
        }
      ]
    }
  }
];

// Fallback generator for custom pasted transcripts
export function analyzeCustomTranscript(title, text) {
  // Simple heuristic parsing to make custom input reactive and realistic
  const cleanedText = text || '';
  const lines = cleanedText.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract key sentences (quotes)
  const exclamationSentences = [];
  const questionSentences = [];
  const generalSentences = [];
  
  const sentenceRegex = /[^.!?]+[.!?]+/g;
  const matches = cleanedText.match(sentenceRegex) || [];
  
  for (let s of matches) {
    const trimmed = s.trim();
    if (trimmed.length < 20 || trimmed.length > 150) continue;
    if (trimmed.endsWith('!')) {
      exclamationSentences.push(trimmed);
    } else if (trimmed.endsWith('?')) {
      questionSentences.push(trimmed);
    } else {
      generalSentences.push(trimmed);
    }
  }
  
  // Select some quotes or fallback
  const quote1 = exclamationSentences[0] || generalSentences[0] || "Faith moves us forward when we choose to step out in obedience.";
  const quote2 = questionSentences[0] || generalSentences[1] || "What is keeping you from offering your full devotion today?";
  const quote3 = exclamationSentences[1] || generalSentences[2] || "We are called to be the light in the dark places of this world!";

  // Generate dynamic themes based on keyword matching
  const lowercaseText = cleanedText.toLowerCase();
  const themes = [];
  
  if (lowercaseText.includes('love') || lowercaseText.includes('grace') || lowercaseText.includes('heart')) {
    themes.push({
      name: 'Unconditional Grace',
      description: 'Exploring the depth of divine love and how it transforms human relationships.',
      tags: ['#Grace', '#Love', '#Transformation']
    });
  }
  if (lowercaseText.includes('fear') || lowercaseText.includes('faith') || lowercaseText.includes('trust') || lowercaseText.includes('doubt')) {
    themes.push({
      name: 'Courageous Faith',
      description: 'Taking bold steps and trusting God\'s guidance despite facing fear and uncertainty.',
      tags: ['#Faith', '#Courage', '#Trust']
    });
  }
  if (lowercaseText.includes('serve') || lowercaseText.includes('give') || lowercaseText.includes('neighbor') || lowercaseText.includes('help')) {
    themes.push({
      name: 'Active Service',
      description: 'Extending compassion and practical support to build strong, healthy communities.',
      tags: ['#Service', '#Kindness', '#Community']
    });
  }
  
  // Fallback if no matching keywords
  if (themes.length === 0) {
    themes.push({
      name: 'Kingdom Living',
      description: 'Aligning our daily choices, values, and practices with the teachings of Jesus.',
      tags: ['#ChristianLiving', '#Discipleship', '#Faith']
    });
    themes.push({
      name: 'Spiritual Vitality',
      description: 'Recharging our spiritual batteries through daily prayer, reflection, and community.',
      tags: ['#SpiritualGrowth', '#Prayer', '#Renewal']
    });
  }

  // Create crescendos
  const crescendos = [
    { time: '00:00', value: 30, label: 'Introduction' },
    { time: '04:00', value: 55, label: 'Concept Development' },
    { time: '08:00', value: 80, label: 'Illustrative Story' },
    { time: '12:00', value: 92, label: 'Key Revelation Climax' },
    { time: '16:00', value: 60, label: 'Call to Action Application' },
    { time: '20:00', value: 45, label: 'Benediction & Outro' }
  ];

  const ctas = [
    {
      timestamp: '08:15',
      quote: quote1,
      action: 'Reflect on how this quote challenges your current perspective.'
    },
    {
      timestamp: '12:40',
      quote: quote2,
      action: 'Take 10 minutes to write down a concrete action plan addressing this question.'
    }
  ];

  const clips = [
    {
      id: 'custom-clip-1',
      title: 'Spiritual Spark',
      start: '07:45',
      end: '08:12',
      duration: 27,
      quote: quote1,
      description: 'An impactful statement on stepping forward in faith and overcoming static comfort.',
      visualTheme: 'Tight close-up, focusing on the preacher\'s physical expression. Dramatic focus shift from stage to speaker.',
      draftCaption: `Let's stop standing still. ⚡ "${quote1}" What step are you taking today? #FaithAction #PreachIt #SundayInspiration #ChurchFlow`
    },
    {
      id: 'custom-clip-2',
      title: 'The Core Challenge',
      start: '12:15',
      end: '12:45',
      duration: 30,
      quote: quote2,
      description: 'A deep, reflective question prompting personal evaluation and spiritual assessment.',
      visualTheme: 'Medium profile shot from the side, emphasizing the speaker\'s focus. Soft, warm ambient stage lighting.',
      draftCaption: `Ask yourself: "${quote2}" 🕊️ Let's bring this question to prayer this week. #DeepThoughts #SoulSearching #SermonChallenge #Christian`
    },
    {
      id: 'custom-clip-3',
      title: 'Call to Victory',
      start: '15:50',
      end: '16:15',
      duration: 25,
      quote: quote3,
      description: 'An encouraging climax reinforcing hope, purpose, and community strength.',
      visualTheme: 'Wide panoramic stage tracking. Show audience engagement in the fore-focus, keeping the speaker centered.',
      draftCaption: `Amen! 🙌 "${quote3}" Go out and shine His light in every dark corner! #BeTheLight #GoAndDo #SermonClip #FaithWorks`
    }
  ];

  return {
    themes,
    crescendos,
    ctas,
    clips
  };
}

// Simulated agent log sequence
export const AGENT_STEPS = [
  { id: 'tokenizer', name: 'Tokenizer Agent', log: 'Parsing transcript text. Detected 612 tokens. Identifying timestamp patterns...' },
  { id: 'segmenter', name: 'Structure Segmenter', log: 'Structuring outline. Sections isolated: Introduction (00:00-03:15), Core Body (03:15-13:50), Climax (13:50-17:00), Invitation (17:00-19:00).' },
  { id: 'sentiment', name: 'Sentiment Estimator', log: 'Analyzing text tone. Scanning vocabulary for emotional weight. Peak detected at Jordan River illustration (Joshua 3) and Swing Bridge anecdote.' },
  { id: 'crescendo', name: 'Crescendo Mapper', log: 'Mapping emotional wave profile. Normalizing values. Peaks identified at 04:35 (Costa Rica story, Intensity: 85%), 09:45 (Comfort zone challenge, Intensity: 88%) and 14:15 (Climax CTA, Intensity: 96%).' },
  { id: 'director', name: 'Visual Director Assistant', log: 'Correlating clips with scenic properties. Generating dynamic camera suggestions, lighting configurations, and frame sizes optimized for short-form content.' },
  { id: 'copywriter', name: 'Social Copywriter', log: 'Drafting high-engagement hook lines, summaries, and platforms-specific hashtags for TikTok, Instagram Reels, and YouTube Shorts.' },
  { id: 'sync', name: 'Database Sync Agent', log: 'Structuring JSON payload for PWA production pipeline endpoint. Ready for user sync authorization.' }
];

export function runAgentWorkflow(sermonText, onStep, onComplete) {
  let stepIndex = 0;
  
  const interval = setInterval(() => {
    if (stepIndex < AGENT_STEPS.length) {
      onStep(AGENT_STEPS[stepIndex]);
      stepIndex++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, 750); // Emit a log every 750ms
  
  return () => clearInterval(interval);
}

// Simulate Backend Pipeline Sync
export function syncProductionPipeline(activeService, clips) {
  return new Promise((resolve) => {
    // Generate simulated telemetry
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer companion_pwa_token_live_2026_0615',
      'X-Companion-Service': activeService,
      'X-Client-Timestamp': new Date().toISOString()
    };
    
    const requestBody = {
      service: activeService,
      clips: clips.map(c => ({
        clipId: c.id,
        title: c.title,
        timecode: `${c.start} - ${c.end}`,
        duration: `${c.duration}s`,
        instructions: c.visualTheme,
        caption: c.draftCaption
      })),
      timestamp: Date.now()
    };

    setTimeout(() => {
      resolve({
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store, no-cache',
          'x-server-runtime': '124ms',
          'x-pipeline-status': 'PROCESSED'
        },
        data: {
          success: true,
          syncedCount: clips.length,
          pipelineId: `pipe-sync-${Math.random().toString(36).substr(2, 9)}`,
          updatedAt: new Date().toISOString(),
          status: 'PRODUCING'
        },
        telemetry: {
          requestHeaders,
          requestBody
        }
      });
    }, 1200); // 1.2s network lag
  });
}
