import * as bootstrap from "bootstrap";
import { Notification } from "../models/NotificationModel";
import { BehaviorSubject, Observable, map } from "rxjs";

export class NotificationService {
    readonly notifications = new BehaviorSubject<Notification[]>([])

    send(notification: Notification) {
        const notifications = this.notifications.value
        this.notifications.next([...notifications, notification])
        this.handleNotificationDisplay(notification);
    }

    list(): Observable<Notification[]> {
        return this.notifications.asObservable()
    }

    unreadCount(): Observable<number> {
        return this.notifications.pipe(map(notifs => notifs.filter(notif => !notif.read).length))
    }

    markAsRead(notification: Notification) {
        const notifications = this.notifications.value
        const index = notifications.indexOf(notification)
        if (index !== -1) {
            notifications[index].read = true
            this.notifications.next(notifications)
        }
    }

    handleNotificationDisplay(notification: Notification) {
        // Check if the notification priority is medium or high
        if (notification.priority === 'medium' || notification.priority === 'high') {
            this.showNotificationModal(notification);
        }
    }
    
    showNotificationModal(notification: Notification) {
        const modalBody = document.getElementById('notificationModalBody');
        const modalTitle = document.getElementById('notificationModalLabel');
        const modalElement = document.getElementById('notificationModal');

        if (modalBody && modalTitle && modalElement) {
            modalTitle.textContent = `New Notification - ${notification.priority.toUpperCase()}`;
            modalBody.textContent = `${notification.title}: ${notification.message}`;
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }
}