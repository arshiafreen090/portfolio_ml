import type { SkillCategory, SkillTerminal } from './types';

// Merged from the resume's Technical Skills and CLAUDE_BUILD_CONTEXT.md.
export const skillCategories: SkillCategory[] = [
  { id: 'programming', title: 'Languages', items: ['Python', 'C++', 'SQL'] },
  {
    id: 'ml', title: 'Machine Learning',
    items: ['scikit-learn', 'XGBoost', 'SHAP', 'Regression', 'Classification', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning'],
  },
  {
    id: 'data', title: 'Data Science',
    items: ['pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Statistical Analysis', 'Exploratory Data Analysis', 'Data Visualization'],
  },
  {
    id: 'analytics', title: 'Forecasting & Geospatial',
    items: ['Time-Series Forecasting', 'Recursive CV', 'Demand Forecasting', 'ETA Prediction', 'Geospatial Analysis', 'Haversine Distance', 'BallTree', 'H3'],
  },
  { id: 'dev', title: 'Development', items: ['Streamlit', 'React', 'Tailwind CSS', 'Git', 'GitHub'] },
  {
    id: 'tools', title: 'Tools',
    items: ['Jupyter Notebook', 'Google Colab', 'Kaggle', 'VS Code', 'MySQL', 'WSL', 'n8n', 'Figma', 'Canva'],
  },
];

export const skillCategoryById = Object.fromEntries(skillCategories.map((c) => [c.id, c]));

/** The three terminals in the Skills Database room. */
export const skillTerminals: SkillTerminal[] = [
  { id: 'code-data', title: 'Code & Data', categories: ['programming', 'data'] },
  { id: 'ml-analytics', title: 'ML & Forecasting', categories: ['ml', 'analytics'] },
  { id: 'build-tools', title: 'Build & Tools', categories: ['dev', 'tools'] },
];

export const skillTerminalById = Object.fromEntries(skillTerminals.map((t) => [t.id, t]));
