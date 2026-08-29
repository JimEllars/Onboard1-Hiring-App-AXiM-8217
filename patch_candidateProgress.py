import re

with open('src/pages/CandidateProgress.jsx', 'r') as f:
    content = f.read()

# Update initial stages state to have all 8 stages and correctly map the candidate current stage status
stages_code = """  const [stages, setStages] = useState([
    { name: 'Applied', status: 'completed', duration: '1 day', date: 'Oct 12' },
    { name: 'Video Assessment', status: 'completed', duration: '2 days', date: 'Oct 14' },
    { name: 'Live Interview', status: 'current', duration: '3 days', date: 'Oct 17' },
    { name: 'Offer / E-Sign', status: 'pending', duration: '-', date: '-' },
    { name: 'Hired', status: 'pending', duration: '-', date: '-' },
  ]);"""

new_stages_code = """  const CANONICAL_STAGES = ['Applied', 'Fit Survey', 'Video Assessment', 'Live Interview', 'Screening/Checkr', 'Offer / E-Sign', 'Hired', 'Archived / Closed'];
  const [stages, setStages] = useState(CANONICAL_STAGES.map(s => ({ name: s, status: 'pending', duration: '-', date: '-' })));"""

content = content.replace(stages_code, new_stages_code)


use_effect_code = """  useEffect(() => {
    logEvent(TELEMETRY_EVENTS.CANDIDATE_STEPPER_VIEWED || 'candidate_stepper_viewed', { candidateId: id });
    const foundCandidate = candidates.find(c => c.id === parseInt(id));
    if (foundCandidate) {
      setCandidate(prev => ({
        ...prev,
        ...foundCandidate,
        currentStage: foundCandidate.stage || 'Interview'
      }));
    }
  }, [id, candidates]);"""

new_use_effect_code = """  useEffect(() => {
    logEvent(TELEMETRY_EVENTS.CANDIDATE_STEPPER_VIEWED || 'candidate_stepper_viewed', { candidateId: id });
    const foundCandidate = candidates.find(c => String(c.id) === String(id));
    if (foundCandidate) {
      const currentStage = foundCandidate.stage || 'Live Interview';
      setCandidate(prev => ({
        ...prev,
        ...foundCandidate,
        currentStage
      }));

      // Update stages status based on currentStage index
      const currentIndex = CANONICAL_STAGES.indexOf(currentStage);
      setStages(CANONICAL_STAGES.map((s, index) => {
        let status = 'pending';
        if (index < currentIndex) status = 'completed';
        else if (index === currentIndex) status = 'current';

        // Handle special cases
        if (currentStage === 'Archived / Closed' && s !== 'Archived / Closed') {
             status = index <= CANONICAL_STAGES.indexOf(foundCandidate.previousStage || 'Applied') ? 'completed' : 'pending';
        }

        return { name: s, status, duration: index <= currentIndex ? '1 day' : '-', date: index <= currentIndex ? 'Recent' : '-' };
      }));
    }
  }, [id, candidates]);"""

content = content.replace(use_effect_code, new_use_effect_code)

with open('src/pages/CandidateProgress.jsx', 'w') as f:
    f.write(content)
