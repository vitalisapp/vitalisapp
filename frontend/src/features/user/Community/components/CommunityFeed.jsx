import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ErrorState from '../../../../components/feedback/ErrorState.jsx';
import LoadingState from '../../../../components/feedback/LoadingState.jsx';
import Button from '../../../../components/ui/Button.jsx';
import Modal from '../../../../components/ui/Modal.jsx';
import { useAuth } from '../../../../hooks/useAuth.jsx';
import { apiGet, apiPost, apiDelete } from '../../../../lib/apiClient.js';
import { resolveAvatar } from '../../../../lib/avatar.js';
import { useToastStore } from '../../../../stores/toastStore.js';
import '../community-feed.css';

const TAGS = ['General', 'Training', 'Nutrition', 'Recovery'];
const PAGE_SIZE = 20;
const MAX_POST = 1000;
const CAPTION_PREVIEW = 320; // chars shown before "See more" (display only)

const TAG_ICONS = {
  General: 'groups',
  Training: 'fitness_center',
  Nutrition: 'restaurant',
  Recovery: 'bedtime',
};

// Feed views over the loaded posts — all backed by real post fields.
const SCOPES = [
  { key: 'all', label: 'All posts', icon: 'dynamic_feed' },
  { key: 'mine', label: 'My posts', icon: 'person' },
  { key: 'liked', label: 'Liked by me', icon: 'favorite' },
];

// #hashtags render in the accent colour; the rest is plain text.
const renderRichText = (text) => String(text || '').split(/(#[\w-]+)/g).map((part, i) =>
  /^#[\w-]+$/.test(part)
    ? <span key={i} className="vcom-hashtag">{part}</span>
    : <span key={i}>{part}</span>
);

const timeAgo = (value) => {
  if (!value) return '';
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(t).toLocaleDateString();
};

// Cut long captions at a word boundary for the collapsed view.
const previewText = (text) => {
  const s = String(text || '');
  if (s.length <= CAPTION_PREVIEW) return s;
  const cut = s.slice(0, CAPTION_PREVIEW);
  const space = cut.lastIndexOf(' ');
  return `${(space > CAPTION_PREVIEW * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
};

const Avatar = ({ name, src = null, size = 44 }) => {
  const [broken, setBroken] = useState(false);
  const a = resolveAvatar(src, name);
  const dims = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  if (a.kind === 'image' && !broken) {
    return (
      <span className="vcom-avatar" style={dims}>
        <img src={a.src} alt="" loading="lazy" onError={() => setBroken(true)} />
      </span>
    );
  }
  return (
    <span className="vcom-avatar" style={{ ...dims, background: a.surface.background, color: a.surface.color }} aria-hidden="true">
      {a.initials}
    </span>
  );
};

const PostSkeleton = () => (
  <div className="vcom-feed" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <div key={i} className="vcom-post" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="vcom-skel" style={{ width: 44, height: 44, borderRadius: 999 }} />
          <span style={{ flex: 1, display: 'grid', gap: 8 }}>
            <span className="vcom-skel" style={{ height: 12, width: '38%' }} />
            <span className="vcom-skel" style={{ height: 10, width: '24%' }} />
          </span>
        </div>
        <span className="vcom-skel" style={{ display: 'block', height: 12, marginTop: 18 }} />
        <span className="vcom-skel" style={{ display: 'block', height: 12, marginTop: 8, width: i === 1 ? '55%' : '80%' }} />
        <span className="vcom-skel" style={{ display: 'block', height: 38, marginTop: 20 }} />
      </div>
    ))}
  </div>
);

// Community Feed — real backend (GET/POST /api/community, likes, comments).
// Rendered by the Community hub's "Feed" tab; `header` is the hub's page
// header (title + Feed | Messages switch).
const CommunityFeed = ({ header = null }) => {
  const { user, loading } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [draft, setDraft] = useState('');
  const [tag, setTag] = useState('General');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [liking, setLiking] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentsCache, setCommentsCache] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});
  const [deletingPost, setDeletingPost] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [menuFor, setMenuFor] = useState(null);
  // Client-side views over loaded posts.
  const [scope, setScope] = useState('all');
  const [feedFilter, setFeedFilter] = useState('All');
  const draftRef = useRef(null);

  const myId = Number(user?.id);
  const isMine = useCallback((p) => Number(p.user_id) === myId, [myId]);

  const scopeCounts = useMemo(() => ({
    all: posts.length,
    mine: posts.filter(isMine).length,
    liked: posts.filter((p) => p.liked_by_me).length,
  }), [posts, isMine]);

  const scopedPosts = useMemo(() => {
    if (scope === 'mine') return posts.filter(isMine);
    if (scope === 'liked') return posts.filter((p) => p.liked_by_me);
    return posts;
  }, [posts, scope, isMine]);

  const tagCounts = useMemo(() => {
    const m = { All: scopedPosts.length };
    for (const t of TAGS) m[t] = 0;
    for (const p of scopedPosts) m[p.tag] = (m[p.tag] || 0) + 1;
    return m;
  }, [scopedPosts]);

  const visiblePosts = feedFilter === 'All' ? scopedPosts : scopedPosts.filter((p) => p.tag === feedFilter);

  // Right-panel numbers: total comes from the API; the rest from loaded posts.
  const overview = useMemo(() => {
    const mine = posts.filter(isMine);
    const topicCounts = TAGS.map((t) => ({ tag: t, count: posts.filter((p) => p.tag === t).length }))
      .sort((a, b) => b.count - a.count);
    return {
      myPosts: mine.length,
      likesReceived: mine.reduce((sum, p) => sum + (Number(p.likes) || 0), 0),
      topics: topicCounts,
    };
  }, [posts, isMine]);

  // Grow the composer with its content (CSS caps the height).
  useEffect(() => {
    const el = draftRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [draft]);

  // Close the post menu on outside click / Escape.
  useEffect(() => {
    if (menuFor == null) return undefined;
    const onPointer = (e) => {
      if (!e.target.closest?.('[data-post-menu]')) setMenuFor(null);
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuFor(null); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuFor]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setPageLoading(true);
    setPageError('');
    try {
      const data = await apiGet(`/api/community?limit=${PAGE_SIZE}`);
      const list = Array.isArray(data.posts) ? data.posts : [];
      setPosts(list);
      setTotal(Number(data.total) || list.length);
    } catch (err) {
      setPageError(err.message || 'Could not load the community feed.');
    } finally {
      setPageLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loading && user?.id) load();
    if (!loading && !user?.id) setPageLoading(false);
  }, [loading, user?.id, load]);

  // Next page via the API's existing offset pagination. Dedupe by id in case
  // the feed shifted (new posts) between requests.
  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiGet(`/api/community?limit=${PAGE_SIZE}&offset=${posts.length}`);
      const next = Array.isArray(data.posts) ? data.posts : [];
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...next.filter((p) => !seen.has(p.id))];
      });
      if (data.total != null) setTotal(Number(data.total));
    } catch (err) {
      addToast(err.message || 'Could not load more posts.', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const publish = async (e) => {
    e.preventDefault();
    if (!draft.trim() || publishing) return;
    setPublishing(true);
    try {
      const data = await apiPost('/api/community', { text: draft.trim(), tag });
      setPosts((p) => [data.post, ...p]);
      setTotal((t) => t + 1);
      setDraft('');
      // Jump back to the full feed so the new post is visible immediately.
      setFeedFilter('All');
      setScope((s) => (s === 'liked' ? 'all' : s));
      addToast('Posted to the community feed.', 'success');
    } catch (err) {
      addToast(err.message || 'Could not publish your post.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const toggleLike = async (post) => {
    if (liking[post.id]) return;
    setLiking((m) => ({ ...m, [post.id]: true }));
    try {
      if (post.liked_by_me) {
        const data = await apiDelete(`/api/community/${post.id}/like`);
        setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, liked_by_me: false, likes: data.likes } : p)));
      } else {
        const data = await apiPost(`/api/community/${post.id}/like`, {});
        setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, liked_by_me: true, likes: data.likes } : p)));
      }
    } catch (err) {
      addToast(err.message || 'Could not update like.', 'error');
    } finally {
      setLiking((m) => ({ ...m, [post.id]: false }));
    }
  };

  const toggleComments = async (post) => {
    const open = !openComments[post.id];
    setOpenComments((m) => ({ ...m, [post.id]: open }));
    if (open && !commentsCache[post.id]) {
      setLoadingComments((m) => ({ ...m, [post.id]: true }));
      try {
        const data = await apiGet(`/api/community/${post.id}/comments?limit=30`);
        setCommentsCache((m) => ({ ...m, [post.id]: data.comments || [] }));
      } catch (err) {
        addToast(err.message || 'Could not load comments.', 'error');
      } finally {
        setLoadingComments((m) => ({ ...m, [post.id]: false }));
      }
    }
  };

  const submitComment = async (post) => {
    const text = (commentDrafts[post.id] || '').trim();
    if (!text || submittingComment[post.id]) return;
    setSubmittingComment((m) => ({ ...m, [post.id]: true }));
    try {
      const data = await apiPost(`/api/community/${post.id}/comments`, { text });
      setCommentsCache((m) => ({ ...m, [post.id]: [...(m[post.id] || []), data.comment] }));
      setPosts((ps) => ps.map((p) => (p.id === post.id ? { ...p, comments: Number(p.comments) + 1 } : p)));
      setCommentDrafts((m) => ({ ...m, [post.id]: '' }));
    } catch (err) {
      addToast(err.message || 'Could not add comment.', 'error');
    } finally {
      setSubmittingComment((m) => ({ ...m, [post.id]: false }));
    }
  };

  const removePost = async () => {
    const post = pendingDelete;
    if (!post || deletingPost[post.id]) return;
    setDeletingPost((m) => ({ ...m, [post.id]: true }));
    try {
      await apiDelete(`/api/community/${post.id}`);
      setPosts((ps) => ps.filter((p) => p.id !== post.id));
      setTotal((t) => Math.max(0, t - 1));
      addToast('Post deleted.', 'success');
      setPendingDelete(null);
    } catch (err) {
      addToast(err.message || 'Could not delete post.', 'error');
    } finally {
      setDeletingPost((m) => ({ ...m, [post.id]: false }));
    }
  };

  const pickTopic = (t) => setFeedFilter((cur) => (cur === t ? 'All' : t));
  const focusComposer = () => draftRef.current?.focus();

  const initialLoading = loading || (pageLoading && posts.length === 0 && !pageError);
  const draftLen = draft.trim().length;
  const hasMore = posts.length < total;

  const scopeButtons = (className) => SCOPES.map((s) => (
    <button key={s.key} type="button" className={className} aria-pressed={scope === s.key} onClick={() => setScope(s.key)}>
      <span className="material-symbols-outlined" aria-hidden="true">{s.icon}</span>
      {s.label}
      <span className="vcom-count">{scopeCounts[s.key]}</span>
    </button>
  ));

  const emptyCopy = (() => {
    if (posts.length === 0) return { title: 'No posts yet', sub: 'Be the first to share your fitness journey.', cta: true };
    if (scope === 'mine' && scopedPosts.length === 0) return { title: 'You haven’t posted yet', sub: 'Share a workout, meal, or recovery win.', cta: true };
    if (scope === 'liked' && scopedPosts.length === 0) return { title: 'No liked posts yet', sub: 'Posts you like will show up here.', cta: false };
    return { title: `No ${feedFilter} posts`, sub: 'Try another topic or be the first to post about it.', cta: true };
  })();

  return (
    <div className="vcom pb-6">
      {header}

      <div className="vcom-grid">
        {/* ── Left: feed views ── */}
        <aside className="vcom-left" aria-label="Feed views">
          <nav className="vcom-panel vcom-nav">
            <p className="vcom-panel-title">Feed</p>
            {scopeButtons('vcom-nav-item')}
          </nav>
        </aside>

        {/* ── Main feed ── */}
        <section className="vcom-main" aria-label="Community feed">
          <form onSubmit={publish} className="vcom-composer">
            <div className="vcom-composer-row">
              <Avatar name={user?.name} src={user?.avatar} size={42} />
              <textarea
                ref={draftRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share your fitness journey…"
                aria-label="Write a community post"
                maxLength={MAX_POST}
                rows={1}
              />
            </div>
            <div className="vcom-composer-foot">
              <div className="vcom-filters" role="group" aria-label="Post topic">
                {TAGS.map((t) => (
                  <button key={t} type="button" className="vcom-filter" onClick={() => setTag(t)} aria-pressed={tag === t}>
                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>{TAG_ICONS[t]}</span>
                    {t}
                  </button>
                ))}
              </div>
              <div className="vcom-composer-actions">
                <span className={`vcom-chars${draftLen > MAX_POST * 0.9 ? ' is-near' : ''}`} aria-live="polite">{draftLen}/{MAX_POST}</span>
                <button type="submit" className="vcom-btn" disabled={publishing || !draft.trim()}>
                  {publishing ? <span className="vcom-spin" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">send</span>}
                  {publishing ? 'Posting…' : 'Create Post'}
                </button>
              </div>
            </div>
          </form>

          {/* Compact views row — replaces the left panel on narrow layouts. */}
          <div className="vcom-filters vcom-scopes-inline" role="group" aria-label="Feed views" style={{ marginTop: 16 }}>
            {scopeButtons('vcom-filter')}
          </div>

          {!pageError && posts.length > 0 && (
            <div className="vcom-filters" role="group" aria-label="Filter feed by topic" style={{ marginTop: 12 }}>
              {['All', ...TAGS].map((t) => (
                <button key={t} type="button" className="vcom-filter" onClick={() => setFeedFilter(t)} aria-pressed={feedFilter === t}>
                  {t}
                  <span className="vcom-count">{tagCounts[t] ?? 0}</span>
                </button>
              ))}
            </div>
          )}

          {pageError && (
            <div style={{ marginTop: 16 }}><ErrorState message={pageError} onRetry={load} /></div>
          )}

          {initialLoading ? (
            <>
              <PostSkeleton />
              <span className="sr-only"><LoadingState message="Loading community feed…" /></span>
            </>
          ) : !pageError && visiblePosts.length === 0 ? (
            <div className="vcom-empty">
              <div className="vcom-empty-icon"><span className="material-symbols-outlined" aria-hidden="true">{posts.length === 0 ? 'diversity_3' : 'filter_list_off'}</span></div>
              <h3>{emptyCopy.title}</h3>
              <p>{emptyCopy.sub}</p>
              {emptyCopy.cta && (
                <button type="button" className="vcom-btn" onClick={focusComposer}>
                  <span className="material-symbols-outlined" aria-hidden="true">edit</span>
                  Write a post
                </button>
              )}
            </div>
          ) : (
            <div className="vcom-feed">
              {visiblePosts.map((p) => {
                const mine = isMine(p);
                const long = String(p.text || '').length > CAPTION_PREVIEW;
                const isOpen = !!expanded[p.id];
                const likes = Number(p.likes) || 0;
                const comments = Number(p.comments) || 0;
                return (
                  <article key={p.id} className="vcom-post" aria-labelledby={`post-${p.id}-author`}>
                    <header className="vcom-post-head">
                      <Avatar name={p.author_name} src={mine ? user?.avatar : null} size={44} />
                      <div className="vcom-post-author">
                        <p id={`post-${p.id}-author`} className="vcom-post-name">
                          {p.author_name}
                          {mine && <span className="vcom-you"> · You</span>}
                        </p>
                        <p className="vcom-post-meta">
                          <time dateTime={p.created_at || undefined} title={p.created_at ? new Date(p.created_at).toLocaleString() : undefined}>
                            {timeAgo(p.created_at) || 'just now'}
                          </time>
                          <span aria-hidden="true">·</span>
                          <span className="vcom-tag">
                            <span className="material-symbols-outlined" aria-hidden="true">{TAG_ICONS[p.tag] || TAG_ICONS.General}</span>
                            {p.tag}
                          </span>
                        </p>
                      </div>
                      {mine && (
                        <div className="vcom-menu-wrap" data-post-menu>
                          <button
                            type="button"
                            className="vcom-icon-btn"
                            aria-label="Post options"
                            aria-haspopup="menu"
                            aria-expanded={menuFor === p.id}
                            onClick={() => setMenuFor((cur) => (cur === p.id ? null : p.id))}
                          >
                            {deletingPost[p.id]
                              ? <span className="vcom-spin" aria-hidden="true" />
                              : <span className="material-symbols-outlined" aria-hidden="true">more_horiz</span>}
                          </button>
                          {menuFor === p.id && (
                            <div className="vcom-menu" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                autoFocus
                                className="vcom-menu-item is-danger"
                                disabled={!!deletingPost[p.id]}
                                onClick={() => { setMenuFor(null); setPendingDelete(p); }}
                              >
                                <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                                Delete post
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </header>

                    <p className="vcom-caption">{renderRichText(long && !isOpen ? previewText(p.text) : p.text)}</p>
                    {long && (
                      <button type="button" className="vcom-more" aria-expanded={isOpen}
                        onClick={() => setExpanded((m) => ({ ...m, [p.id]: !isOpen }))}>
                        {isOpen ? 'See less' : 'See more'}
                      </button>
                    )}

                    <div className="vcom-summary">
                      <span className="vcom-summary-likes">
                        {likes > 0 && (
                          <span className="vcom-summary-heart" aria-hidden="true">
                            <span className="material-symbols-outlined">favorite</span>
                          </span>
                        )}
                        {likes === 0 ? 'No likes yet' : `${likes} ${likes === 1 ? 'like' : 'likes'}`}
                      </span>
                      {comments > 0 ? (
                        <button type="button" className="vcom-summary-link" onClick={() => toggleComments(p)}>
                          {comments} {comments === 1 ? 'comment' : 'comments'}
                        </button>
                      ) : <span>No comments</span>}
                    </div>

                    <div className="vcom-actions">
                      <button
                        type="button"
                        onClick={() => toggleLike(p)}
                        disabled={!!liking[p.id]}
                        aria-pressed={!!p.liked_by_me}
                        aria-label={p.liked_by_me ? 'Unlike post' : 'Like post'}
                        className={`vcom-action${p.liked_by_me ? ' is-liked' : ''}`}
                      >
                        {liking[p.id] ? <span className="vcom-spin" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">favorite</span>}
                        {p.liked_by_me ? 'Liked' : 'Like'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleComments(p)}
                        aria-expanded={!!openComments[p.id]}
                        aria-controls={`post-${p.id}-comments`}
                        className="vcom-action"
                      >
                        {loadingComments[p.id] ? <span className="vcom-spin" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">chat_bubble</span>}
                        Comment
                      </button>
                    </div>

                    {openComments[p.id] && (
                      <section id={`post-${p.id}-comments`} className="vcom-comments" aria-label="Comments">
                        {loadingComments[p.id] ? (
                          <p className="vcom-comment-empty">Loading comments…</p>
                        ) : (commentsCache[p.id] || []).length === 0 ? (
                          <p className="vcom-comment-empty">No comments yet. Start the conversation.</p>
                        ) : (
                          (commentsCache[p.id] || []).map((c) => (
                            <div key={c.id} className="vcom-comment">
                              <Avatar name={c.author_name} src={Number(c.user_id) === myId ? user?.avatar : null} size={30} />
                              <div className="vcom-comment-bubble">
                                <div className="vcom-comment-top">
                                  <span className="vcom-comment-name">{c.author_name}</span>
                                  {c.created_at && <span className="vcom-comment-time">{timeAgo(c.created_at)}</span>}
                                </div>
                                <p className="vcom-comment-text">{c.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                        <div className="vcom-reply">
                          <Avatar name={user?.name} src={user?.avatar} size={30} />
                          <div className="vcom-reply-field">
                            <input
                              value={commentDrafts[p.id] || ''}
                              aria-label="Write a comment"
                              maxLength={500}
                              onChange={(e) => setCommentDrafts((m) => ({ ...m, [p.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitComment(p); } }}
                              disabled={!!submittingComment[p.id]}
                              placeholder={submittingComment[p.id] ? 'Sending…' : 'Write a comment…'}
                            />
                            <button
                              type="button"
                              className="vcom-send"
                              aria-label="Post comment"
                              onClick={() => submitComment(p)}
                              disabled={!((commentDrafts[p.id] || '').trim()) || !!submittingComment[p.id]}
                            >
                              {submittingComment[p.id] ? <span className="vcom-spin" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">send</span>}
                            </button>
                          </div>
                        </div>
                      </section>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {!initialLoading && !pageError && posts.length > 0 && (
            hasMore ? (
              <div className="vcom-load-more">
                <button type="button" className="vcom-btn vcom-btn--ghost" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <span className="vcom-spin" aria-hidden="true" /> : <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>}
                  {loadingMore ? 'Loading…' : 'Load more posts'}
                </button>
                <span className="vcom-count">Showing {posts.length} of {total}</span>
              </div>
            ) : (
              <p className="vcom-end">You’re all caught up.</p>
            )
          )}
        </section>

        {/* ── Right: overview + topics ── */}
        <aside className="vcom-right" aria-label="Community overview">
          <section className="vcom-panel">
            <h2 className="vcom-panel-title">Community overview</h2>
            <div className="vcom-stats">
              <div className="vcom-stat">
                <span className="vcom-stat-value">{total}</span>
                <span className="vcom-stat-label">Total posts</span>
              </div>
              <div className="vcom-stat">
                <span className="vcom-stat-value">{overview.myPosts}</span>
                <span className="vcom-stat-label">Your posts</span>
              </div>
              <div className="vcom-stat" style={{ gridColumn: '1 / -1' }}>
                <span className="vcom-stat-value">{overview.likesReceived}</span>
                <span className="vcom-stat-label">Likes on your posts</span>
              </div>
            </div>
            {hasMore && <p className="vcom-panel-note">Your stats cover the {posts.length} most recent posts loaded.</p>}
          </section>

          <section className="vcom-panel">
            <h2 className="vcom-panel-title">Trending topics</h2>
            <div className="vcom-topics" role="group" aria-label="Filter by topic">
              {overview.topics.map(({ tag: t, count }) => (
                <button key={t} type="button" className="vcom-topic" aria-pressed={feedFilter === t} onClick={() => pickTopic(t)}>
                  <span className="vcom-topic-icon"><span className="material-symbols-outlined" aria-hidden="true">{TAG_ICONS[t]}</span></span>
                  {t}
                  <span className="vcom-count">{count}</span>
                </button>
              ))}
            </div>
            <p className="vcom-panel-note">Based on recent posts. Tap a topic to filter the feed.</p>
          </section>
        </aside>
      </div>

      <Modal
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Delete post?"
        subtitle="This cannot be undone."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button variant="danger" loading={pendingDelete ? !!deletingPost[pendingDelete.id] : false} onClick={removePost}>Delete</Button>
          </div>
        }
      >
        <p className="text-[length:var(--fs-13)] text-[var(--text-muted)]">Delete this post permanently?</p>
      </Modal>
    </div>
  );
};

export default CommunityFeed;
