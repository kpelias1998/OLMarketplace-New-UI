import { useEffect, useRef, useState } from 'react'
import AccountLayout from '../components/AccountLayout'
import Spinner from '../components/Spinner'
import { uniLevelApi } from '../api'

/* ── Helpers ──────────────────────────────────────────────────── */
function getInitials(fullname, username) {
  if (fullname?.trim()) {
    const parts = fullname.trim().split(' ')
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  }
  return (username?.[0] ?? 'U').toUpperCase()
}

function countDescendants(node) {
  if (!node.children?.length) return 0
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

function getMaxDepth(node, level = 0) {
  if (!node.children?.length) return level
  return Math.max(...node.children.map((c) => getMaxDepth(c, level + 1)))
}

/* ── Avatar ───────────────────────────────────────────────────── */
function Avatar({ imageUrl, fullname, username }) {
  const [imgError, setImgError] = useState(false)
  const initials = getInitials(fullname, username)

  return (
    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden">
      {imageUrl && !imgError ? (
        <img
          src={imageUrl}
          alt={fullname || username}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initials
      )}
    </div>
  )
}

/* ── TreeNode ─────────────────────────────────────────────────── */
function TreeNode({ node, isRoot = false }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children?.length > 0
  const childCount = node.children?.length ?? 0
  const descendantCount = countDescendants(node)

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative flex flex-col items-center gap-1 bg-white border rounded-xl px-3 py-3 shadow-sm text-center ${
          isRoot
            ? 'border-primary ring-2 ring-primary/20 shadow-md'
            : 'border-primary/15 hover:border-primary/40 hover:shadow-md transition-shadow duration-200'
        }`}
        style={{ width: '148px' }}
      >
        <Avatar imageUrl={node.image_url} fullname={node.fullname} username={node.username} />
        <p className="text-xs font-extrabold text-slate-900 truncate w-full leading-tight mt-0.5">
          {node.fullname || node.username}
        </p>
        <p className="text-[10px] text-slate-400 truncate w-full">@{node.username}</p>

        {isRoot && (
          <span className="mt-0.5 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-widest rounded-full">
            You
          </span>
        )}

        {!isRoot && (
          <span className="mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-semibold rounded-full">
            {descendantCount} member{descendantCount !== 1 ? 's' : ''}
          </span>
        )}

        {/* Expand / collapse toggle */}
        {hasChildren && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shadow z-10 hover:bg-primary/90 transition-colors"
            title={expanded ? 'Collapse' : `Expand (${descendantCount} members)`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {expanded ? 'remove' : 'add'}
            </span>
          </button>
        )}
      </div>

      {/* Expanded children */}
      {hasChildren && expanded && (
        <>
          {/* Vertical stem from card to branch */}
          <div className="w-px bg-slate-200" style={{ height: '24px' }} />

          {/* Children row */}
          <div className="flex">
            {node.children.map((child, i) => {
              const isFirst = i === 0
              const isLast = i === childCount - 1
              const isSingle = childCount === 1

              return (
                <div
                  key={child.id}
                  className="flex flex-col items-center"
                  style={{ paddingLeft: '20px', paddingRight: '20px' }}
                >
                  {/* Connector: horizontal bar + vertical drop */}
                  <div className="relative w-full" style={{ height: '24px' }}>
                    {/* Vertical drop to child */}
                    <div
                      className="absolute w-px bg-slate-200"
                      style={{
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        height: '100%',
                      }}
                    />
                    {/* Horizontal bar connecting siblings */}
                    {!isSingle && (
                      <div
                        className="absolute h-px bg-slate-200"
                        style={{
                          top: 0,
                          left: isFirst ? '50%' : '0%',
                          right: isLast ? '50%' : '0%',
                        }}
                      />
                    )}
                  </div>

                  <TreeNode node={child} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Collapsed summary pill */}
      {hasChildren && !expanded && descendantCount > 0 && (
        <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full">
          +{descendantCount} hidden member{descendantCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function UniLevelTreePage() {
  const [tree, setTree] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const ZOOM_STEP = 0.1
  const ZOOM_MIN = 0.3
  const ZOOM_MAX = 2

  const zoomIn = () => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), ZOOM_MAX))
  const zoomOut = () => setZoom((z) => Math.max(+(z - ZOOM_STEP).toFixed(1), ZOOM_MIN))
  const zoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return
    isDragging.current = true
    setDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
  }

  const stopDrag = () => {
    isDragging.current = false
    setDragging(false)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await uniLevelApi.tree()
        setTree(res.data?.data || null)
      } catch {
        setError('Failed to load unilevel tree. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalMembers = tree ? countDescendants(tree) : 0
  const depth = tree ? getMaxDepth(tree) : 0

  return (
    <AccountLayout
      title="My Tree"
      subtitle="Your campaign rewards referral network."
    >
      {/* Stats row */}
      {!loading && !error && tree && (
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-3 bg-white border border-primary/10 rounded-xl px-5 py-4 shadow-sm">
            <span className="p-2 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Members</p>
              <p className="text-2xl font-extrabold text-slate-900">{totalMembers}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-primary/10 rounded-xl px-5 py-4 shadow-sm">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">account_tree</span>
            </span>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Depth</p>
              <p className="text-2xl font-extrabold text-slate-900">
                {depth} {depth === 1 ? 'Level' : 'Levels'}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      )}

      {!loading && !error && !tree && (
        <div className="py-20 text-center bg-white rounded-2xl border border-primary/10">
          <span className="material-symbols-outlined text-slate-300 block mb-3" style={{ fontSize: '64px' }}>
            account_tree
          </span>
          <p className="font-semibold text-slate-500">No unilevel tree data found.</p>
          <p className="text-sm text-slate-400 mt-1">Subscribe to a plan to start building your network.</p>
        </div>
      )}

      {!loading && !error && tree && (
        <div
          className="relative bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden p-8 select-none"
          style={{ minHeight: '420px', cursor: dragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          {/* Zoom controls */}
          <div className="sticky top-0 left-0 z-20 flex items-center gap-1 mb-4 w-fit">
            <button
              onClick={zoomOut}
              disabled={zoom <= ZOOM_MIN}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
              title="Zoom out"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
            </button>
            <button
              onClick={zoomReset}
              className="h-8 px-3 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm transition-colors min-w-[52px]"
              title="Reset zoom & pan"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoom >= ZOOM_MAX}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-colors"
              title="Zoom in"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            </button>
          </div>

          <div
            className="flex justify-center pb-4"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center top',
              transition: dragging ? 'none' : 'transform 0.15s ease',
            }}
          >
            <TreeNode node={tree} isRoot />
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
