import re

with open('src/pages/AsyncVideoInterview.jsx', 'r') as f:
    content = f.read()

# Replace the candidateId and add useSearchParams
imports_pattern = r"import \{ useNavigate \} from 'react-router-dom';"
new_imports = "import { useNavigate, useSearchParams } from 'react-router-dom';"
content = content.replace(imports_pattern, new_imports)

candidate_pattern = r"  const navigate = useNavigate\(\);\n\n  // We need a dummy candidate ID for this sprint if we don't have one in context\n  const candidateId = 'candidate-123';"
new_candidate = """  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract candidateId and token from searchParams, fallback if omitted
  const candidateId = searchParams.get('candidateId') || 'candidate-123';
  const token = searchParams.get('token');"""
content = content.replace(candidate_pattern, new_candidate)

# Add prompts array and currentPrompt index
prompts = """
  const PROMPTS = [
    { title: "Introduction", text: "Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team. You have up to 3 minutes." },
    { title: "Technical Background", text: "Describe a challenging technical problem you've solved recently. What was your approach and what did you learn?" },
    { title: "Problem Solving", text: "Tell us about a time you had to learn a new technology or tool quickly to complete a project." },
    { title: "Collaboration", text: "Describe a situation where you had a disagreement with a team member. How did you resolve it?" },
    { title: "Career Goals", text: "Where do you see yourself in 3-5 years, and how does this role align with your goals?" }
  ];
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [recordedAnswers, setRecordedAnswers] = useState({});
"""
content = content.replace("const [isSubmitted, setIsSubmitted] = useState(false);", f"const [isSubmitted, setIsSubmitted] = useState(false);\n{prompts}")


# Modify handleSubmit to handle multiple prompts
handle_submit_pattern = r"  const handleSubmit = async \(\) => \{(?:.|\n)*?  \};\n"
new_handle_submit = """  const handleSubmit = async () => {
    // If not the last question, go to the next one
    if (currentPromptIndex < PROMPTS.length - 1) {
      setRecordedAnswers(prev => ({ ...prev, [currentPromptIndex]: recordedVideoUrl }));
      setCurrentPromptIndex(prev => prev + 1);

      // Reset state for next question
      setHasRecorded(false);
      setRecordedVideoUrl(null);
      recordedChunksRef.current = [];
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      return;
    }

    // It is the last question, submit everything
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/submit-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId,
          token
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit video');
      }

      setIsSubmitted(true);

      // Dispatch event for Dashboard sync
      window.dispatchEvent(new CustomEvent('candidate-stage-updated', {
        detail: { candidateId, newStage: 'Interview Review' }
      }));

      // Wait for a few seconds to show the success message, then navigate to next step
      setTimeout(() => {
        navigate('/apply/schedule');
      }, 3000);
    } catch (error) {
      console.error('Submission error:', error);
      setIsSubmitting(false);
      // Optional: Handle error UI
    }
  };
"""
content = re.sub(handle_submit_pattern, new_handle_submit, content)


# Update title and prompt text
title_pattern = r"Question 1 of 5: Introduction & Background"
content = content.replace(title_pattern, "Question {currentPromptIndex + 1} of {PROMPTS.length}: {PROMPTS[currentPromptIndex].title}")

prompt_text_pattern = r"Please introduce yourself, briefly describe your past experience, and explain why you're interested in joining our team\. You have up to 3 minutes\."
content = content.replace(prompt_text_pattern, "{PROMPTS[currentPromptIndex].text}")

# Update submit button text
submit_btn_pattern = r"\{isSubmitting \? 'Submitting\.\.\.' : 'Submit & Continue'\}"
content = content.replace(submit_btn_pattern, "{isSubmitting ? 'Submitting...' : (currentPromptIndex < PROMPTS.length - 1 ? 'Next Question' : 'Submit & Continue')}")

with open('src/pages/AsyncVideoInterview.jsx', 'w') as f:
    f.write(content)
