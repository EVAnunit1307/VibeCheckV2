import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { format } from 'date-fns';
import { supabase } from './supabase';

// Types
export interface NotificationData {
  type: 'plan_invite' | 'plan_confirmed' | 'vote_reminder' | 'day_of_reminder' | 'check_in' | 'plan_completed';
  planId?: string;
  groupId?: string;
  [key: string]: any;
}

export interface NotificationSummary {
  sent: number;
  failed: number;
}

// Configure notification handler for foreground notifications
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register device for push notifications and save token to database
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  try {
    // Check if it's a physical device
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications');
      return null;
    }

    // Get Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your Expo project ID
    });
    
    const token = tokenData.data;

    // Save token to profiles table
    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);

    if (error) {
      console.error('Error saving push token:', error);
      return null;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366f1',
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Send a push notification via Expo Push API
 */
async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: NotificationData
): Promise<boolean> {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    
    if (result.data && result.data.status === 'error') {
      console.error('Push notification error:', result.data.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send plan invitation notifications to multiple recipients
 */
export async function sendPlanInviteNotification(
  planId: string,
  recipientUserIds: string[]
): Promise<NotificationSummary> {
  let sent = 0;
  let failed = 0;

  try {
    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select(`
        title,
        created_by,
        events (
          title
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError);
      return { sent, failed: recipientUserIds.length };
    }

    // Fetch creator name
    const { data: creator } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', plan.created_by)
      .single();

    const creatorName = creator?.full_name || 'Someone';
    const eventTitle = plan.events?.title || plan.title;

    // Fetch recipient push tokens
    const { data: recipients, error: recipientsError } = await supabase
      .from('profiles')
      .select('id, push_token')
      .in('id', recipientUserIds);

    if (recipientsError || !recipients) {
      console.error('Error fetching recipients:', recipientsError);
      return { sent, failed: recipientUserIds.length };
    }

    // Send notification to each recipient
    for (const recipient of recipients) {
      if (!recipient.push_token) {
        failed++;
        continue;
      }

      const success = await sendPushNotification(
        recipient.push_token,
        'New Plan Invitation',
        `${creatorName} invited you to ${eventTitle}`,
        { type: 'plan_invite', planId }
      );

      if (success) sent++;
      else failed++;
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error in sendPlanInviteNotification:', error);
    return { sent, failed: recipientUserIds.length };
  }
}

/**
 * Send plan confirmed notification to all participants
 */
export async function sendPlanConfirmedNotification(planId: string): Promise<NotificationSummary> {
  let sent = 0;
  let failed = 0;

  try {
    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select(`
        title,
        planned_date,
        events (
          title
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError);
      return { sent, failed };
    }

    // Fetch confirmed participants
    const { data: participants, error: participantsError } = await supabase
      .from('plan_participants')
      .select(`
        user_id,
        profiles (
          push_token
        )
      `)
      .eq('plan_id', planId)
      .eq('status', 'confirmed');

    if (participantsError || !participants) {
      console.error('Error fetching participants:', participantsError);
      return { sent, failed };
    }

    const eventTitle = plan.events?.title || plan.title;
    const date = format(new Date(plan.planned_date), 'MMM d');
    const time = format(new Date(plan.planned_date), 'h:mm a');

    // Send notification to each participant
    for (const participant of participants) {
      const pushToken = participant.profiles?.push_token;
      if (!pushToken) {
        failed++;
        continue;
      }

      const success = await sendPushNotification(
        pushToken,
        'Plan Confirmed! 🎉',
        `${eventTitle} on ${date} at ${time}`,
        { type: 'plan_confirmed', planId }
      );

      if (success) sent++;
      else failed++;
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error in sendPlanConfirmedNotification:', error);
    return { sent, failed };
  }
}

/**
 * Send vote reminder to participants who haven't voted
 */
export async function sendVoteReminderNotification(planId: string): Promise<NotificationSummary> {
  let sent = 0;
  let failed = 0;

  try {
    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select(`
        title,
        events (
          title
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError);
      return { sent, failed };
    }

    // Fetch participants who haven't voted
    const { data: participants, error: participantsError } = await supabase
      .from('plan_participants')
      .select(`
        user_id,
        profiles (
          push_token
        )
      `)
      .eq('plan_id', planId)
      .is('vote', null);

    if (participantsError || !participants) {
      console.error('Error fetching participants:', participantsError);
      return { sent, failed };
    }

    const eventTitle = plan.events?.title || plan.title;

    // Send notification to each participant
    for (const participant of participants) {
      const pushToken = participant.profiles?.push_token;
      if (!pushToken) {
        failed++;
        continue;
      }

      const success = await sendPushNotification(
        pushToken,
        'Vote Needed',
        `Your group is waiting on your vote for ${eventTitle}`,
        { type: 'vote_reminder', planId }
      );

      if (success) sent++;
      else failed++;
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error in sendVoteReminderNotification:', error);
    return { sent, failed };
  }
}

/**
 * Send day-of reminder to confirmed participants
 */
export async function sendDayOfReminderNotification(planId: string): Promise<NotificationSummary> {
  let sent = 0;
  let failed = 0;

  try {
    // Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select(`
        title,
        planned_date,
        events (
          title,
          venues (
            name
          )
        )
      `)
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      console.error('Error fetching plan:', planError);
      return { sent, failed };
    }

    // Fetch confirmed participants
    const { data: participants, error: participantsError } = await supabase
      .from('plan_participants')
      .select(`
        user_id,
        profiles (
          push_token
        )
      `)
      .eq('plan_id', planId)
      .eq('status', 'confirmed');

    if (participantsError || !participants) {
      console.error('Error fetching participants:', participantsError);
      return { sent, failed };
    }

    const eventTitle = plan.events?.title || plan.title;
    const time = format(new Date(plan.planned_date), 'h:mm a');
    const venue = plan.events?.venues?.name;

    let body = `${eventTitle} starts at ${time}.`;
    if (venue) body += ` @ ${venue}.`;
    body += ' See you there!';

    // Send notification to each participant
    for (const participant of participants) {
      const pushToken = participant.profiles?.push_token;
      if (!pushToken) {
        failed++;
        continue;
      }

      const success = await sendPushNotification(
        pushToken,
        "Today's Plan",
        body,
        { type: 'day_of_reminder', planId }
      );

      if (success) sent++;
      else failed++;
    }

    return { sent, failed };
  } catch (error) {
    console.error('Error in sendDayOfReminderNotification:', error);
    return { sent, failed };
  }
}

/**
 * Handle notification tap/response
 */
export function handleNotificationResponse(
  response: Notifications.NotificationResponse,
  router: any // expo-router router instance
) {
  try {
    const data = response.notification.request.content.data as NotificationData;

    switch (data.type) {
      case 'plan_invite':
      case 'plan_confirmed':
      case 'vote_reminder':
      case 'day_of_reminder':
      case 'plan_completed':
        if (data.planId) {
          router.push(`/plan/${data.planId}`);
        }
        break;

      case 'check_in':
        if (data.planId) {
          router.push(`/plan/${data.planId}`);
        }
        break;

      default:
        console.log('Unknown notification type:', data.type);
    }
  } catch (error) {
    console.error('Error handling notification response:', error);
  }
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: NotificationData,
  seconds: number = 5
): Promise<string> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return '';
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
}

/**
 * Get notification permissions status
 */
export async function getNotificationPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return { status, canAskAgain: true, granted: status === 'granted', expires: 'never' };
  } catch (error) {
    console.error('Error getting notification permissions:', error);
    return { status: 'undetermined', canAskAgain: true, granted: false, expires: 'never' };
  }
}
