'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { useAuthStore } from '@/stores/auth-store'
import { useDataStore } from '@/stores/data-store'
import { formatDateTime } from '@/lib/utils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { user } = useAuthStore()
  const { notifications, markNotificationRead, addNotification } = useDataStore()

  const userNotifs = notifications.filter((n) => n.userId === user?.id)
  const unreadCount = userNotifs.filter((n) => !n.leida).length
  const recent = userNotifs.slice(0, 5)

  function markAllRead() {
    userNotifs.filter((n) => !n.leida).forEach((n) => markNotificationRead(n.id))
  }

  // suppress unused warning for addNotification (it's in the interface but not used here)
  void addNotification

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative p-2 text-[#A0A0A0] hover:text-white transition-colors">
          <Bell size={18} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-medium text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 bg-[#111] border border-[#2A2A2A] shadow-2xl outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2A2A] px-4 py-3">
            <p className="text-[10px] tracking-[0.2em] uppercase text-white font-medium">
              Notificaciones
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[9px] tracking-[0.15em] uppercase text-[#555] hover:text-white transition-colors"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-[#555]">Sin notificaciones</p>
            ) : (
              recent.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className="w-full text-left px-4 py-3 border-b border-[#1A1A1A] hover:bg-[#1A1A1A] transition-colors flex gap-3"
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`block h-1.5 w-1.5 rounded-full ${
                        notif.leida ? 'bg-transparent' : 'bg-white'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium truncate">{notif.titulo}</p>
                    <p className="text-[10px] text-[#A0A0A0] leading-relaxed line-clamp-2 mt-0.5">
                      {notif.mensaje}
                    </p>
                    <p className="text-[9px] text-[#555] mt-1 tracking-wide">
                      {formatDateTime(notif.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {unreadCount > 0 && (
            <div className="border-t border-[#2A2A2A] px-4 py-3">
              <button
                onClick={() => { markAllRead(); setOpen(false) }}
                className="w-full text-[9px] tracking-[0.2em] uppercase text-[#555] hover:text-white transition-colors text-center"
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
