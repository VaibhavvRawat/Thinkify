import { Box, Typography, Button, CircularProgress, Fade, Grow } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SendIcon from "@mui/icons-material/Send";
import LoginIcon from "@mui/icons-material/Login";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [resendMessage, setResendMessage] = useState("");
    const [resendSuccess, setResendSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_SERVER_ENDPOINT}/users/verify-email/${token}`
                );
                if (response.data.status) {
                    setStatus("success");
                    setMessage(response.data.message);
                } else {
                    setStatus(response.data.expired ? "expired" : "error");
                    setMessage(response.data.message);
                }
            } catch (error) {
                const serverMsg = error?.response?.data?.message;
                const isExpired = error?.response?.data?.expired;
                setStatus(isExpired ? "expired" : "error");
                setMessage(serverMsg || "Something went wrong. Please try again.");
            }
        };
        verify();
    }, [token]);

    // Auto-redirect countdown after success
    useEffect(() => {
        if (status !== "success") return;
        if (countdown === 0) { navigate("/login"); return; }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [status, countdown, navigate]);

    const handleResend = async () => {
        if (!resendEmail) return;
        setResending(true);
        setResendMessage("");
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_ENDPOINT}/users/resend-verification`,
                { email: resendEmail }
            );
            setResendMessage(response.data.message);
            setResendSuccess(true);
        } catch (error) {
            setResendMessage(error?.response?.data?.message || "Failed to resend. Please try again.");
            setResendSuccess(false);
        } finally {
            setResending(false);
        }
    };

    const stateConfig = {
        loading: {
            icon: null,
            color: "#59e3a7",
            title: "Verifying your email…",
            glow: "rgba(89,227,167,0.15)",
        },
        success: {
            icon: <CheckCircleIcon sx={{ fontSize: 80, color: "#59e3a7" }} />,
            color: "#59e3a7",
            title: "Email Verified! 🎉",
            glow: "rgba(89,227,167,0.2)",
        },
        error: {
            icon: <ErrorIcon sx={{ fontSize: 80, color: "#ef5350" }} />,
            color: "#ef5350",
            title: "Verification Failed",
            glow: "rgba(239,83,80,0.15)",
        },
        expired: {
            icon: <HourglassEmptyIcon sx={{ fontSize: 80, color: "#ffa726" }} />,
            color: "#ffa726",
            title: "Link Has Expired",
            glow: "rgba(255,167,38,0.15)",
        },
    };

    const cfg = stateConfig[status] || stateConfig.loading;

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(135deg, #0f1c21 0%, #1b2e35 50%, #0f1c21 100%)",
                position: "relative",
                overflow: "hidden",
                px: 2,
            }}
        >
            {/* Decorative blobs */}
            <Box sx={{
                position: "absolute", top: "-120px", left: "-120px",
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(89,227,167,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />
            <Box sx={{
                position: "absolute", bottom: "-100px", right: "-100px",
                width: 350, height: 350, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(89,227,167,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <Grow in timeout={500}>
                <Box
                    sx={{
                        maxWidth: 480,
                        width: "100%",
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "20px",
                        border: `1px solid rgba(255,255,255,0.1)`,
                        boxShadow: `0 8px 48px rgba(0,0,0,0.4), 0 0 60px ${cfg.glow}`,
                        overflow: "hidden",
                        transition: "box-shadow 0.6s ease",
                    }}
                >
                    {/* Top accent bar */}
                    <Box sx={{
                        height: 4,
                        background: `linear-gradient(90deg, transparent, ${cfg.color}, transparent)`,
                        transition: "background 0.5s ease",
                    }} />

                    <Box sx={{ p: { xs: "36px 24px", sm: "48px 44px" }, textAlign: "center" }}>

                        {/* Brand header */}
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
                            <MarkEmailReadIcon sx={{ color: "#59e3a7", fontSize: 22 }} />
                            <Typography sx={{ color: "#59e3a7", fontWeight: 700, fontSize: "15px", letterSpacing: 2, textTransform: "uppercase" }}>
                                Thinkify
                            </Typography>
                        </Box>

                        {/* ── LOADING ── */}
                        {status === "loading" && (
                            <Fade in timeout={400}>
                                <Box>
                                    <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
                                        <CircularProgress size={80} thickness={2} sx={{ color: "#59e3a7" }} />
                                        <Box sx={{
                                            position: "absolute", inset: 0,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}>
                                            <MarkEmailReadIcon sx={{ color: "#59e3a7", fontSize: 30 }} />
                                        </Box>
                                    </Box>
                                    <Typography variant="h6" sx={{ color: "white", fontWeight: 600, mb: 1 }}>
                                        Verifying your email
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                                        Hang tight, this only takes a moment…
                                    </Typography>
                                </Box>
                            </Fade>
                        )}

                        {/* ── SUCCESS ── */}
                        {status === "success" && (
                            <Fade in timeout={500}>
                                <Box>
                                    {/* Animated icon ring */}
                                    <Box sx={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: 100, height: 100, borderRadius: "50%",
                                        background: "rgba(89,227,167,0.1)",
                                        border: "2px solid rgba(89,227,167,0.3)",
                                        mb: 3,
                                        animation: "pulse 2s infinite",
                                        "@keyframes pulse": {
                                            "0%": { boxShadow: "0 0 0 0 rgba(89,227,167,0.3)" },
                                            "70%": { boxShadow: "0 0 0 16px rgba(89,227,167,0)" },
                                            "100%": { boxShadow: "0 0 0 0 rgba(89,227,167,0)" },
                                        },
                                    }}>
                                        <CheckCircleIcon sx={{ fontSize: 56, color: "#59e3a7" }} />
                                    </Box>
                                    <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
                                        You're all set! 🎉
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "15px", mb: 4, lineHeight: 1.6 }}>
                                        Your email has been successfully verified.<br />
                                        Welcome to Thinkify!
                                    </Typography>

                                    {/* Countdown progress */}
                                    <Box sx={{
                                        mb: 3, px: 2,
                                        background: "rgba(89,227,167,0.06)",
                                        borderRadius: "10px", py: 1.5,
                                        border: "1px solid rgba(89,227,167,0.12)",
                                    }}>
                                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                                            Redirecting to login in{" "}
                                            <Box component="span" sx={{ color: "#59e3a7", fontWeight: 700, fontSize: "15px" }}>
                                                {countdown}s
                                            </Box>
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<LoginIcon />}
                                        onClick={() => navigate("/login")}
                                        sx={{
                                            background: "linear-gradient(135deg, #59e3a7, #34c98a)",
                                            color: "#1b2e35",
                                            fontWeight: 700,
                                            fontSize: "15px",
                                            py: 1.5,
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            boxShadow: "0 4px 20px rgba(89,227,167,0.35)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, #34c98a, #59e3a7)",
                                                boxShadow: "0 6px 28px rgba(89,227,167,0.5)",
                                                transform: "translateY(-1px)",
                                            },
                                            transition: "all 0.25s ease",
                                        }}
                                    >
                                        Go to Login
                                    </Button>
                                </Box>
                            </Fade>
                        )}

                        {/* ── ERROR / EXPIRED ── */}
                        {(status === "error" || status === "expired") && (
                            <Fade in timeout={500}>
                                <Box>
                                    <Box sx={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        width: 100, height: 100, borderRadius: "50%",
                                        background: status === "expired" ? "rgba(255,167,38,0.1)" : "rgba(239,83,80,0.1)",
                                        border: `2px solid ${status === "expired" ? "rgba(255,167,38,0.3)" : "rgba(239,83,80,0.3)"}`,
                                        mb: 3,
                                    }}>
                                        {status === "expired"
                                            ? <HourglassEmptyIcon sx={{ fontSize: 52, color: "#ffa726" }} />
                                            : <ErrorIcon sx={{ fontSize: 52, color: "#ef5350" }} />
                                        }
                                    </Box>

                                    <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
                                        {status === "expired" ? "Link Has Expired" : "Verification Failed"}
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mb: 4, lineHeight: 1.6 }}>
                                        {message}
                                    </Typography>

                                    {/* Divider */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                                        <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                                        <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", whiteSpace: "nowrap" }}>
                                            Request a new link
                                        </Typography>
                                        <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                                    </Box>

                                    {/* Resend form */}
                                    {!resendSuccess ? (
                                        <>
                                            <Box sx={{ mb: 2, textAlign: "left" }}>
                                                <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
                                                    Your email address
                                                </Typography>
                                                <Box
                                                    component="input"
                                                    type="email"
                                                    value={resendEmail}
                                                    onChange={(e) => setResendEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && handleResend()}
                                                    placeholder="you@example.com"
                                                    sx={{
                                                        width: "100%",
                                                        padding: "12px 16px",
                                                        borderRadius: "10px",
                                                        border: "1px solid rgba(255,255,255,0.12)",
                                                        background: "rgba(255,255,255,0.05)",
                                                        color: "white",
                                                        fontSize: "14px",
                                                        boxSizing: "border-box",
                                                        outline: "none",
                                                        transition: "border-color 0.2s",
                                                        "&::placeholder": { color: "rgba(255,255,255,0.25)" },
                                                        "&:focus": { borderColor: "rgba(89,227,167,0.5)" },
                                                    }}
                                                />
                                            </Box>
                                            {resendMessage && (
                                                <Typography sx={{ color: "#ef5350", fontSize: "13px", mb: 2, textAlign: "left" }}>
                                                    ⚠ {resendMessage}
                                                </Typography>
                                            )}
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                disabled={resending || !resendEmail}
                                                onClick={handleResend}
                                                startIcon={resending ? null : <SendIcon sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    background: "linear-gradient(135deg, #59e3a7, #34c98a)",
                                                    color: "#1b2e35",
                                                    fontWeight: 700,
                                                    fontSize: "14px",
                                                    py: 1.5,
                                                    borderRadius: "10px",
                                                    textTransform: "none",
                                                    mb: 3,
                                                    boxShadow: "0 4px 16px rgba(89,227,167,0.25)",
                                                    "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 24px rgba(89,227,167,0.4)" },
                                                    "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" },
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {resending
                                                    ? <CircularProgress size={20} sx={{ color: "#1b2e35" }} />
                                                    : "Send New Verification Email"
                                                }
                                            </Button>
                                        </>
                                    ) : (
                                        <Box sx={{
                                            mb: 3, p: 2, borderRadius: "10px",
                                            background: "rgba(89,227,167,0.07)",
                                            border: "1px solid rgba(89,227,167,0.2)",
                                        }}>
                                            <Typography sx={{ color: "#59e3a7", fontSize: "14px", fontWeight: 600 }}>
                                                ✓ New link sent!
                                            </Typography>
                                            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", mt: 0.5 }}>
                                                {resendMessage}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
                                        Already verified?{" "}
                                        <Link to="/login" style={{ color: "#59e3a7", textDecoration: "none", fontWeight: 600 }}>
                                            Log in →
                                        </Link>
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                </Box>
            </Grow>
        </Box>
    );
};

export default VerifyEmail;
