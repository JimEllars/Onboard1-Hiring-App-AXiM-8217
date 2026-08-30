import re

with open('functions/api/finalize-hire.js', 'r') as f:
    content = f.read()

referral_code_block = """
    if (updateError) {
      console.error("Failed to update candidate status", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    if (candidate.referral_code) {
      const { error: referralError } = await supabase
        .from('onboard1_referrals')
        .upsert({
          candidate_id: candidate.id,
          referral_code: candidate.referral_code,
          status: 'approved',
          reward_amount: 2500,
          hired_at: new Date().toISOString()
        }, { onConflict: 'candidate_id' });

      if (referralError) {
        console.error("Failed to process referral", referralError);
      } else {
        await supabase.from('api_usage_logs').insert([{
           event_type: 'referral.reward_approved',
           status: 'success',
           details: { candidateId: candidate.id, referralCode: candidate.referral_code, reward: 2500 }
        }]);
      }
    }

    return successResponse({ message: "Hire finalized successfully", status: finalStatus }, 200, headers);
"""

new_content = content.replace("""    if (updateError) {
      console.error("Failed to update candidate status", updateError);
      return errorResponse("Failed to update candidate status", "DB_ERROR", 500, headers);
    }

    return successResponse({ message: "Hire finalized successfully", status: finalStatus }, 200, headers);""", referral_code_block.strip())

with open('functions/api/finalize-hire.js', 'w') as f:
    f.write(new_content)
