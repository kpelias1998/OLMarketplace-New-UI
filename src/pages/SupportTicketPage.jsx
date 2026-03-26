import { useEffect, useMemo, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { supportApi } from '../api'
import { useAuth } from '../context/AuthContext'

const PRIORITY_OPTIONS = [
  { label: 'Low', value: 1 },
  { label: 'Medium', value: 2 },
  { label: 'High', value: 3 },
]

const PRIORITY_LABEL = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
}

const STATUS_LABEL = {
  0: { text: 'Open', className: 'bg-yellow-100 text-yellow-700' },
  1: { text: 'Answered', className: 'bg-blue-100 text-blue-700' },
  2: { text: 'Closed', className: 'bg-slate-200 text-slate-700' },
}

export default function SupportTicketPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const [form, setForm] = useState({
    name: [user?.firstname, user?.lastname].filter(Boolean).join(' '),
    email: user?.email || '',
    subject: '',
    message: '',
    priority: 2,
  })
  const [creating, setCreating] = useState(false)

  const [activeTicket, setActiveTicket] = useState(null)
  const [ticketDetails, setTicketDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [reply, setReply] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [closingTicket, setClosingTicket] = useState(false)

  const activeStatus = useMemo(
    () => (ticketDetails ? STATUS_LABEL[ticketDetails.status] || STATUS_LABEL[0] : null),
    [ticketDetails]
  )

  const loadTickets = async (targetPage = page) => {
    setListLoading(true)
    setListError('')
    try {
      const res = await supportApi.list(targetPage)
      const data = res.data?.data || res.data
      if (Array.isArray(data)) {
        setTickets(data)
        setLastPage(1)
      } else {
        setTickets(data?.data || [])
        setLastPage(data?.last_page || 1)
      }
    } catch {
      setListError('Failed to load support tickets.')
    } finally {
      setListLoading(false)
    }
  }

  const openTicket = async (ticket) => {
    setActiveTicket(ticket)
    setDetailsLoading(true)
    setDetailsError('')
    try {
      const res = await supportApi.view(ticket.ticket)
      setTicketDetails(res.data?.data || res.data)
    } catch {
      setDetailsError('Failed to load ticket details.')
    } finally {
      setDetailsLoading(false)
    }
  }

  useEffect(() => {
    loadTickets(page)
  }, [page])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await supportApi.create(form)
      setForm((prev) => ({ ...prev, subject: '', message: '', priority: 2 }))
      await loadTickets(1)
      setPage(1)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create ticket.')
    } finally {
      setCreating(false)
    }
  }

  const onReply = async (e) => {
    e.preventDefault()
    if (!ticketDetails?.id || !reply.trim()) return

    setSendingReply(true)
    try {
      await supportApi.reply(ticketDetails.id, { message: reply.trim() })
      setReply('')
      if (activeTicket) await openTicket(activeTicket)
      await loadTickets(page)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply.')
    } finally {
      setSendingReply(false)
    }
  }

  const onCloseTicket = async () => {
    if (!ticketDetails?.id) return
    setClosingTicket(true)
    try {
      await supportApi.close(ticketDetails.id)
      if (activeTicket) await openTicket(activeTicket)
      await loadTickets(page)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close ticket.')
    } finally {
      setClosingTicket(false)
    }
  }

  return (
    <AccountLayout title="Support Tickets" subtitle="Create tickets and talk with support from one place.">
      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <form onSubmit={onCreate} className="bg-white rounded-2xl border border-primary/10 p-5 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Create Ticket</h2>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</span>
              <input
                name="subject"
                value={form.subject}
                onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                required
                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</span>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value) }))}
                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</span>
              <textarea
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={4}
                required
                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={creating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 font-bold hover:bg-primary/90 disabled:opacity-60"
            >
              {creating && <Spinner size="sm" />}
              Submit Ticket
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-primary/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-slate-900">My Tickets</h2>
              {lastPage > 1 && (
                <span className="text-xs text-slate-500 font-semibold">{page}/{lastPage}</span>
              )}
            </div>

            {listLoading ? (
              <div className="py-10 flex justify-center"><Spinner size="md" /></div>
            ) : listError ? (
              <p className="text-sm text-red-600">{listError}</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-slate-500">No tickets yet.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket) => {
                  const status = STATUS_LABEL[ticket.status] || STATUS_LABEL[0]
                  const active = activeTicket?.id === ticket.id
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => openTicket(ticket)}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${
                        active ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary/40'
                      }`}
                    >
                      <p className="text-sm font-bold text-slate-900 truncate">#{ticket.ticket} {ticket.subject}</p>
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${status.className}`}>
                          {status.text}
                        </span>
                        <span className="text-slate-500">{PRIORITY_LABEL[ticket.priority] || 'Low'}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {!listLoading && lastPage > 1 && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page === lastPage}
                  className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-primary/10 p-6">
          {!activeTicket ? (
            <div className="h-full min-h-80 flex flex-col items-center justify-center text-center text-slate-500">
              <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">forum</span>
              <p className="font-semibold">Select a ticket to view conversation.</p>
            </div>
          ) : detailsLoading ? (
            <div className="h-full min-h-80 flex items-center justify-center"><Spinner size="lg" /></div>
          ) : detailsError ? (
            <p className="text-red-600 text-sm">{detailsError}</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    #{ticketDetails.ticket} {ticketDetails.subject}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Priority: {PRIORITY_LABEL[ticketDetails.priority] || 'Low'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activeStatus?.className}`}>
                    {activeStatus?.text}
                  </span>
                  {ticketDetails.status !== 2 && (
                    <button
                      type="button"
                      disabled={closingTicket}
                      onClick={onCloseTicket}
                      className="rounded-lg border border-red-200 text-red-600 px-3 py-1.5 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                    >
                      {closingTicket ? 'Closing...' : 'Close Ticket'}
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                {(ticketDetails.messages || []).length === 0 ? (
                  <p className="text-sm text-slate-500">No messages yet.</p>
                ) : (
                  (ticketDetails.messages || []).map((msg) => {
                    const fromAdmin = msg.admin_id !== null && msg.admin_id !== undefined
                    return (
                      <div
                        key={msg.id}
                        className={`max-w-[90%] rounded-xl px-4 py-3 text-sm ${
                          fromAdmin
                            ? 'bg-blue-50 border border-blue-100 text-slate-800 mr-auto'
                            : 'bg-primary/10 border border-primary/20 text-slate-900 ml-auto'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {fromAdmin ? 'Support' : 'You'}
                          {msg.created_at ? ` • ${new Date(msg.created_at).toLocaleString()}` : ''}
                        </p>
                      </div>
                    )
                  })
                )}
              </div>

              {ticketDetails.status === 2 ? (
                <div className="rounded-xl bg-slate-100 text-slate-600 text-sm font-medium px-4 py-3">
                  This ticket is closed and cannot receive replies.
                </div>
              ) : (
                <form onSubmit={onReply} className="space-y-3">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={3}
                    placeholder="Write your reply..."
                    className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !reply.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-5 py-2.5 font-bold hover:bg-primary/90 disabled:opacity-60"
                  >
                    {sendingReply && <Spinner size="sm" />}
                    Send Reply
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  )
}
