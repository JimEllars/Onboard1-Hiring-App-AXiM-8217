import re

with open('src/pages/ReferralProgram.jsx', 'r') as f:
    content = f.read()

# Imports
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useMemo } from 'react';\nimport { useOnboardData } from '../hooks/useOnboardData';")

# Inside component:
hook_str = """
  const { candidates } = useOnboardData();

  const referralStats = useMemo(() => {
    const referredCandidates = candidates.filter(c => c.referral_code);

    let totalPending = 0;
    let convertedCount = 0;

    const referralsList = referredCandidates.map(c => {
      let reward = '$0';
      let numericReward = 0;

      const stage = c.stage || 'Applied';

      if (['Applied', 'Screening', 'Video Assessment'].includes(stage)) {
         reward = '$500';
         numericReward = 500;
      } else if (['Interviewing', 'Interview', 'Technical Task', 'Offer'].includes(stage)) {
         reward = '$1,000';
         numericReward = 1000;
      } else if (['Offer / E-Sign', 'Hired'].includes(stage)) {
         reward = '$2,500';
         numericReward = 2500;
      }

      if (['Offer / E-Sign', 'Hired'].includes(stage)) {
         convertedCount++;
      }

      totalPending += numericReward;

      return {
        id: c.id,
        name: c.name,
        role: c.role || 'Applicant',
        status: stage,
        reward: reward,
        date: c.applied || 'Recently'
      };
    });

    const conversionRate = referredCandidates.length > 0
       ? Math.round((convertedCount / referredCandidates.length) * 100)
       : 0;

    return {
      list: referralsList,
      total: referredCandidates.length,
      pending: '$' + totalPending.toLocaleString(),
      conversion: conversionRate + '%'
    };
  }, [candidates]);
"""

content = content.replace(
    "const [userRef] = useState(\"EMP\" + Math.floor(Math.random() * 900 + 100));",
    "const [userRef] = useState(\"EMP\" + Math.floor(Math.random() * 900 + 100));" + hook_str
)

# Remove old static list
content = re.sub(r"const referrals = \[.*?\];\n", "", content, flags=re.DOTALL)

# Update UI mapping
content = content.replace("{ label: 'Total Referrals', value: '12',", "{ label: 'Total Referrals', value: referralStats.total.toString(),")
content = content.replace("{ label: 'Pending Rewards', value: '$1,500',", "{ label: 'Pending Rewards', value: referralStats.pending,")
content = content.replace("{ label: 'Conversion Rate', value: '18%',", "{ label: 'Conversion Rate', value: referralStats.conversion,")

content = content.replace("referrals.map((ref)", "referralStats.list.map((ref)")

with open('src/pages/ReferralProgram.jsx', 'w') as f:
    f.write(content)
