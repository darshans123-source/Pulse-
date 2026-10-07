import { IntentAnalysis, IntentCategory, MatchedHelper, User } from '../types';

interface IntentRule {
  category: IntentCategory;
  keywords: string[];
  defaultNeeds: string[];
  skills: string[];
  urgencyTriggers: {
    high: string[];
    medium: string[];
  };
}

const INTENT_RULES: IntentRule[] = [
  {
    category: 'Career & Interview Prep',
    keywords: [
      'interview', 'nervous', 'advice', 'career', 'offer', 'resume', 
      'hiring', 'recruiter', 'java interview', 'questions', 'prep', 
      'tips', 'mock', 'onsite', 'faang', 'junior', 'senior'
    ],
    defaultNeeds: [
      'Practical interview expectations & common traps',
      'Guidance from engineers who have conducted live interviews',
      'Domain-specific technical prep',
      'Mental focus & nervousness de-escalation'
    ],
    skills: ['Java', 'Algorithms', 'Backend Systems', 'System Design', 'Engineering Leadership'],
    urgencyTriggers: {
      high: ['tomorrow', 'tonight', 'today', 'in a few hours', 'urgent', 'asap'],
      medium: ['next week', 'soon', 'nervous', 'preparing', 'upcoming'],
    },
  },
  {
    category: 'Technical Debugging',
    keywords: [
      'error', 'bug', 'crash', 'migration', 'django', 'python', 'exception', 
      'foreign key', 'table lock', 'postgres', 'database', 'failing', 'broken', 
      'traceback', 'compile', 'memory leak', 'timeout', 'null pointer', 'segfault'
    ],
    defaultNeeds: [
      'Root-cause troubleshooting for runtime errors',
      'Working code patch or migration fix',
      'Safe schema migration rollback instructions',
      'Peer verification of database transaction logs'
    ],
    skills: ['Python', 'Django', 'PostgreSQL', 'Database Internals', 'Backend Debugging'],
    urgencyTriggers: {
      high: ['broken', 'blocking', 'failing', 'production', 'crash', 'lock', 'urgent'],
      medium: ['giving me', 'stuck', 'error', 'issue', 'trouble'],
    },
  },
  {
    category: 'Design Critique & Feedback',
    keywords: [
      'critique', 'feedback', 'typography', 'hierarchy', 'readability', 
      'font', 'kerning', 'layout', 'contrast', 'figma', 'redesign', 
      'look and feel', 'spacing', 'aesthetic', 'review my', 'thoughts on'
    ],
    defaultNeeds: [
      'Constructive design critique from experienced practitioners',
      'Evaluation of visual hierarchy and typographic rhythm',
      'Accessibility & contrast verification',
      'Spatial pacing and layout balance assessment'
    ],
    skills: ['Typography', 'UI Architecture', 'Design Systems', 'Visual Ergonomics'],
    urgencyTriggers: {
      high: ['shipping today', 'launching soon', 'deadline'],
      medium: ['working on', 'thoughts on', 'critique', 'review'],
    },
  },
  {
    category: 'Architecture & Systems',
    keywords: [
      'architecture', 'monolith', 'microservices', 'distributed', 'scale', 
      'throughput', 'concurrency', 'latency', 'caching', 'resilience', 
      'spatial', 'granite', 'materials', 'monolithic', 'cantilever'
    ],
    defaultNeeds: [
      'High-level architectural trade-off evaluation',
      'Scalability and latency risk mitigation',
      'Domain expert blueprint critique'
    ],
    skills: ['Distributed Systems', 'Software Architecture', 'Material Systems', 'Performance'],
    urgencyTriggers: {
      high: ['production outage', 'critical scale', 'bottleneck'],
      medium: ['designing', 'evaluating', 'planning'],
    },
  },
  {
    category: 'Creative & Audio Craft',
    keywords: [
      'sound', 'audio', 'synthesizer', 'synthesizers', 'analog', 'acoustics', 
      'mastering', 'field recording', 'tape loop', 'reverb', 'frequency', 
      'ceramics', 'kiln', 'craft', 'pottery', 'vessel'
    ],
    defaultNeeds: [
      'Acoustic resonance & frequency balancing advice',
      'Physical material formulation feedback',
      'Tactile analog workflow insights'
    ],
    skills: ['Sound Design', 'Acoustic Engineering', 'Physical Craft', 'Synthesizers'],
    urgencyTriggers: {
      high: ['studio session today', 'recording live'],
      medium: ['recording', 'experimenting', 'making'],
    },
  },
  {
    category: 'Collaboration & Hiring',
    keywords: [
      'looking for', 'hiring', 'collaborator', 'partner', 'co-founder', 
      'need a', 'seeking a', 'contractor', 'freelancer'
    ],
    defaultNeeds: [
      'Introduction to vetted craft specialists',
      'Project scope alignment',
      'Contract collaboration'
    ],
    skills: ['Project Leadership', 'Engineering', 'Product Strategy'],
    urgencyTriggers: {
      high: ['immediately', 'asap', 'urgent'],
      medium: ['open to', 'exploring', 'seeking'],
    },
  },
];

/**
 * Analyzes post text to determine WHY the user is posting, what they need,
 * and matches real community members based on their demonstrated capability.
 */
export function analyzePostIntent(
  content: string,
  allUsers: User[],
  authorId?: string
): IntentAnalysis {
  const lower = content.toLowerCase();

  // 1. Identify category match by score
  let bestCategory: IntentCategory = 'General Discussion';
  let highestScore = 0;
  let matchedRule: IntentRule | null = null;
  const detectedSkills: string[] = [];

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        score += kw.includes(' ') ? 3 : 1.5;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = rule.category;
      matchedRule = rule;
    }
  }

  // If score is too low, default to Knowledge Sharing or General Discussion
  if (highestScore < 1.5) {
    if (content.length > 150 && (lower.includes('here is') || lower.includes('learned') || lower.includes('audit'))) {
      bestCategory = 'Knowledge Sharing';
    } else {
      bestCategory = 'General Discussion';
    }
  }

  // 2. Determine urgency
  let urgency: 'High' | 'Medium' | 'Low' | 'Evergreen' = 'Evergreen';
  if (matchedRule) {
    if (matchedRule.urgencyTriggers.high.some((t) => lower.includes(t))) {
      urgency = 'High';
    } else if (matchedRule.urgencyTriggers.medium.some((t) => lower.includes(t))) {
      urgency = 'Medium';
    } else {
      urgency = 'Low';
    }
  }

  // 3. Extract specific entities and domain skills
  const specificEntityMap: Record<string, string> = {
    java: 'Java',
    spring: 'Spring Boot',
    python: 'Python',
    django: 'Django',
    postgres: 'PostgreSQL',
    sql: 'Database Architecture',
    css: 'CSS Layout',
    typography: 'Typography',
    react: 'React Architecture',
    audio: 'Sound Engineering',
    sound: 'Audio Design',
    synthesizer: 'Analog Synthesis',
    architecture: 'Structural Architecture',
    granite: 'Material Systems',
    ceramics: 'Ceramic Craft',
    interview: 'Technical Interviewing',
  };

  Object.entries(specificEntityMap).forEach(([key, val]) => {
    if (lower.includes(key)) {
      if (!detectedSkills.includes(val)) detectedSkills.push(val);
    }
  });

  if (matchedRule && detectedSkills.length === 0) {
    detectedSkills.push(...matchedRule.skills.slice(0, 3));
  }

  // 4. Synthesize user needs
  let userNeeds: string[] = [];
  if (matchedRule) {
    userNeeds = [...matchedRule.defaultNeeds];
    // Dynamic tailoring
    if (lower.includes('java') && lower.includes('interview')) {
      userNeeds = [
        'Core Java concurrency & JVM garbage collection questions',
        'Spring framework design patterns & dependency injection traps',
        'Direct advice from experienced Java technical interviewers',
        'Tactics to channel interview nervousness into focused clarity'
      ];
    } else if (lower.includes('django') || lower.includes('migration')) {
      userNeeds = [
        'Step-by-step resolution for locked PostgreSQL migrations',
        'Django foreign key constraint handling without downtime',
        'Verification of migration rollback sequence',
        'Direct consultation with veteran Python/Django backend engineers'
      ];
    } else if (lower.includes('typography') || lower.includes('hierarchy')) {
      userNeeds = [
        'Detailed feedback on display vs body font scaling',
        'Review of measure width and line-height balance on mobile',
        'Critique from type design and interface systems specialists'
      ];
    }
  } else {
    userNeeds = [
      'Community discussion and perspectives',
      'Constructive peer reactions',
      'Shared experiences and domain examples'
    ];
  }

  // 5. Match capable community members (Intent Circle helpers)
  // "Fundamentally different from 'People you may know' — matches by demonstrated capability"
  const candidateUsers = allUsers.filter((u) => u.id !== authorId);
  const matchedHelpers: MatchedHelper[] = [];

  candidateUsers.forEach((candidate) => {
    let matchScore = 50;
    let reason = '';
    const relevantSkills: string[] = [];

    const candidateText = `${candidate.name} ${candidate.bio} ${candidate.role} ${(candidate.demonstratedSkills || []).join(' ')} ${(candidate.activityHighlights || []).join(' ')}`.toLowerCase();

    // Check specific skill alignment
    detectedSkills.forEach((skill) => {
      if (candidateText.includes(skill.toLowerCase())) {
        matchScore += 20;
        relevantSkills.push(skill);
      }
    });

    // Check rule category alignment
    if (bestCategory === 'Career & Interview Prep') {
      if (candidate.role.includes('Principal') || candidate.role.includes('Director') || candidate.role.includes('Architect') || candidate.role.includes('Founder')) {
        matchScore += 25;
        reason = `Conducted 40+ senior technical interviews · ${candidate.role}`;
      } else {
        reason = `Active mentor in engineering community · ${candidate.role}`;
      }
    } else if (bestCategory === 'Technical Debugging') {
      if (candidateText.includes('performance') || candidateText.includes('engineer') || candidateText.includes('runtime') || candidateText.includes('python')) {
        matchScore += 28;
        reason = `Deep experience in database locking & backend migrations · ${candidate.role}`;
      } else {
        reason = `Demonstrated history solving complex architecture bugs`;
      }
    } else if (bestCategory === 'Design Critique & Feedback') {
      if (candidateText.includes('typography') || candidateText.includes('front-end') || candidateText.includes('design') || candidateText.includes('creative')) {
        matchScore += 30;
        reason = `Published author on typographic hierarchy & layout engines · ${candidate.role}`;
      } else {
        reason = `Seasoned design reviewer`;
      }
    } else if (bestCategory === 'Creative & Audio Craft') {
      if (candidateText.includes('audio') || candidateText.includes('sound') || candidateText.includes('craft') || candidateText.includes('ceramic')) {
        matchScore += 35;
        reason = `Domain creator specializing in acoustics & tactile physical craft · ${candidate.role}`;
      } else {
        reason = `Experienced creative director`;
      }
    } else if (bestCategory === 'Architecture & Systems') {
      if (candidateText.includes('architect') || candidateText.includes('systems') || candidateText.includes('urban')) {
        matchScore += 30;
        reason = `Specialist in monolithic structural systems & resilience · ${candidate.role}`;
      } else {
        reason = `Systems strategist`;
      }
    } else {
      matchScore += 10;
      reason = `Frequent contributor to related discussions · ${candidate.role}`;
    }

    matchScore = Math.min(98, Math.max(65, matchScore));

    matchedHelpers.push({
      user: candidate,
      matchScore,
      expertiseReason: reason,
      relevantSkills: relevantSkills.length ? relevantSkills : [candidate.role],
      isInvited: false,
    });
  });

  // Sort helpers by match score
  matchedHelpers.sort((a, b) => b.matchScore - a.matchScore);

  const confidence = highestScore >= 3 ? 94 : highestScore >= 1.5 ? 86 : 72;

  // Formulate summary
  let summary = '';
  if (bestCategory === 'Career & Interview Prep') {
    summary = 'Seeking practical interview wisdom and anxiety management from experienced interviewers.';
  } else if (bestCategory === 'Technical Debugging') {
    summary = 'Encountered blocking runtime/framework error requiring seasoned developer troubleshooting.';
  } else if (bestCategory === 'Design Critique & Feedback') {
    summary = 'Requesting expert critique on visual hierarchy, type scaling, and ergonomic balance.';
  } else if (bestCategory === 'Architecture & Systems') {
    summary = 'Analyzing systemic trade-offs and structural resilience with architecture peers.';
  } else if (bestCategory === 'Creative & Audio Craft') {
    summary = 'Exploring analog acoustic textures, sound design principles, and tangible craft methods.';
  } else {
    summary = 'Sharing contextual perspectives for open community dialogue.';
  }

  return {
    category: bestCategory,
    urgency,
    confidence,
    summary,
    userNeeds,
    extractedSkills: detectedSkills.length ? detectedSkills : ['General'],
    matchedHelpers: matchedHelpers.slice(0, 3), // Top 3 most capable helpers
    isIntentCircleActive: bestCategory !== 'General Discussion',
  };
}
