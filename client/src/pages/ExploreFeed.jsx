import { useEffect, useRef, useState, useCallback } from "react";
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import axios from "axios";

import IdeaCard from "../../components/explore/IdeaCard";

const ENDPOINT = `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/explore`;
const MINT = "#59e3a7";
const SLATE = "#1b2e35";

/**
 * ExploreFeed — Public page, no auth required.
 *
 * Cursor-based infinite scroll:
 *  1. On mount, fetches page 1 (no cursor).
 *  2. An IntersectionObserver watches a sentinel <div> at the bottom.
 *  3. When the sentinel enters the viewport, appends the next page using
 *     the nextCursor returned by the API.
 *  4. Stops fetching when nextCursor is null (last page reached).
 */
const ExploreFeed = () => {
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(undefined); // undefined = "not yet fetched first page"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    /** Ref attached to the invisible sentinel element at the bottom of the list */
    const sentinelRef = useRef(null);
    /** Keep a stable ref to the fetch function for the observer callback */
    const fetchRef = useRef(null);

    // ─── Core fetch function ────────────────────────────────────────────────────
    const fetchPage = useCallback(async (cursor) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const params = cursor ? { cursor } : {};
            const { data } = await axios.get(ENDPOINT, { params });

            if (!data.status) throw new Error(data.message || "Failed to load posts");

            setPosts((prev) => {
                // De-duplicate by _id in case an observable fires twice
                const existingIds = new Set(prev.map((p) => p._id));
                const fresh = data.posts.filter((p) => !existingIds.has(p._id));
                return [...prev, ...fresh];
            });

            setNextCursor(data.nextCursor);      // null when no more pages
            setHasMore(data.nextCursor !== null);
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, [loading]);

    // Keep the ref current so the observer always calls the latest version
    fetchRef.current = fetchPage;

    // ─── Initial load ───────────────────────────────────────────────────────────
    useEffect(() => {
        fetchPage(undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Intersection Observer for infinite scroll ──────────────────────────────
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !loading) {
                    fetchRef.current(nextCursor);
                }
            },
            {
                root: null,
                rootMargin: "200px",   // start loading 200px before the sentinel is visible
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, nextCursor]);

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ maxWidth: "1100px", mx: "auto", px: { xs: "16px", md: "24px" }, py: "24px" }}>

            {/* ── Page header ─────────────────────────────────────────────── */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "24px" }}>
                <ExploreIcon sx={{ color: MINT, fontSize: "32px" }} />
                <Box>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: SLATE, lineHeight: 1.2 }}
                    >
                        Explore Ideas
                    </Typography>
                    <Typography sx={{ fontSize: "13px", color: "#64748b", mt: "2px" }}>
                        Discover public posts from the Thinkify community
                    </Typography>
                </Box>
            </Box>

            {/* ── Error banner ────────────────────────────────────────────── */}
            {error && (
                <Alert severity="error" sx={{ mb: "16px", borderRadius: "8px" }}>
                    {error}
                </Alert>
            )}

            {/* ── Post grid ───────────────────────────────────────────────── */}
            <Grid container spacing={3}>
                {posts.map((post) => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                        <IdeaCard post={post} />
                    </Grid>
                ))}
            </Grid>

            {/* ── Empty state (first load returned nothing) ────────────────── */}
            {!loading && posts.length === 0 && !error && (
                <Box
                    sx={{
                        textAlign: "center",
                        py: "80px",
                        color: "#94a3b8",
                    }}
                >
                    <ExploreIcon sx={{ fontSize: "64px", mb: "12px", opacity: 0.4 }} />
                    <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                        No public posts yet
                    </Typography>
                    <Typography sx={{ fontSize: "13px", mt: "4px" }}>
                        Be the first to share an idea!
                    </Typography>
                </Box>
            )}

            {/* ── Loading spinner ──────────────────────────────────────────── */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: "32px" }}>
                    <CircularProgress size={28} sx={{ color: MINT }} />
                </Box>
            )}

            {/* ── End-of-feed message ─────────────────────────────────────── */}
            {!hasMore && posts.length > 0 && !loading && (
                <Typography
                    sx={{
                        textAlign: "center",
                        py: "24px",
                        fontSize: "13px",
                        color: "#94a3b8",
                    }}
                >
                    You&apos;ve reached the end of the feed 🎉
                </Typography>
            )}

            {/* ── IntersectionObserver sentinel ───────────────────────────── */}
            <div ref={sentinelRef} style={{ height: "1px" }} aria-hidden="true" />
        </Box>
    );
};

export default ExploreFeed;
