import * as Notifications from 'expo-notifications';
import { getBookReminders } from './db';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

// Schedule a notification for a specific reminder
export const scheduleReadingReminder = async (
  reminderId: string,
  bookTitle: string,
  time: string,
  daysOfWeek: number[]
) => {
  try {
    // Cancel any existing notification with this ID
    await Notifications.cancelScheduledNotificationAsync(reminderId);

    // Parse the time string (format: "HH:mm")
    const [hours, minutes] = time.split(':').map(Number);

    // Schedule notifications for each selected day
    for (const day of daysOfWeek) {
      const now = new Date();
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, schedule for next week
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 7);
      }

      // Adjust the day of the week
      const currentDay = scheduledTime.getDay();
      const daysToAdd = (day - currentDay + 7) % 7;
      scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);

      // Schedule the notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora de Ler! 📚',
          body: `Não se esqueça de ler "${bookTitle}" hoje!`,
          data: { reminderId, bookTitle },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          weekday: day + 1, // Expo uses 1-7 for weekdays (Sunday is 1)
          repeats: true,
        } as Notifications.NotificationTriggerInput,
        identifier: `${reminderId}_${day}`,
      });
    }

    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// Cancel all notifications for a specific reminder
export const cancelReadingReminder = async (reminderId: string) => {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Cancel notifications that match the reminder ID
    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(reminderId)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    return true;
  } catch (error) {
    console.error('Error canceling notification:', error);
    return false;
  }
};

// Reschedule all reminders (useful when app starts)
export const rescheduleAllReminders = async () => {
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Get all reminders from the database
    getBookReminders('all', async (error, reminders) => {
      if (error || !reminders) {
        console.error('Error getting reminders:', error);
        return;
      }

      // Schedule each reminder
      for (const reminder of reminders) {
        if (reminder.isEnabled) {
          const daysOfWeek = JSON.parse(reminder.daysOfWeek);
          await scheduleReadingReminder(
            reminder.id,
            reminder.bookTitle,
            reminder.time,
            daysOfWeek
          );
        }
      }
    });
  } catch (error) {
    console.error('Error rescheduling reminders:', error);
  }
}; 