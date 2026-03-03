import { Box, Typography, Button, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * VerifyEmail page — opened from the link in the verification email.
 * Calls GET /api/users/verify-email/:token on mount, then shows
 * a success or error state with appropriate call-to-action.
 */
const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("loading"); // "loading" | "success" | "error" | "expired"
    const [message, setMessage] = useState("");
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState("");
    const [resendMessage, setResendMessage] = useState("");

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
        } catch (error) {
            setResendMessage(error?.response?.data?.message || "Failed to resend. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <Box
            height="100vh"
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f4f4f4",
            }}
        >
            <Box
                sx={{
                    maxWidth: 480,
                    width: "90%",
                    backgroundColor: "#1b2e35",
                    borderRadius: "12px",
                    padding: "48px 40px",
                    textAlign: "center",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
            >
                {/* ── LOADING ── */}
                {status === "loading" && (
                    <>
                        <CircularProgress sx={{ color: "#59e3a7", mb: 3 }} size={56} />
                        <Typography sx={{ color: "white", fontSize: "18px" }}>
                            Verifying your email…
                        </Typography>
                    </>
                )}

                {/* ── SUCCESS ── */}
                {status === "success" && (
                    <>
                        <CheckCircleOutlineIcon sx={{ color: "#59e3a7", fontSize: 72, mb: 2 }} />
                        <Typography
                            variant="h5"
                            sx={{ color: "white", fontWeight: "bold", mb: 1 }}
                        >
                            Email Verified!
                        </Typography>
                        <Typography sx={{ color: "#b0bec5", mb: 4 }}>
                            {message}
                        </Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            sx={{ backgroundColor: "#59e3a7", color: "#1b2e35", fontWeight: "bold" }}
                            onClick={() => navigate("/login")}
                        >
                            Go to Login
                        </Button>
                    </>
                )}

                {/* ── ERROR ── */}
                {(status === "error" || status === "expired") && (
                    <>
                        <ErrorOutlineIcon sx={{ color: "#ef5350", fontSize: 72, mb: 2 }} />
                        <Typography
                            variant="h5"
                            sx={{ color: "white", fontWeight: "bold", mb: 1 }}
                        >
                            {status === "expired" ? "Link Expired" : "Verification Failed"}
                        </Typography>
                        <Typography sx={{ color: "#b0bec5", mb: 4 }}>
                            {message}
                        </Typography>

                        {/* Resend form */}
                        <Box sx={{ textAlign: "left", mb: 2 }}>
                            <Typography sx={{ color: "#b0bec5", mb: 1, fontSize: "14px" }}>
                                Enter your email to receive a new verification link:
                            </Typography>
                            <input
                                type="email"
                                value={resendEmail}
                                onChange={(e) => setResendEmail(e.target.value)}
                                placeholder="your@email.com"
                                style={{
                                    width: "100%",
                                    padding: "10px 14px",
                                    borderRadius: "6px",
                                    border: "1px solid #59e3a7",
                                    backgroundColor: "transparent",
                                    color: "white",
                                    fontSize: "14px",
                                    boxSizing: "border-box",
                                    outline: "none",
                                }}
                            />
                        </Box>
                        {resendMessage && (
                            <Typography sx={{ color: "#59e3a7", mb: 2, fontSize: "13px" }}>
                                {resendMessage}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            fullWidth
                            disabled={resending || !resendEmail}
                            onClick={handleResend}
                            sx={{ backgroundColor: "#59e3a7", color: "#1b2e35", fontWeight: "bold", mb: 2 }}
                        >
                            {resending ? <CircularProgress size={22} sx={{ color: "#1b2e35" }} /> : "Resend Verification Email"}
                        </Button>

                        <Typography sx={{ color: "#b0bec5", fontSize: "13px" }}>
                            Already verified?{" "}
                            <Link to="/login" style={{ color: "#59e3a7" }}>
                                Log in
                            </Link>
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default VerifyEmail;
