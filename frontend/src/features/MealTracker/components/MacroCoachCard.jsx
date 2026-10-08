import { useState } from 'react';
import { apiGet, apiPost } from '../../../lib/apiClient.js';
import { useActiveGoal } from '../../Onboarding/hooks/useActiveGoal.js';
import { useTodayMeals } from '../../Dashboard/hooks/useTodayMeals.js';
import { macroCoachMessage } from '../../Dashboard/utils/macroCoach.js';
import { goalLabel } from '../../Onboarding/constants/goals.js';

// Macro Coach — lives inside Nutrition, powered by actual logged data vs goal targets.
// "View Suggestions" calls the AI suggest-plan endpoint for the latest meal and
// shows the recommended training plan + reasoning (master plan §5 Macro Coach).
const MacroCoachCard = ({ userId, lastMeal }) => {
  const { goal } = useActiveGoal(userId);
  const { meals } = useTodayMeals(userId);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const viewSuggestions = async () => {
    if (loading) return;
    setLoading(true); setError('');
    try {
      // Prefer the just-logged meal; fall back to the latest history entry.
      let meal = lastMeal && lastMeal.food_name
        ? { food_name: lastMeal.food_name, calories: lastMeal.calories || 0, protein: lastMeal.protein || 0, carbs: lastMeal.carbs || 0, fat: lastMeal.fat || 0 }
        : null;
      if (!meal) {
        const data = await apiGet(`/api/food-logs/${userId}?limit=1`);
        const latest = (data.records || [])[0];
        if (!latest) throw new Error('Log a meal first to get suggestions.');
        meal = { food_name: latest.food_name, calories: latest.calories || 0, protein: latest.protein || 0, carbs: latest.carbs || 0, fat: latest.fat || 0 };
      }
      const data = await apiPost(`/api/food-logs/${userId}/suggest-plan`, {
        ...meal,
        // Same day-basis as the tracker's own totals (browser-local today),
        // so the coach reasons about the numbers the user actually sees.
        caloriesSoFar: meals.kcal || 0,
      }, { timeoutMs: 60000 });
      setSuggestion(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[24px] border border-[var(--border-light)] overflow-hidden">
      <div className="px-5 py-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[var(--accent)]">auto_awesome</span>
          </div>
          <div>
            <p className="text-[13px] font-bold text-[var(--text-primary)] leading-none">Macro Coach</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {goal ? `${goalLabel(goal.goalType)} · ${goal.dailyKcal?.toLocaleString() ?? '—'} kcal target` : 'Set a goal to unlock targets'}
            </p>
          </div>
        </div>
        <p className="text-[13px] text-[var(--text-primary)] leading-relaxed">{macroCoachMessage(meals, goal || {})}</p>
        <button onClick={viewSuggestions} disabled={loading}
          className="mt-3 w-full py-2.5 rounded-full text-xs font-bold bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent)] hover:brightness-110 transition-all disabled:opacity-50">
          {loading ? 'Getting suggestions…' : 'View Suggestions'}
        </button>
        {error && <p className="text-red-400 text-[11px] mt-2">{error}</p>}
        {suggestion && (
          <div className="mt-3 pt-3 border-t border-[var(--border-light)] space-y-2">
            <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">{suggestion.message}</p>
            {suggestion.reasoning && (
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{suggestion.reasoning}</p>
            )}
            {suggestion.recommended_plan ? (
              <div className="bg-[var(--bg-hover)] border border-[var(--border-light)] rounded-xl px-3 py-2.5">
                <p className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wide">
                  Recommended: {suggestion.recommended_plan.title || suggestion.recommended_plan.name}
                </p>
                {suggestion.estimated_minutes != null && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">~{suggestion.estimated_minutes} min to balance this meal</p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-[var(--text-muted)]">No training plan fits yet — enroll in a plan to get picks.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MacroCoachCard;
