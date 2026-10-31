import type {
  AnswerFeedback,
  InterviewQuestion,
  ProfileAnalysis,
} from '@/types/interview';

export const sampleProfileAnalysis: ProfileAnalysis = {
  matchScore: 78,
  skills: ['Project management', 'Stakeholder communication', 'Data analysis', 'Team leadership'],
};

export const sampleQuestions: InterviewQuestion[] = [
  {
    id: 'q1',
    category: 'Resume-based',
    difficulty: 'Easy',
    text: 'Walk me through the experience on your resume that you feel best prepares you for this role.',
    evaluationCriteria: [],
  },
  {
    id: 'q2',
    category: 'Technical',
    difficulty: 'Medium',
    text: 'Describe how you would diagnose a slow page load in a web application you are responsible for.',
    evaluationCriteria: [],
  },
  {
    id: 'q3',
    category: 'Behavioural',
    difficulty: 'Medium',
    text: 'Tell me about a time you had to deliver under a tight deadline. What did you do?',
    evaluationCriteria: [],
  },
  {
    id: 'q4',
    category: 'Situational',
    difficulty: 'Hard',
    text: 'A key stakeholder disagrees with your project priorities. How would you handle it?',
    evaluationCriteria: [],
  },
  {
    id: 'q5',
    category: 'Career Motivation',
    difficulty: 'Easy',
    text: 'Why are you interested in this role and this company?',
    evaluationCriteria: [],
  },
  {
    id: 'q6',
    category: 'Resume-based',
    difficulty: 'Medium',
    text: 'Your resume mentions leading a team project. What was your specific contribution?',
    evaluationCriteria: [],
  },
  {
    id: 'q7',
    category: 'Technical',
    difficulty: 'Hard',
    text: 'Explain how you would make sure data stays accurate across a reporting pipeline.',
    evaluationCriteria: [],
  },
  {
    id: 'q8',
    category: 'Behavioural',
    difficulty: 'Easy',
    text: 'Describe a time you received critical feedback. How did you respond?',
    evaluationCriteria: [],
  },
  {
    id: 'q9',
    category: 'Situational',
    difficulty: 'Medium',
    text: 'You discover a mistake in work you have already delivered. What steps do you take?',
    evaluationCriteria: [],
  },
  {
    id: 'q10',
    category: 'Career Motivation',
    difficulty: 'Hard',
    text: 'Where do you see your career in five years, and how does this role fit into that plan?',
    evaluationCriteria: [],
  },
];

export const sampleFeedbackByQuestion: Record<string, AnswerFeedback> = {
  q1: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 4, structure: 3, jobAlignment: 5 },
    strengths: [
      'Starts with a clear, relevant role from your resume',
      'Connects your past work directly to the position',
    ],
    improvements: [
      'Name the single achievement you are most proud of',
      'Keep the answer under two minutes by trimming the early background',
    ],
    improvedAnswer:
      'In my current role as a product analyst, I led the reporting overhaul that cut weekly reporting time from two days to two hours. That work taught me to turn messy data into clear decisions, which is exactly what this role requires. I would bring the same approach to your analytics team from day one.',
    followUp: 'Which part of that project was the hardest to get right?',
  },
  q2: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 3, structure: 4, jobAlignment: 4 },
    strengths: [
      'Sets out a clear diagnostic sequence',
      'Shows awareness of trade-offs',
    ],
    improvements: [
      'Explain how you would measure the problem before changing anything',
      'Mention a specific tool, such as a profiler or browser developer tools',
    ],
    improvedAnswer:
      'I would start by measuring, not guessing. I would use browser developer tools and a performance profiler to find which requests or scripts block the page. Once I know the main bottleneck, I would fix the largest contributor first, such as caching or splitting large bundles, then measure again to confirm the gain.',
    followUp: 'How would you stop this kind of slowdown from coming back?',
  },
  q3: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 4, structure: 3, jobAlignment: 4 },
    strengths: [
      'The deadline pressure is easy to picture',
      'Shows calm, organised decision-making',
    ],
    improvements: [
      'Add the result: what happened and what it delivered',
      'Describe the specific steps you personally took',
    ],
    improvedAnswer:
      'Our client needed a revised proposal within 48 hours after a scope change. I split the work into three parts, assigned owners and set a short check-in each afternoon. I wrote the financial section myself so the team could focus on strategy. We delivered on time, and the client signed the contract the following week.',
    followUp: 'How would you plan differently if you had a week instead of two days?',
    star: { situation: true, task: true, action: true, result: false },
  },
  q4: {
    status: 'assessable',
    scores: { relevance: 3, clarity: 4, structure: 4, jobAlignment: 3 },
    strengths: [
      'Shows you would listen before deciding',
      'Keeps the focus on the shared goal',
    ],
    improvements: [
      'Explain how you would gather the stakeholder\'s concerns with data',
      'Describe a clear next step and a timeline',
    ],
    improvedAnswer:
      'I would first meet the stakeholder one-to-one to understand what worries them and what success looks like for them. I would bring data on the impact of each priority and look for a phased compromise. If we still disagreed, I would take both views to our manager with a recommendation so the decision is made openly.',
    followUp: 'What would you do if your manager sided with the stakeholder?',
  },
  q5: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 4, structure: 3, jobAlignment: 5 },
    strengths: [
      'Shows genuine interest in the company',
      'Links your goals to the role',
    ],
    improvements: [
      'Mention one specific thing about the company, such as a product or recent project',
      'Keep the focus on what you will contribute',
    ],
    improvedAnswer:
      'I am excited by your focus on helping small businesses manage their finances. My background in customer success has shown me how much those teams need simple, reliable tools. I want to help build the onboarding and support experience that lets them succeed, and this role gives me that chance.',
    followUp: null,
  },
  q6: {
    status: 'assessable',
    scores: { relevance: 3, clarity: 4, structure: 3, jobAlignment: 4 },
    strengths: [
      'Names the team project clearly',
      'Speaks in the first person',
    ],
    improvements: [
      'Separate what the team did from what you did',
      'Give a measurable outcome for your own contribution',
    ],
    improvedAnswer:
      'I led the data mapping and testing for our move to a new customer platform, as part of a five-person team. My testing plan caught 40 errors before launch. The migration finished two weeks early with no customer-facing issues.',
    followUp: 'How did you decide which tests mattered most?',
  },
  q7: {
    status: 'assessable',
    scores: { relevance: 3, clarity: 3, structure: 4, jobAlignment: 3 },
    strengths: [
      'Covers validation, monitoring and ownership',
      'Gives a clear, structured answer',
    ],
    improvements: [
      'Give a concrete example of a check you would add',
      'Explain how you would respond when a check fails',
    ],
    improvedAnswer:
      'I would add automated checks at each stage of the pipeline, such as row counts, null rates and schema validation. Alerts would go to the data owner, and failed loads would stop downstream reports rather than publish bad numbers. I would review the checks each quarter with the teams that rely on them.',
    followUp: 'How would you balance strict checks with the need for fast delivery?',
  },
  q8: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 4, structure: 4, jobAlignment: 4 },
    strengths: [
      'Honest about the feedback you received',
      'Shows a clear change in behaviour',
    ],
    improvements: [
      'Name the feedback more specifically',
      'Share what you still apply from that lesson today',
    ],
    improvedAnswer:
      'In my first year, my manager told me my status updates were too long to be useful. I asked for examples of what she wanted, then changed my format to three bullets: progress, risks and next steps. She noticed within a month, and the format is now used across our team.',
    followUp: 'How do you handle feedback you disagree with?',
    star: { situation: true, task: true, action: true, result: true },
  },
  q9: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 4, structure: 3, jobAlignment: 4 },
    strengths: [
      'Takes responsibility immediately',
      'Puts the customer first',
    ],
    improvements: [
      'Explain how and when you would tell your manager',
      'Describe how you would prevent the mistake happening again',
    ],
    improvedAnswer:
      'I would tell my manager straight away, explain what went wrong and how big the impact is. Then I would fix the error, confirm the correction with anyone affected and check the rest of the work for the same issue. Afterwards I would add a review step so it does not happen again.',
    followUp: 'What would you do if the error had already reached the client?',
  },
  q10: {
    status: 'assessable',
    scores: { relevance: 4, clarity: 3, structure: 4, jobAlignment: 4 },
    strengths: [
      'Shows ambition with a realistic plan',
      'Connects the role to long-term growth',
    ],
    improvements: [
      'Name one specific skill you want to build',
      'Link your five-year view to what this company can offer',
    ],
    improvedAnswer:
      'In five years, I want to lead a team that owns customer insight for a growing product. This role builds the core skills I need, from analysis to stakeholder communication, and I want to grow those skills here as the company grows.',
    followUp: null,
  },
};
