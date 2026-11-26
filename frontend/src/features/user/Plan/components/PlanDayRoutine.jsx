import RoutineCard from '../../../../components/routine/RoutineCard.jsx';
import { useDayRoutine } from '../hooks/useDayRoutine.js';

// Fetches the personalized routine for a plan day and renders the warm-up or
// cool-down card (Revision #3). Renders nothing for recovery days or when the
// server says no routine applies. Used by DayTracker and the workout summary.
export default function PlanDayRoutine({ planId, dayNumber, phase = 'warmup', doneLabel = undefined, onFinished = undefined, defaultOpen = false }) {
  const query = useDayRoutine(planId, dayNumber);
  if (query.isPending && query.fetchStatus === 'idle') return null; // disabled
  if (query.isPending) return <RoutineCard phase={phase} loading />;
  if (query.isError) {
    // 404 = day gone / plan not visible: nothing useful to show.
    if (query.error?.status === 404) return null;
    return <RoutineCard phase={phase} error onRetry={() => query.refetch()} />;
  }
  const data = query.data;
  if (!data?.applicable) return null;
  return (
    <RoutineCard
      key={`${planId}-${dayNumber}-${phase}`}
      phase={phase}
      block={phase === 'warmup' ? data.warmup : data.cooldown}
      rationale={phase === 'warmup' ? data.rationale : data.rationale?.filter((r) => /stretch/i.test(r))}
      doneLabel={doneLabel}
      onFinished={onFinished}
      defaultOpen={defaultOpen}
    />
  );
}
