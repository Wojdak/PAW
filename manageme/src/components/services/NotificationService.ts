import { Notification } from "../models/NotificationModel";
import { BehaviorSubject, Observable, map } from "rxjs";

export class NotificationService {
    readonly notifications = new BehaviorSubject<Notification[]>([])

    send(notification: Notification) {
        const notifications = this.notifications.value
        this.notifications.next([...notifications, notification])
    }

    list(): Observable<Notification[]> {
        return this.notifications.asObservable()
    }

    unreadCount(): Observable<number> {
        return this.notifications.pipe(map(notifs => notifs.length))
    }
}