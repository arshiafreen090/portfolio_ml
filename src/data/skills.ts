import type { SkillCategory, SkillTerminal } from './types';

export const skillCategories: SkillCategory[] = [
  { id: 'programming', title: 'Programming', items: ['Python', 'C++', 'SQL'] },
  { id: 'data', title: 'Data Science', items: ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'EDA', 'Statistics'] },
  { id: 'ml', title: 'Machine Learning', items: ['Scikit-learn', 'XGBoost', 'Feature Engineering', 'Model Evaluation', 'SHAP'] },
  { id: 'analytics', title: 'Analytics', items: ['Demand Forecasting', 'Time-Series Analysis', 'ETA Prediction', 'Logistics Analytics'] },
  { id: 'dev', title: 'Development', items: ['Streamlit', 'React', 'Tailwind CSS', 'Git', 'GitHub'] },
  { id: 'tools', title: 'Tools', items: ['Jupyter', 'VS Code', 'MySQL', 'WSL', 'n8n', 'Figma', 'Canva'] },
];

export const skillCategoryById = Object.fromEntries(skillCategories.map((c) => [c.id, c]));

/** The three terminals in the Skills Database room. */
export const skillTerminals: SkillTerminal[] = [
  { id: 'code-data', title: 'Code & Data', categories: ['programming', 'data'] },
  { id: 'ml-analytics', title: 'ML & Analytics', categories: ['ml', 'analytics'] },
  { id: 'build-tools', title: 'Build & Tools', categories: ['dev', 'tools'] },
];

export const skillTerminalById = Object.fromEntries(skillTerminals.map((t) => [t.id, t]));
