import type { Project, ProjectId } from './types';

// Single source of truth for projects — used by the Project Lab machines,
// the game popups and the Professional View.
//
// Rules: no invented metrics (`results` stays undefined until verified),
// `stack` lists only tools confirmed for that project, and ReSync AI has no
// links until the real URLs are supplied.

export const projects: Project[] = [
  {
    id: 'eta',
    title: 'Delivery ETA Prediction',
    status: 'Completed',
    tagline: 'Predicting delivery times, with dark-store analysis across quick-commerce apps.',
    description:
      'An end-to-end delivery ETA prediction project using machine learning, extended with geographic dark-store analysis and a nearest-store comparison across Blinkit, Zepto and Instamart.',
    problem:
      'Delivery time depends on where the order is going and which store serves it. A single average estimate hides that, so the goal was to predict ETA from order and location data and look at how store placement affects it.',
    approach: [
      'Built an end-to-end ML pipeline to predict delivery ETA.',
      'Added geographic analysis of dark-store locations.',
      'Compared the nearest stores across Blinkit, Zepto and Instamart.',
      'Shipped the model as an interactive Streamlit app.',
    ],
    stack: ['Python', 'Machine Learning', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Delivery-ETA-Prediction-Dark-Store-Analysis',
      live: 'https://food-delivery-eta-prediction.streamlit.app/',
    },
  },
  {
    id: 'meal',
    title: 'Meal Demand Forecasting',
    status: 'Completed',
    tagline: 'Time-series demand forecasting for a meal-delivery business with XGBoost.',
    description:
      'Time-series demand forecasting for a meal-delivery business using XGBoost, presented as a forecasting and inventory-planning app.',
    problem:
      'A meal-delivery business needs to know how many orders each meal will get at each center, so it can plan inventory without over- or under-stocking.',
    approach: [
      'Engineered lag features and rolling statistics from historical orders.',
      'Added meal and center metadata, pricing and promotion signals.',
      'Modelled Center × Meal historical demand.',
      'Trained an XGBoost model and served forecasts through Streamlit.',
    ],
    stack: ['Python', 'XGBoost', 'Time-Series Features', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Meal-Demand-Forecasting-XGBoost',
      live: 'https://meal-demand-forecasting-and-inventory-planning.streamlit.app/',
    },
  },
  {
    id: 'heart',
    title: 'Heart Disease Prediction',
    status: 'Completed',
    tagline: 'A classification model behind a simple interactive Streamlit app.',
    description:
      'A machine-learning web app that predicts the likelihood of heart disease using a trained classification model and an interactive Streamlit interface.',
    problem:
      'Explore how a classification model can estimate heart-disease likelihood from patient attributes, and make it usable through a simple interface.',
    approach: [
      'Trained a classification model on patient attributes.',
      'Built a Streamlit interface where values are entered and a prediction is returned.',
    ],
    stack: ['Python', 'Classification', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Heart-Disease-Prediction-Streamlit',
      live: 'https://disease-heart.streamlit.app/',
    },
    note: 'A learning project — not a medical or diagnostic tool.',
  },
  {
    id: 'tiny',
    title: 'Tiny Projects',
    status: 'Learning / Collection',
    tagline: 'Small Python experiments — a voice assistant and a WhatsApp auto-reply bot.',
    description:
      'A collection of small Python projects built to learn and experiment. Not a polished product — a place to try ideas quickly.',
    problem: 'Learn by building: automation, speech and AI integrations in small, self-contained scripts.',
    approach: ['Each project is a focused experiment that explores one idea end to end.'],
    parts: [
      {
        title: 'Jarvis voice assistant',
        points: [
          'Google speech-to-text for input, pyttsx3 for spoken replies.',
          'Opens websites, plays local music and reads live news.',
          'OpenRouter fallback for open-ended questions; silence timeout.',
        ],
      },
      {
        title: 'WhatsApp AI auto-reply bot',
        points: [
          'PyAutoGUI desktop automation with latest-message detection.',
          'AI persona replies with in-memory conversation history.',
          'Stops after an inactivity timeout.',
        ],
      },
    ],
    stack: ['Python', 'pyttsx3', 'Google Speech-to-Text', 'PyAutoGUI', 'OpenRouter'],
    links: {
      github: 'https://github.com/arshiafreen090/Tiny-Projects',
    },
  },
  {
    id: 'resync',
    title: 'ReSync AI',
    status: 'In Development',
    tagline: 'An AI resume-tailoring and job-assistance tool — currently being built.',
    description:
      'An AI resume-tailoring and job-assistance product. It is still in development; the points below describe what it is designed to do.',
    problem:
      'Tailoring a resume to each job description is slow, and it is easy to either miss relevant keywords or overstate experience.',
    approach: [
      'Analyse the resume and the job description side by side.',
      'Surface missing keywords and ATS-alignment gaps.',
      'Rewrite bullets truthfully — no invented experience.',
      'Give feedback and produce a tailored output.',
    ],
    planned: ['ATS scoring', 'PDF output', 'Similar-job discovery', 'Job-hunt automation'],
    stack: [],
    links: {},
    linksNote: 'Links will be added once the project is ready to share.',
  },
];

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<ProjectId, Project>;
