import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Avatar,
    Divider,
    Button,
} from "@mui/material";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FavoriteIcon from "@mui/icons-material/Favorite";

const MINT = "#59e3a7";
const SLATE = "#1b2e35";

const CARD_SX = {
    background: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
    transition: "box-shadow 0.25s ease, transform 0.25s ease",
    "&:hover": {
        boxShadow: "0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.06)",
        transform: "translateY(-3px)",
    },
    overflow: "hidden",
    height: "100%",
    display: "flex",
    flexDirection: "column",
};

/**
 * Strips markdown syntax for a plain-text preview.
 */
function stripMarkdown(raw = "") {
    return raw
        .replace(/#+\s/g, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/`{1,3}[^`]*`{1,3}/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/>\s?/g, "")
        .replace(/\n+/g, " ")
        .trim();
}

const ExplorePostCard = ({ post }) => {
    const { _id, title, tags = [], description, authorId, views, likes } = post;
    const navigate = useNavigate();
    const authorName = authorId?.fullName ?? "Unknown";
    const authorImage = authorId?.image ?? null;

    const plainText = stripMarkdown(description);
    const preview = plainText.length > 180 ? plainText.slice(0, 180) + "…" : plainText;

    const formatCount = (n) => {
        if (n == null) return null;
        if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
        return String(n);
    };

    const viewsLabel = formatCount(views);
    const likesLabel = formatCount(likes);

    return (
        <Card sx={CARD_SX}>
            <CardContent
                sx={{
                    p: "20px",
                    "&:last-child": { pb: "20px" },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                }}
            >
                {/* ── Author row ───────────────────────────────────────── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px" }}>
                    <Avatar
                        src={authorImage}
                        alt={authorName}
                        sx={{ width: 34, height: 34, border: `2px solid ${MINT}` }}
                    />
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: SLATE }}>
                        {authorName}
                    </Typography>
                </Box>

                <Divider sx={{ mb: "14px", borderColor: "#f1f5f9" }} />

                {/* ── Title ────────────────────────────────────────────── */}
                <Link to={`/posts/${_id}`} style={{ textDecoration: "none" }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "15.5px",
                            fontWeight: 700,
                            color: SLATE,
                            mb: "10px",
                            lineHeight: 1.4,
                            "&:hover": { color: MINT },
                            transition: "color 0.15s ease",
                        }}
                    >
                        {title}
                    </Typography>
                </Link>

                {/* ── Preview ───────────────────────────────────────────── */}
                <Typography
                    sx={{
                        fontSize: "13.5px",
                        color: "#475569",
                        lineHeight: 1.65,
                        mb: "14px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        flexGrow: 1,
                    }}
                >
                    {preview}
                </Typography>

                {/* ── Tags ────────────────────────────────────────────── */}
                {tags.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px", mb: "14px" }}>
                        {tags.slice(0, 4).map((tag) => (
                            <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                    backgroundColor: `${MINT}22`,
                                    color: "#0f7b56",
                                    fontWeight: 600,
                                    fontSize: "11px",
                                    borderRadius: "999px",
                                    border: `1px solid ${MINT}55`,
                                    height: "22px",
                                    "&:hover": { backgroundColor: `${MINT}44` },
                                    cursor: "default",
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* ── Footer: stats + Read More ─────────────────────────── */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: "auto",
                        pt: "12px",
                        borderTop: "1px solid #f1f5f9",
                    }}
                >
                    {/* Stats */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {viewsLabel && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <VisibilityIcon sx={{ fontSize: "13px", color: "#94a3b8" }} />
                                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                    {viewsLabel}
                                </Typography>
                            </Box>
                        )}
                        {likesLabel && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <FavoriteIcon sx={{ fontSize: "12px", color: "#f87171" }} />
                                <Typography sx={{ fontSize: "12px", color: "#64748b" }}>
                                    {likesLabel}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Read More */}
                    <Button
                        size="small"
                        onClick={() => navigate(`/posts/${_id}`)}
                        sx={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: SLATE,
                            backgroundColor: `${MINT}30`,
                            borderRadius: "999px",
                            px: "14px",
                            py: "4px",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: MINT,
                                color: SLATE,
                            },
                            transition: "all 0.2s ease",
                        }}
                    >
                        Read More
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

ExplorePostCard.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        views: PropTypes.number,
        likes: PropTypes.number,
        authorId: PropTypes.shape({
            fullName: PropTypes.string,
            image: PropTypes.string,
        }),
    }).isRequired,
};

export default ExplorePostCard;
