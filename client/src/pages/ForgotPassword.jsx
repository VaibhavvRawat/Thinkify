import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { Link } from "react-router-dom";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import LockResetIcon from "@mui/icons-material/LockReset";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const ForgotPassword = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async ({ email }) => {
        setLoading(true);
        setError("");
        try {
            await axios.post(`${import.meta.env.VITE_SERVER_ENDPOINT}/users/request-reset`, { email });
            setSubmitted(true);
        } catch (err) {
            // Only show error for server-level failures (5xx)
            // For 4xx (e.g. Google account), surface the message
            const msg = err?.response?.data?.message;
            if (err?.response?.status < 500 && msg) {
                setError(msg);
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #0f1c21 0%, #1b2e35 50%, #0f1c21 100%)",
            px: 2,
        }}>
            {/* Decorative blobs */}
            <Box sx={{ position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(89,227,167,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", bottom: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(89,227,167,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

            <Box sx={{
                maxWidth: 460,
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.4), 0 0 60px rgba(89,227,167,0.08)",
                overflow: "hidden",
            }}>
                {/* Top accent bar */}
                <Box sx={{ height: 4, background: "linear-gradient(90deg, transparent, #59e3a7, transparent)" }} />

                <Box sx={{ p: { xs: "36px 24px", sm: "48px 44px" }, textAlign: "center" }}>
                    {/* Brand */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
                        <LockResetIcon sx={{ color: "#59e3a7", fontSize: 22 }} />
                        <Typography sx={{ color: "#59e3a7", fontWeight: 700, fontSize: "15px", letterSpacing: 2, textTransform: "uppercase" }}>
                            Thinkify
                        </Typography>
                    </Box>

                    {!submitted ? (
                        /* ── REQUEST FORM ── */
                        <>
                            <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
                                Forgot your password?
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", mb: 4, lineHeight: 1.6 }}>
                                Enter your email and we'll send you a link to reset your password.
                            </Typography>

                            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                                <Box sx={{ textAlign: "left", mb: 2 }}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>
                                        Email address
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="you@example.com"
                                        autoComplete="new-password"
                                        inputProps={{ autoComplete: "new-password" }}
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" }
                                        })}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "10px",
                                                background: "rgba(255,255,255,0.05)",
                                                "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                                                "&:hover fieldset": { borderColor: "rgba(89,227,167,0.4)" },
                                                "&.Mui-focused fieldset": { borderColor: "#59e3a7" },
                                            },
                                            "& .MuiInputBase-input": { color: "white", padding: "13px 16px" },
                                            "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.25)" },
                                        }}
                                    />
                                    {errors.email && (
                                        <Typography sx={{ color: "#ef5350", fontSize: "13px", mt: 0.5 }}>
                                            {errors.email.message}
                                        </Typography>
                                    )}
                                </Box>

                                {error && (
                                    <Box sx={{ background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.3)", borderRadius: "8px", p: 1.5, mb: 2, textAlign: "left" }}>
                                        <Typography sx={{ color: "#ef9a9a", fontSize: "13px" }}>⚠ {error}</Typography>
                                    </Box>
                                )}

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={loading}
                                    sx={{
                                        mt: 1,
                                        background: "linear-gradient(135deg, #59e3a7, #34c98a)",
                                        color: "#1b2e35",
                                        fontWeight: 700,
                                        fontSize: "15px",
                                        py: 1.5,
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        boxShadow: "0 4px 20px rgba(89,227,167,0.3)",
                                        "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 28px rgba(89,227,167,0.45)" },
                                        "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" },
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {loading ? <CircularProgress size={22} sx={{ color: "#1b2e35" }} /> : "Send Reset Link"}
                                </Button>
                            </Box>

                            <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", mt: 3 }}>
                                <Link to="/login" style={{ color: "#59e3a7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to Login
                                </Link>
                            </Typography>
                        </>
                    ) : (
                        /* ── SUCCESS STATE ── */
                        <>
                            <Box sx={{
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                                width: 90, height: 90, borderRadius: "50%",
                                background: "rgba(89,227,167,0.1)", border: "2px solid rgba(89,227,167,0.3)", mb: 3,
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                    "0%": { boxShadow: "0 0 0 0 rgba(89,227,167,0.3)" },
                                    "70%": { boxShadow: "0 0 0 14px rgba(89,227,167,0)" },
                                    "100%": { boxShadow: "0 0 0 0 rgba(89,227,167,0)" },
                                },
                            }}>
                                <MarkEmailReadIcon sx={{ fontSize: 44, color: "#59e3a7" }} />
                            </Box>
                            <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>
                                Check your inbox!
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.7, mb: 4 }}>
                                If an account with that email exists, we've sent a password reset link.
                                The link expires in <Box component="span" sx={{ color: "#ffa726", fontWeight: 600 }}>15 minutes</Box>.
                            </Typography>
                            <Link to="/login" style={{ textDecoration: "none" }}>
                                <Button sx={{
                                    background: "linear-gradient(135deg, #59e3a7, #34c98a)",
                                    color: "#1b2e35", fontWeight: 700, fontSize: "14px",
                                    py: 1.4, px: 4, borderRadius: "10px", textTransform: "none",
                                    "&:hover": { transform: "translateY(-1px)" },
                                    transition: "all 0.2s",
                                }}>
                                    Back to Login
                                </Button>
                            </Link>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ForgotPassword;
