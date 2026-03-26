import { Box, Grid, TextField, Typography, Stack, Chip, Button } from '@mui/material';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';

const Banner = () => {
    return (
        <>
            <Grid minHeight="92vh" maxWidth="1280px" mx="auto" container spacing={2} justifyContent="center" alignItems="center" >
                <Grid item xs={6} >
                    <Box sx={{ display: "flex", gap: "5px", color: "#797979" }}  >
                        <ConnectWithoutContactIcon />
                        <Typography variant="body1" >Connecting Ideas, Inspiring Perspectives</Typography>
                    </Box>
                    <Typography
                        sx={{
                            fontFamily: "Platypi",
                            color: "#1b2e35",
                            margin: "5px 0 30px 0"
                        }}
                        variant="h1"
                        component="h1"
                    >Thinkify</Typography>
                    <Typography sx={{ color: "#797979" }} variant="body1">At Thinkify, our mission is to provide a dynamic and intuitive platform that empowers individuals to transform their ideas into actionable tasks.</Typography>
                    <Box sx={{ margin: "30px 0 35px 0" }}>
                        <form action="" method="post" >
                            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <TextField
                                    placeholder="Search Here ..."
                                    sx={{ width: '65%' }}
                                />
                                <Button
                                    onClick={() =>
                                        document
                                            .getElementById('explore-section')
                                            ?.scrollIntoView({ behavior: 'smooth' })
                                    }
                                    sx={{
                                        backgroundColor: '#59e3a7',
                                        color: '#1b2e35',
                                        fontWeight: 700,
                                        fontSize: '14px',
                                        borderRadius: '999px',
                                        px: '24px',
                                        py: '14px',
                                        textTransform: 'none',
                                        boxShadow: '0 4px 14px rgba(89,227,167,0.35)',
                                        whiteSpace: 'nowrap',
                                        '&:hover': {
                                            backgroundColor: '#38d492',
                                            boxShadow: '0 6px 20px rgba(89,227,167,0.5)',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    ✦ Explore
                                </Button>
                            </Box>
                        </form>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Chip label="vr-gaming" sx={{ backgroundColor: "#1b2e35", color: "white", cursor: "pointer" }} />
                        <Chip label="blockchain" sx={{ backgroundColor: "#1b2e35", color: "white", cursor: "pointer" }} />
                        <Chip label="crypto-currency" sx={{ backgroundColor: "#1b2e35", color: "white", cursor: "pointer" }} />
                        <Chip label="machine-learning" sx={{ backgroundColor: "#1b2e35", color: "white", cursor: "pointer" }} />
                        <Chip label="cyber-security" sx={{ backgroundColor: "#1b2e35", color: "white", cursor: "pointer" }} />
                    </Stack>
                </Grid>
                <Grid item xs={6}>
                    <img style={{ width: "100%" }} src="/images/banner.jpg" alt="Thinkify" />
                </Grid>
            </Grid>
        </>
    )
}

export default Banner