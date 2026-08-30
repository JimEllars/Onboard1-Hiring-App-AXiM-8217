import re

with open('src/pages/CandidateProgress.jsx', 'r') as f:
    content = f.read()

# Update getCtaLabel and getCtaAction
label_action_pattern = r"  const getCtaLabel = \(stageName\) => \{\n.*?  const getCtaAction = \(stageName\) => \{\n.*?\n  \};\n"

new_label_action = """  const getCtaLabel = (stageName) => {
    switch (stageName) {
      case 'Fit Survey': return 'Complete Fit Survey';
      case 'Video Assessment': return 'Start Video Assessment';
      case 'Live Interview': return 'Schedule Live Interview';
      case 'Offer / E-Sign': return 'Review & Sign Offer';
      default: return 'Move to Next Stage';
    }
  };

  const getCtaAction = (stageName) => {
    logEvent(TELEMETRY_EVENTS.TASK_ACTION_CLICKED || 'task_action_clicked', { candidateId: candidate.id, currentStage: stageName });
    if (stageName === 'Fit Survey') {
       navigate(`/apply/questionnaire?verified=true&candidateId=${candidate.id}`);
    } else if (stageName === 'Video Assessment') {
       navigate(`/apply/video-assessment?candidateId=${candidate.id}`);
    } else if (stageName === 'Live Interview') {
       navigate(`/apply/schedule?candidateId=${candidate.id}`);
    } else if (stageName === 'Offer / E-Sign') {
       navigate(`/offer/${candidate.id}`);
    } else {
       handleMoveToNextStage();
    }
  };
"""

content = re.sub(label_action_pattern, new_label_action, content, flags=re.DOTALL)

with open('src/pages/CandidateProgress.jsx', 'w') as f:
    f.write(content)
