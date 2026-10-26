import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "./ui/popover";
import { Button } from "./ui/button";
import {
  RiFileLine,
  RiNotification2Line,
  RiWallet3Line,
  RiUserAddLine,
  RiFolderLine,
  RiShieldCheckLine,
  RiCheckDoubleLine,
} from "@remixicon/react";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useNotificationUnreadCount,
} from "@/hooks/features/use-notifications";
import { AppEmpty } from "@/components/app-empty";
import { RiInformationLine } from "@remixicon/react";
import type { Notification } from "@/types/notification";
import { formatRelativeTime } from "@/lib/formatter";

export function Notifications() {
  const { data, isLoading } = useNotifications();
  const { data: unreadCountData } = useNotificationUnreadCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const notifications = data?.data ?? [];
  const unreadCount = unreadCountData ?? 0;

  return (
    <Popover>
      <PopoverTrigger
        className="relative"
        render={<Button variant="outline" size="icon" />}
      >
        <RiNotification2Line />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-lc-stamp text-[10px] font-medium text-lc-paper ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-87.5 p-0">
        <PopoverHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <PopoverTitle className="flex items-baseline gap-2">
            <span className="font-newsreader text-base font-medium">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="font-plexmono text-[10.5px] text-primary">
                {unreadCount} unread
              </span>
            )}
          </PopoverTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-[12.5px] text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <RiCheckDoubleLine className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </PopoverHeader>

        <div className="max-h-90 overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <div className="space-y-1 p-1">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          ) : notifications.length ? (
            <div className="flex flex-col gap-0.5">
              {notifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => {
                    if (!notification.read) markAsRead.mutate(notification.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="py-8">
              <AppEmpty
                title="No notifications available"
                icon={<RiNotification2Line />}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getNotificationIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("document")) return <RiFileLine className="h-4 w-4" />;
  if (t.includes("invite") || t.includes("team") || t.includes("user"))
    return <RiUserAddLine className="h-4 w-4" />;
  if (
    t.includes("trust") ||
    t.includes("billing") ||
    t.includes("invoice") ||
    t.includes("payment")
  )
    return <RiWallet3Line className="h-4 w-4" />;
  if (t.includes("case") || t.includes("matter"))
    return <RiFolderLine className="h-4 w-4" />;
  if (t.includes("audit") || t.includes("security") || t.includes("mfa"))
    return <RiShieldCheckLine className="h-4 w-4" />;
  return <RiInformationLine className="h-4 w-4" />;
}

function NotificationItem({
  notification,
  onClick,
}: {
  notification: Notification;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-[3px] px-2.5 py-2.5 text-left transition-colors hover:bg-accent/50 ${
        !notification.read ? "bg-primary/5" : ""
      }`}
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-lc-paper-warm text-lc-slate">
        {getNotificationIcon(notification.type)}
        {!notification.read && (
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-lc-stamp ring-2 ring-lc-paper" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-snug ${
              !notification.read
                ? "font-semibold text-foreground"
                : "font-medium text-foreground/75"
            }`}
          >
            {notification.title || "Notification"}
          </p>
          <span className="shrink-0 whitespace-nowrap font-plexmono text-[10px] text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        {notification.body ? (
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">
            {notification.body}
          </p>
        ) : null}
      </div>
    </button>
  );
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-2.5 py-2.5">
      <div className="h-8 w-8 shrink-0 rounded-full bg-muted" />
      <div className="flex-1 space-y-1.5 pt-0.5">
        <div className="h-3 w-32 rounded bg-muted" />
        <div className="h-2.5 w-48 rounded bg-muted" />
      </div>
    </div>
  );
}
