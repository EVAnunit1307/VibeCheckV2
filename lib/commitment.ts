import { supabase } from './supabase';

// Types
export interface ScoreUpdate {
  previous_score: number;
  new_score: number;
  change: number;
}

export interface PlanCompletionSummary {
  total_attended: number;
  total_no_shows: number;
}

export interface UserStats {
  plans_attended: number;
  plans_flaked: number;
  attendance_rate: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  commitment_score: number;
  stats: UserStats;
  badge: string;
}

export interface CompatibilityResult {
  score: number;
  match_reasons: string[];
}

export type Outcome = 'attended' | 'no_show' | 'cancelled_late' | 'cancelled_early';

/**
 * Update a user's commitment score based on their action
 */
export async function updateCommitmentScore(
  userId: string,
  outcome: Outcome
): Promise<ScoreUpdate | null> {
  try {
    // Fetch current user profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('commitment_score, total_attended, total_flaked')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      return null;
    }

    const currentScore = profile?.commitment_score || 100;
    const totalAttended = profile?.total_attended || 0;
    const totalFlaked = profile?.total_flaked || 0;

    // Calculate score change based on outcome
    let change = 0;
    let newAttended = totalAttended;
    let newFlaked = totalFlaked;

    switch (outcome) {
      case 'attended':
        change = 2;
        newAttended += 1;
        break;
      case 'no_show':
        change = -10;
        newFlaked += 1;
        break;
      case 'cancelled_late':
        change = -8;
        newFlaked += 1;
        break;
      case 'cancelled_early':
        change = -3;
        break;
    }

    // Calculate new score (clamp between 0-100)
    const newScore = Math.max(0, Math.min(100, currentScore + change));

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        commitment_score: newScore,
        total_attended: newAttended,
        total_flaked: newFlaked,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return null;
    }

    return {
      previous_score: currentScore,
      new_score: newScore,
      change,
    };
  } catch (error) {
    console.error('Error in updateCommitmentScore:', error);
    return null;
  }
}

/**
 * Mark a plan as complete and update all participants' scores
 */
export async function markPlanComplete(planId: string): Promise<PlanCompletionSummary | null> {
  try {
    // Fetch all confirmed participants
    const { data: participants, error: fetchError } = await supabase
      .from('plan_participants')
      .select('user_id, checked_in')
      .eq('plan_id', planId)
      .eq('status', 'confirmed');

    if (fetchError) {
      console.error('Error fetching participants:', fetchError);
      return null;
    }

    let totalAttended = 0;
    let totalNoShows = 0;

    // Update scores for each participant
    for (const participant of participants || []) {
      if (participant.checked_in) {
        await updateCommitmentScore(participant.user_id, 'attended');
        totalAttended++;
      } else {
        await updateCommitmentScore(participant.user_id, 'no_show');
        totalNoShows++;
      }
    }

    // Update plan status to completed
    const { error: updateError } = await supabase
      .from('plans')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (updateError) {
      console.error('Error updating plan:', updateError);
      return null;
    }

    return {
      total_attended: totalAttended,
      total_no_shows: totalNoShows,
    };
  } catch (error) {
    console.error('Error in markPlanComplete:', error);
    return null;
  }
}

/**
 * Get group leaderboard with rankings and stats
 */
export async function getGroupLeaderboard(groupId: string): Promise<LeaderboardEntry[] | null> {
  try {
    // Fetch all group members with profiles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        user_id,
        profiles (
          full_name,
          commitment_score,
          total_attended,
          total_flaked
        )
      `)
      .eq('group_id', groupId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return null;
    }

    if (!members || members.length === 0) {
      return [];
    }

    // Calculate stats for each member
    const leaderboardData = members.map((member) => {
      const profile = member.profiles;
      const attended = profile.total_attended || 0;
      const flaked = profile.total_flaked || 0;
      const total = attended + flaked;
      const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 100;

      return {
        user_id: member.user_id,
        user_name: profile.full_name,
        commitment_score: profile.commitment_score || 100,
        stats: {
          plans_attended: attended,
          plans_flaked: flaked,
          attendance_rate: attendanceRate,
        },
      };
    });

    // Sort by commitment score (highest first)
    leaderboardData.sort((a, b) => b.commitment_score - a.commitment_score);

    // Add rank and trophy badges
    const leaderboard: LeaderboardEntry[] = leaderboardData.map((entry, index) => {
      const rank = index + 1;
      let badge = '';

      if (rank === 1) badge = '🏆';
      else if (rank === 2) badge = '🥈';
      else if (rank === 3) badge = '🥉';

      return {
        rank,
        badge,
        ...entry,
      };
    });

    return leaderboard;
  } catch (error) {
    console.error('Error in getGroupLeaderboard:', error);
    return null;
  }
}

/**
 * Check in a user to a plan
 */
export async function checkInToPlan(planId: string, userId: string): Promise<boolean> {
  try {
    // Update plan_participants
    const { error: updateError } = await supabase
      .from('plan_participants')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('plan_id', planId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error checking in:', updateError);
      return false;
    }

    // Get user name for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (profile) {
      // Get all other participants
      const { data: participants } = await supabase
        .from('plan_participants')
        .select('user_id')
        .eq('plan_id', planId)
        .neq('user_id', userId);

      // Send notification to each participant
      // Note: You would integrate with a notification service here
      // For now, we'll create a notification record in the database
      if (participants) {
        const notifications = participants.map((p) => ({
          user_id: p.user_id,
          plan_id: planId,
          message: `${profile.full_name} just arrived!`,
          type: 'check_in',
          created_at: new Date().toISOString(),
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in checkInToPlan:', error);
    return false;
  }
}

/**
 * Calculate compatibility between a user and a group
 */
export async function calculateGroupCompatibility(
  userId: string,
  groupId: string
): Promise<CompatibilityResult | null> {
  try {
    // Get user's preferences (if you have a preferences table)
    const { data: userPrefs } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Get group's typical preferences (aggregate from members)
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select(`
        user_id,
        user_preferences (*)
      `)
      .eq('group_id', groupId);

    if (!userPrefs || !groupMembers || groupMembers.length === 0) {
      // Default compatibility if no preferences set
      return {
        score: 75,
        match_reasons: ['Join the group to build your compatibility score!'],
      };
    }

    // Calculate match score based on preferences
    // This is a simplified example - customize based on your actual preferences
    let matchScore = 50; // Base score
    const matchReasons: string[] = [];

    // Example: Compare preferred event types, times, venues, etc.
    // You would implement this based on your actual user_preferences schema

    // For now, return a sample result
    matchScore = Math.min(100, matchScore + Math.floor(Math.random() * 30));

    if (matchScore >= 80) {
      matchReasons.push('Great vibe match! 🎉');
      matchReasons.push('Similar event preferences');
    } else if (matchScore >= 60) {
      matchReasons.push('Good compatibility 👍');
      matchReasons.push('Some overlapping interests');
    } else {
      matchReasons.push('Different vibes, but that\'s okay! 🌈');
      matchReasons.push('Diversity makes groups stronger');
    }

    return {
      score: matchScore,
      match_reasons: matchReasons,
    };
  } catch (error) {
    console.error('Error in calculateGroupCompatibility:', error);
    return null;
  }
}

/**
 * Get user's commitment history
 */
export async function getCommitmentHistory(userId: string, limit: number = 10) {
  try {
    const { data: history, error } = await supabase
      .from('plan_participants')
      .select(`
        plan_id,
        status,
        vote,
        checked_in,
        plans (
          title,
          planned_date,
          status,
          events (
            title
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching commitment history:', error);
      return null;
    }

    return history;
  } catch (error) {
    console.error('Error in getCommitmentHistory:', error);
    return null;
  }
}

/**
 * Award bonus points for consistency
 */
export async function awardConsistencyBonus(userId: string): Promise<number> {
  try {
    // Check if user has attended 5 plans in a row without flaking
    const { data: recentPlans } = await supabase
      .from('plan_participants')
      .select('checked_in, status')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!recentPlans || recentPlans.length < 5) {
      return 0; // Not enough history
    }

    // Check if all 5 were checked in
    const allCheckedIn = recentPlans.every((plan) => plan.checked_in === true);

    if (allCheckedIn) {
      // Award 5 bonus points
      const { data: profile } = await supabase
        .from('profiles')
        .select('commitment_score')
        .eq('id', userId)
        .single();

      if (profile) {
        const newScore = Math.min(100, profile.commitment_score + 5);
        await supabase
          .from('profiles')
          .update({ commitment_score: newScore })
          .eq('id', userId);

        return 5; // Return bonus amount
      }
    }

    return 0;
  } catch (error) {
    console.error('Error in awardConsistencyBonus:', error);
    return 0;
  }
}
