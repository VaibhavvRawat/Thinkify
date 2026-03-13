import { Box, Typography, Divider } from "@mui/material";
import NavBar from "../layouts/NavBar";
import Footer from "../layouts/Footer";

const sections = [
    {
        title: "Information We Collect",
        body: "We collect information you provide when you register, such as your name, email, and profile details. We also collect usage data to improve the platform experience.",
    },
    {
        title: "How We Use Your Information",
        body: "Your information is used to operate and personalize your Thinkify experience. We do not sell your data to third parties under any circumstances.",
    },
    {
        title: "Data Security",
        body: "We take reasonable measures to protect your information from unauthorized access or disclosure. However, no internet transmission is entirely secure.",
    },
    {
        title: "Contact",
        body: "If you have any questions about this Privacy Policy, please reach out to us at support@thinkify.com. We aim to respond within 2 business days.",
    },
];

const PrivacyPolicy = () => {
    return (
        <>
            <NavBar />
            <Box
                sx={{
                    maxWidth: "780px",
                    mx: "auto",
                    px: 3,
                    py: 8,
                    minHeight: "70vh",
                    color: "#1b2e35",
                }}
            >
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                    Privacy Policy
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4}>
                    Last updated: March 2025
                </Typography>
                <Divider sx={{ mb: 4 }} />

                {sections.map(({ title, body }) => (
                    <Box key={title} mb={4}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" lineHeight={1.8}>
                            {body}
                        </Typography>
                    </Box>
                ))}
            </Box>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
