import { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Skeleton,
    Alert,
    Button,
    Divider,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ExplorePostCard from "./ExplorePostCard";

const ENDPOINT = `${import.meta.env.VITE_SERVER_ENDPOINT}/posts/explore`;
const MINT = "#59e3a7";
const SLATE = "#1b2e35";

/** Skeleton placeholder cards shown while loading */
const CardSkeleton = () => (
    <Box
        sx={{
            borderRadius: "14px",
            overflow: "hidden",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            p: "20px",
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px" }}>
            <Skeleton variant="circular" width={34} height={34} />
            <Skeleton variant="text" width={100} height={16} />
        </Box>
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: "8px" }} />
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="100%" height={14} />
        <Skeleton variant="text" width="60%" height={14} sx={{ mb: "14px" }} />
        <Box sx={{ display: "flex", gap: "6px" }}>
            <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "999px" }} />
            <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: "999px" }} />
        </Box>
    </Box>
);

const ExploreSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data } = await axios.get(ENDPOINT, { params: { limit: 6 } });
                if (!data.status) throw new Error(data.message || "Failed to load posts");
                setPosts(data.posts ?? []);
            } catch (err) {
                setError(err.message || "Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <Box
            id="explore-section"
            sx={{
                maxWidth: "1280px",
                mx: "auto",
                px: { xs: "16px", sm: "24px", md: "40px" },
                py: { xs: "48px", md: "72px" },
            }}
        >
            {/* ── Section header ───────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: "16px",
                    mb: "12px",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "12px",
                            background: `${MINT}22`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <AutoAwesomeIcon sx={{ color: MINT, fontSize: "22px" }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                fontWeight: 800,
                                color: SLATE,
                                fontSize: { xs: "22px", md: "28px" },
                                lineHeight: 1.2,
                            }}
                        >
                            Explore Ideas from Creators
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "14px",
                                color: "#64748b",
                                mt: "4px",
                            }}
                        >
                            Discover blogs and posts shared by the community
                        </Typography>
                    </Box>
                </Box>

                <Button
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate("/explore")}
                    sx={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: SLATE,
                        backgroundColor: `${MINT}25`,
                        borderRadius: "999px",
                        px: "20px",
                        py: "8px",
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        "&:hover": {
                            backgroundColor: MINT,
                            color: SLATE,
                        },
                        transition: "all 0.2s ease",
                    }}
                >
                    View all
                </Button>
            </Box>

            <Divider sx={{ mb: "36px", borderColor: "#e2e8f0" }} />

            {/* ── Error state ───────────────────────────────────────────── */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: "10px", mb: "24px" }}>
                    {error}
                </Alert>
            )}

            {/* ── Posts grid ────────────────────────────────────────────── */}
            <Grid container spacing={3}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                          <Grid item xs={12} sm={6} lg={4} key={i}>
                              <CardSkeleton />
                          </Grid>
                      ))
                    : posts.map((post) => (
                          <Grid item xs={12} sm={6} lg={4} key={post._id}>
                              <ExplorePostCard post={post} />
                          </Grid>
                      ))}
            </Grid>

            {/* ── Empty state ───────────────────────────────────────────── */}
            {!loading && !error && posts.length === 0 && (
                <Box
                    sx={{
                        textAlign: "center",
                        py: "80px",
                        color: "#94a3b8",
                    }}
                >
                    <AutoAwesomeIcon sx={{ fontSize: "56px", mb: "12px", opacity: 0.35 }} />
                    <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                        No public posts yet
                    </Typography>
                    <Typography sx={{ fontSize: "13px", mt: "4px" }}>
                        Be the first to share an idea!
                    </Typography>
                </Box>
            )}

            {/* ── View all CTA (bottom) ─────────────────────────────────── */}
            {!loading && posts.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: "40px" }}>
                    <Button
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate("/explore")}
                        variant="outlined"
                        sx={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: SLATE,
                            borderColor: `${MINT}88`,
                            borderRadius: "999px",
                            px: "28px",
                            py: "10px",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: MINT,
                                borderColor: MINT,
                                color: SLATE,
                            },
                            transition: "all 0.25s ease",
                        }}
                    >
                        See all community posts
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default ExploreSection;
