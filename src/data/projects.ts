import type { Project, ProjectId } from './types';

// Single source of truth for projects — used by the Project Lab machines,
// the game popups and the Professional View.
//
// Sources: Afreen's resume (Afreen_ML_Resume.pdf), each repo's requirements.txt
// and CLAUDE_BUILD_CONTEXT.md. Every number and tool below is traceable to one
// of those. Do not add metrics or tools that are not in them.

export const projects: Project[] = [
  {
    id: 'eta',
    title: 'Delivery ETA Prediction',
    status: 'Shipped',
    tagline: 'XGBoost ETA regression on 42,508 deliveries, plus dark-store proximity analysis.',
    description:
      'An end-to-end delivery ETA prediction project, extended with geographic dark-store analysis and a nearest-store comparison across Blinkit, Zepto and Instamart.',
    problem:
      'Delivery time depends on distance and on which store fulfils the order. The goal was an accurate ETA model and a way to judge how well dark stores cover nearby customers.',
    approach: [
      'Built an ETA regression workflow on 42,508 delivery records.',
      'Engineered Haversine distance features with leakage-safe, train-only preprocessing.',
      'Tuned XGBoost and added SHAP explanations for the predictions.',
      'Analysed dark-store proximity with BallTree / Haversine distance across 287,065 customer–store pairs.',
      'Evaluated candidate dark stores by customer proximity and geographic coverage for nearest-store fulfilment and last-mile analysis.',
      'Deployed the model as an interactive Streamlit app.',
    ],
    metrics: [
      { label: 'MAE', value: '3.01 min' },
      { label: 'RMSE', value: '3.76 min' },
      { label: 'R²', value: '0.840' },
      { label: 'Model', value: 'XGBoost' },
      { label: 'Dataset', value: '42,508 deliveries' },
      { label: 'Proximity analysis', value: '287,065 customer–store pairs' },
    ],
    tech: [
      { label: 'Language', items: ['Python'] },
      { label: 'Model', items: ['XGBoost (regression)'] },
      { label: 'Libraries', items: ['pandas', 'scikit-learn', 'SciPy', 'joblib', 'SHAP'] },
      { label: 'Geospatial', items: ['Haversine distance', 'BallTree nearest-neighbour search'] },
      { label: 'Methods', items: ['Feature engineering', 'Leakage-safe train-only preprocessing', 'Hyperparameter tuning', 'SHAP explainability'] },
      { label: 'Deployment', items: ['Streamlit'] },
    ],
    stack: ['Python', 'XGBoost', 'SHAP', 'BallTree', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Delivery-ETA-Prediction-Dark-Store-Analysis',
      live: 'https://food-delivery-eta-prediction.streamlit.app/',
    },
  },
  {
    id: 'meal',
    title: 'Meal Demand Forecasting',
    status: 'Shipped',
    tagline: 'Recursive weekly demand forecasting with XGBoost across 77 centres and 51 meals.',
    description:
      'Time-series demand forecasting for a meal-delivery business using XGBoost, presented as a forecasting and inventory-planning app.',
    problem:
      'A meal-delivery business needs to know how many orders each meal will get at each fulfilment centre, weeks ahead, to plan inventory.',
    approach: [
      'Modelled 456,548 demand records spanning 145 weeks, 77 fulfilment centres and 51 meals.',
      'Engineered lag, rolling-history, centre–meal, promotion and price features.',
      'Designed leakage-safe expanding-window validation with recursive week-by-week predictions over a 10-week horizon.',
      'Benchmarked against a latest-value baseline and compared ETS, SARIMA and Prophet.',
      'Analysed errors across demand segments and served forecasts in a Streamlit app.',
    ],
    metrics: [
      { label: 'RMSLE', value: '0.515', note: 'recursive CV · baseline 0.825' },
      { label: 'Model', value: 'XGBoost' },
      { label: 'Dataset', value: '456,548 records' },
      { label: 'Coverage', value: '145 weeks · 77 centres · 51 meals' },
      { label: 'Horizon', value: '10 weeks' },
    ],
    tech: [
      { label: 'Language', items: ['Python'] },
      { label: 'Models', items: ['XGBoost', 'ETS', 'SARIMA', 'Prophet', 'Latest-value baseline'] },
      { label: 'Libraries', items: ['pandas', 'NumPy', 'scikit-learn', 'joblib'] },
      { label: 'Features', items: ['Lag features', 'Rolling history', 'Centre × meal history', 'Promotion & price signals'] },
      { label: 'Validation', items: ['Expanding-window CV', 'Recursive multi-step forecasting', 'Error analysis by demand segment'] },
      { label: 'Deployment', items: ['Streamlit'] },
    ],
    stack: ['Python', 'XGBoost', 'Time-series CV', 'Prophet', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Meal-Demand-Forecasting-XGBoost',
      live: 'https://meal-demand-forecasting-and-inventory-planning.streamlit.app/',
    },
  },
  {
    id: 'heart',
    title: 'Heart Disease Prediction',
    status: 'Shipped',
    tagline: 'Five classifiers compared; Logistic Regression packaged into a Streamlit app.',
    description:
      'A machine-learning web app that predicts the likelihood of heart disease using a trained classification model and an interactive Streamlit interface.',
    problem:
      'Explore how a classification model can estimate heart-disease likelihood from patient attributes, and make it usable through a simple interface.',
    approach: [
      'Compared five classification models on 918 records.',
      'Evaluated them with accuracy and F1-score.',
      'Packaged the best model, Logistic Regression, into an interactive Streamlit prediction app.',
    ],
    metrics: [
      { label: 'Accuracy', value: '90%' },
      { label: 'F1-score', value: '89%' },
      { label: 'Model', value: 'Logistic Regression', note: 'best of 5 classifiers' },
      { label: 'Dataset', value: '918 records' },
    ],
    tech: [
      { label: 'Language', items: ['Python'] },
      { label: 'Models', items: ['Logistic Regression', '5 classifiers compared'] },
      { label: 'Libraries', items: ['pandas', 'NumPy', 'Matplotlib', 'joblib'] },
      { label: 'Evaluation', items: ['Accuracy', 'F1-score'] },
      { label: 'Deployment', items: ['Streamlit'] },
    ],
    stack: ['Python', 'Logistic Regression', 'Classification', 'Streamlit'],
    links: {
      github: 'https://github.com/arshiafreen090/Heart-Disease-Prediction-Streamlit',
      live: 'https://disease-heart.streamlit.app/',
    },
    note: 'A learning project — not a medical or diagnostic tool.',
  },
  {
    id: 'tiny',
    title: 'Tiny Projects',
    status: 'Collection',
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
    tech: [
      { label: 'Language', items: ['Python'] },
      { label: 'Speech', items: ['Google speech-to-text', 'pyttsx3 text-to-speech'] },
      { label: 'Automation', items: ['PyAutoGUI desktop automation'] },
      { label: 'AI', items: ['OpenRouter LLM API'] },
      { label: 'Patterns', items: ['In-memory conversation history', 'Silence / inactivity timeouts'] },
    ],
    stack: ['Python', 'pyttsx3', 'PyAutoGUI', 'OpenRouter'],
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
    tech: [
      { label: 'Languages (repo)', items: ['TypeScript', 'Python', 'HTML', 'CSS'] },
    ],
    stack: ['TypeScript', 'Python'],
    links: {
      github: 'https://github.com/arshiafreen090/Resync-AI',
      live: 'https://resync.afreen.tech/',
    },
  },
];

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<ProjectId, Project>;
