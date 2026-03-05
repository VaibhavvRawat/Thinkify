import { Box, Typography, TextField, Button, CircularProgress, Fade } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockResetIcon from "@mui/icons-material/LockReset";
import ErrorIcon from "@mui/icons-material/Error";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

const rules = [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "One number", test: (v) => /\d/.test(v) },
];

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [serverMsg, setServerMsg] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const watchPassword = watch("newPassword", "");

    // Auto-redirect countdown after success
    const startCountdown = () => {
        let count = 5;
        setCountdown(count);
        const t = setInterval(() => {
            count -= 1;
            setCountdown(count);
            if (count <= 0) { clearInterval(t); navigate("/login"); }
        }, 1000);
    };

    const onSubmit = async ({ newPassword }) => {
        setStatus("loading");
        setServerMsg("");
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_SERVER_ENDPOINT}/users/reset-password/${token}`,
                { newPassword }
            );
            if (res.data.status) {
                setStatus("success");
                setServerMsg(res.data.message);
                startCountdown();
            } else {
                setStatus("error");
                setServerMsg(res.data.message || "Something went wrong.");
            }
        } catch (err) {
            setStatus("error");
            setServerMsg(err?.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            background: "rgba(255,255,255,0.05)",
            "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
            "&:hover fieldset": { borderColor: "rgba(89,227,167,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#59e3a7" },
        },
        "& .MuiInputBase-input": { color: "white", padding: "13px 16px" },
        "& .MuiInputAdornment-root svg": { color: "rgba(255,255,255,0.3)", cursor: "pointer" },
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
            <Box sx={{ position: "absolute", top: -100, left: -100, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(89,227,167,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

            <Box sx={{
                maxWidth: 480,
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(20px)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: `0 8px 48px rgba(0,0,0,0.4), 0 0 60px ${status === "success" ? "rgba(89,227,167,0.15)" : status === "error" ? "rgba(239,83,80,0.12)" : "rgba(89,227,167,0.08)"}`,
                overflow: "hidden",
                transition: "box-shadow 0.5s ease",
            }}>
                <Box sx={{ height: 4, background: `linear-gradient(90deg, transparent, ${status === "error" ? "#ef5350" : "#59e3a7"}, transparent)`, transition: "background 0.5s" }} />

                <Box sx={{ p: { xs: "36px 24px", sm: "48px 44px" }, textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 4 }}>
                        <LockResetIcon sx={{ color: "#59e3a7", fontSize: 22 }} />
                        <Typography sx={{ color: "#59e3a7", fontWeight: 700, fontSize: "15px", letterSpacing: 2, textTransform: "uppercase" }}>
                            Thinkify
                        </Typography>
                    </Box>

                    {/* ── SUCCESS ── */}
                    {status === "success" && (
                        <Fade in timeout={400}>
                            <Box>
                                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 90, height: 90, borderRadius: "50%", background: "rgba(89,227,167,0.1)", border: "2px solid rgba(89,227,167,0.3)", mb: 3, animation: "pulse 2s infinite", "@keyframes pulse": { "0%": { boxShadow: "0 0 0 0 rgba(89,227,167,0.3)" }, "70%": { boxShadow: "0 0 0 14px rgba(89,227,167,0)" }, "100%": { boxShadow: "0 0 0 0 rgba(89,227,167,0)" } } }}>
                                    <CheckCircleIcon sx={{ fontSize: 50, color: "#59e3a7" }} />
                                </Box>
                                <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>Password Reset!</Typography>
                                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mb: 3 }}>{serverMsg}</Typography>
                                <Box sx={{ mb: 3, background: "rgba(89,227,167,0.06)", border: "1px solid rgba(89,227,167,0.12)", borderRadius: "10px", py: 1.5 }}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>
                                        Redirecting to login in <Box component="span" sx={{ color: "#59e3a7", fontWeight: 700, fontSize: "15px" }}>{countdown}s</Box>
                                    </Typography>
                                </Box>
                                <Button onClick={() => navigate("/login")} startIcon={<LoginIcon />} sx={{ background: "linear-gradient(135deg, #59e3a7, #34c98a)", color: "#1b2e35", fontWeight: 700, fontSize: "14px", py: 1.4, px: 4, borderRadius: "10px", textTransform: "none", "&:hover": { transform: "translateY(-1px)" }, transition: "all 0.2s" }}>
                                    Go to Login
                                </Button>
                            </Box>
                        </Fade>
                    )}

                    {/* ── ERROR (expired/invalid token) ── */}
                    {status === "error" && (
                        <Fade in timeout={400}>
                            <Box>
                                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 90, height: 90, borderRadius: "50%", background: "rgba(239,83,80,0.1)", border: "2px solid rgba(239,83,80,0.3)", mb: 3 }}>
                                    <ErrorIcon sx={{ fontSize: 50, color: "#ef5350" }} />
                                </Box>
                                <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>Reset Failed</Typography>
                                <Typography sx={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", mb: 4 }}>{serverMsg}</Typography>
                                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                                    <Button sx={{ background: "linear-gradient(135deg, #59e3a7, #34c98a)", color: "#1b2e35", fontWeight: 700, py: 1.4, px: 4, borderRadius: "10px", textTransform: "none", mb: 2, "&:hover": { transform: "translateY(-1px)" }, transition: "all 0.2s" }}>
                                        Request New Link
                                    </Button>
                                </Link>
                                <br />
                                <Link to="/login" style={{ color: "#59e3a7", fontSize: "13px" }}>Back to Login →</Link>
                            </Box>
                        </Fade>
                    )}

                    {/* ── FORM (idle / loading) ── */}
                    {(status === "idle" || status === "loading") && (
                        <Fade in timeout={400}>
                            <Box>
                                <Typography variant="h5" sx={{ color: "white", fontWeight: 700, mb: 1 }}>Set new password</Typography>
                                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "14px", mb: 4 }}>
                                    Choose a strong password for your account.
                                </Typography>

                                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ textAlign: "left" }}>
                                    {/* New Password */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>New Password</Typography>
                                        <Box sx={{ position: "relative" }}>
                                            <TextField
                                                type={showPw ? "text" : "password"}
                                                fullWidth
                                                placeholder="Min 8 chars, upper, lower, number"
                                                autoComplete="new-password"
                                                {...register("newPassword", {
                                                    required: "Password is required",
                                                    minLength: { value: 8, message: "Must be at least 8 characters" },
                                                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, message: "Include uppercase, lowercase, and a number" }
                                                })}
                                                sx={inputSx}
                                            />
                                            <Box onClick={() => setShowPw(!showPw)} sx={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                                                {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </Box>
                                        </Box>
                                        {errors.newPassword && <Typography sx={{ color: "#ef5350", fontSize: "13px", mt: 0.5 }}>{errors.newPassword.message}</Typography>}

                                        {/* Live strength rules */}
                                        {watchPassword && (
                                            <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                                                {rules.map(r => (
                                                    <Typography key={r.label} sx={{ fontSize: "12px", color: r.test(watchPassword) ? "#59e3a7" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "4px" }}>
                                                        {r.test(watchPassword) ? "✓" : "○"} {r.label}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Confirm Password */}
                                    <Box sx={{ mb: 3 }}>
                                        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", mb: 1, textTransform: "uppercase", letterSpacing: 1 }}>Confirm Password</Typography>
                                        <Box sx={{ position: "relative" }}>
                                            <TextField
                                                type={showConfirm ? "text" : "password"}
                                                fullWidth
                                                placeholder="Re-enter your password"
                                                autoComplete="new-password"
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                    validate: v => v === watchPassword || "Passwords do not match"
                                                })}
                                                sx={inputSx}
                                            />
                                            <Box onClick={() => setShowConfirm(!showConfirm)} sx={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                                                {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </Box>
                                        </Box>
                                        {errors.confirmPassword && <Typography sx={{ color: "#ef5350", fontSize: "13px", mt: 0.5 }}>{errors.confirmPassword.message}</Typography>}
                                    </Box>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={status === "loading"}
                                        sx={{
                                            background: "linear-gradient(135deg, #59e3a7, #34c98a)",
                                            color: "#1b2e35", fontWeight: 700, fontSize: "15px",
                                            py: 1.5, borderRadius: "10px", textTransform: "none",
                                            boxShadow: "0 4px 20px rgba(89,227,167,0.3)",
                                            "&:hover": { transform: "translateY(-1px)", boxShadow: "0 6px 28px rgba(89,227,167,0.45)" },
                                            "&:disabled": { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.2)" },
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {status === "loading" ? <CircularProgress size={22} sx={{ color: "#1b2e35" }} /> : "Reset Password"}
                                    </Button>
                                </Box>
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ResetPassword;
