import re

with open('src/pages/CandidateEvaluation.jsx', 'r') as f:
    content = f.read()

# Add useOnboardData import if not there
if "import { useOnboardData }" not in content:
    content = content.replace("import { supabase } from '../lib/supabaseClient';", "import { supabase } from '../lib/supabaseClient';\nimport { useOnboardData } from '../hooks/useOnboardData';")

# Add hook call
if "const { updateCandidateStage } = useOnboardData();" not in content:
    content = content.replace('  const navigate = useNavigate();', '  const navigate = useNavigate();\n  const { updateCandidateStage } = useOnboardData();')


# Update handleSubmit logic
old_submit_catch = """      // Fallback for missing backend environment
      if (error.message === 'Network response was not ok' || error.message.includes('fetch')) {
         setIsSuccess(true);
         setTimeout(() => {
           navigate('/candidates');
         }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };"""

new_submit_catch = """      // Fallback for missing backend environment
      if (error.message === 'Network response was not ok' || error.message.includes('fetch')) {

         let nextStage = 'Interview';
         if (recommendation === 'hire') nextStage = 'Offer / E-Sign';
         else if (recommendation === 'reject') nextStage = 'Archived / Closed';
         else if (recommendation === 'maybe') nextStage = 'Screening/Checkr';

         updateCandidateStage(payload.candidateId, nextStage);
         logEvent('candidate_stage_progressed', { candidateId: payload.candidateId, newStage: nextStage });

         setIsSuccess(true);
         setTimeout(() => {
           navigate('/candidates');
         }, 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };"""

# Ensure update on successful try block
old_submit_try = """      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Success', candidateId: payload.candidateId });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/candidates');
      }, 1500);

    } catch (error) {"""

new_submit_try = """      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { action: 'Evaluation_Submission_Success', candidateId: payload.candidateId });

      let nextStage = 'Interview';
      if (recommendation === 'hire') nextStage = 'Offer / E-Sign';
      else if (recommendation === 'reject') nextStage = 'Archived / Closed';
      else if (recommendation === 'maybe') nextStage = 'Screening/Checkr';

      updateCandidateStage(payload.candidateId, nextStage);
      logEvent('candidate_stage_progressed', { candidateId: payload.candidateId, newStage: nextStage });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/candidates');
      }, 1500);

    } catch (error) {"""

content = content.replace(old_submit_catch, new_submit_catch)
content = content.replace(old_submit_try, new_submit_try)

with open('src/pages/CandidateEvaluation.jsx', 'w') as f:
    f.write(content)
