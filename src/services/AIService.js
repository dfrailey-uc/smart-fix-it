import questionConfig from '../data/question-config.json';

export const AIService = {
  interpretProblem(text) {
    const t = text.toLowerCase();

    // 1. Diversion Detection
    if (t.includes('lost my key') || t.includes('forgotten key') || t.includes('can\'t get into my room')) {
      return { type: 'diversion', target: 'lockout', message: 'This looks like a lockout issue.' };
    }

    // 2. Multi-Issue Detection
    const issues = [];
    if (t.includes('sink') || t.includes('leak') || t.includes('water')) {
      issues.push({ id: 'plumbing-sink-leak', label: questionConfig.categories['plumbing-sink-leak'].label });
    }
    if (t.includes('light') || t.includes('electrical') || t.includes('flicker') || t.includes('spark')) {
      issues.push({ id: 'electrical-flicker', label: questionConfig.categories['electrical-flicker'].label });
    }
    if (t.includes('ac') || t.includes('cooling') || t.includes('hvac') || t.includes('hot')) {
      issues.push({ id: 'hvac-no-cooling', label: questionConfig.categories['hvac-no-cooling'].label });
    }
    if (t.includes('lock') || t.includes('reader') || t.includes('keycard')) {
      // Special distinction: if it's just "can't get in", it's a diversion. 
      // If it mentions "lock", "reader", "malfunction", it's maintenance.
      if (!t.includes('lost my key')) {
        issues.push({ id: 'lock-malfunction', label: questionConfig.categories['lock-malfunction'].label });
      }
    }
    if (t.includes('door') || t.includes('cabinet') || t.includes('loose') || t.includes('broken')) {
      issues.push({ id: 'building-repair', label: 'Building Repair' });
    }

    if (issues.length === 0) {
      return { type: 'unknown', message: 'I\'m not quite sure what the issue is. Could you provide more detail?' };
    }

    if (issues.length > 1) {
      return { type: 'multi', issues };
    }

    return { type: 'single', issue: issues[0] };
  },

  getSuggestions(issueId) {
    // Simulate providing a list of options for an ambiguous issue
    const suggestions = {
      'hvac-no-cooling': ['No cooling', 'Weak airflow', 'Unusual noise', 'Thermostat issue'],
      'electrical-flicker': ['Light flickering', 'Power outage', 'Outlet not working'],
    };
    return suggestions[issueId] || [];
  }
};
