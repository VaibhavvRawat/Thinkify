import { Box, Card, CardContent, Typography, Chip, Avatar, Divider } from "@mui/material";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { marked } from "marked";
import DOMPurify from "dompurify";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// Shared card style token — matches the project's shadow step-up polish
const CARD_SX = {
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    "&:hover": {
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        transform: "translateY(-2px)",
    },
    overflow: "hidden",
};

const MINT = "#59e3a7";
const SLATE = "#1b2e35";

/**
 * Converts a markdown string to sanitised HTML (max 300 chars of raw text shown).
 * Uses `marked` + `DOMPurify` — both already in the project's package.json.
 */
function renderMarkdownPreview(raw = "") {
    const truncated = raw.length > 400 ? raw.slice(0, 400) + "…" : raw;
    const html = DOMPurify.sanitize(marked.parse(truncated));
    return html;
}

const IdeaCard = ({ post }) => {
    const { _id, title, tags = [], description, authorId, createdAt } = post;
    const authorName = authorId?.fullName ?? "Unknown";
    const authorImage = authorId?.image ?? null;
    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
    const htmlPreview = renderMarkdownPreview(description);

    return (
        <Card sx={CARD_SX}>
            <CardContent sx={{ p: "20px", "&:last-child": { pb: "20px" } }}>

                {/* ── Author row ─────────────────────────────────────────────── */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "14px" }}>
                    <Avatar
                        src={authorImage}
                        alt={authorName}
                        sx={{ width: 36, height: 36, border: `2px solid ${MINT}` }}
                    />
                    <Box>
                        <Typography
                            sx={{ fontSize: "13px", fontWeight: 600, color: SLATE, lineHeight: 1.2 }}
                        >
                            {authorName}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", mt: "2px" }}>
                            <CalendarTodayIcon sx={{ fontSize: "11px", color: "#64748b" }} />
                            <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                                {formattedDate}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ mb: "14px", borderColor: "#f1f5f9" }} />

                {/* ── Title ──────────────────────────────────────────────────── */}
                <Link
                    to={`/posts/${_id}`}
                    style={{ textDecoration: "none" }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: "16px",
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

                {/* ── Markdown description preview ────────────────────────────── */}
                <Box
                    sx={{
                        fontSize: "13.5px",
                        color: "#475569",
                        lineHeight: 1.65,
                        mb: "14px",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        "& p": { margin: 0 },
                        "& code": {
                            background: "#f1f5f9",
                            borderRadius: "4px",
                            padding: "1px 5px",
                            fontSize: "12px",
                            fontFamily: "monospace",
                        },
                        "& pre": {
                            background: "#f1f5f9",
                            borderRadius: "6px",
                            padding: "8px",
                            overflowX: "auto",
                        },
                    }}
                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />

                {/* ── Tags ───────────────────────────────────────────────────── */}
                {tags.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                    backgroundColor: `${MINT}22`,   // mint at 13% opacity
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
            </CardContent>
        </Card>
    );
};

IdeaCard.propTypes = {
    post: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        tags: PropTypes.arrayOf(PropTypes.string),
        createdAt: PropTypes.string.isRequired,
        authorId: PropTypes.shape({
            fullName: PropTypes.string,
            image: PropTypes.string,
        }),
    }).isRequired,
};

export default IdeaCard;
