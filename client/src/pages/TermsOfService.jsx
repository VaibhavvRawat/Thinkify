import { Box, Typography, Divider } from "@mui/material";
import NavBar from "../layouts/NavBar";
import Footer from "../layouts/Footer";

const sections = [
    {
        title: "Acceptance of Terms",
        body: "By accessing or using Thinkify, you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our platform.",
    },
    {
        title: "User Responsibilities",
        body: "You are responsible for maintaining the confidentiality of your account and for all activities that occur under it. Do not share your credentials with others.",
    },
    {
        title: "Content Ownership",
        body: "You retain ownership of content you create on Thinkify. By posting, you grant us a non-exclusive license to display your content on the platform.",
    },
    {
        title: "Termination",
        body: "We reserve the right to suspend or terminate your account if you violate these terms. For concerns, contact us at support@thinkify.com.",
    },
];

const TermsOfService = () => {
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
                    Terms of Service
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

export default TermsOfService;
