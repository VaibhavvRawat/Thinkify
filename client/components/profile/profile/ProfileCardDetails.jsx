import { Box, Card, Typography, Avatar } from "@mui/material";
import PropTypes from "prop-types";

const ProfileCardDetails = ({ data }) => {
  return (
    <Card
      sx={{
        backgroundColor: "#59e3a7",
        borderRadius: "12px",
        padding: "5px 10px 15px 5px",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        height: "100%",
        minHeight: "110px",
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "2px solid white",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Avatar
          sx={{ width: "100%", height: "100%" }}
          alt={data?.fullName}
          src={
            data?.image ||
            "https://cdn-icons-png.flaticon.com/512/5556/5556468.png"
          }
        />
      </Box>

      {/* Name */}
      <Typography
        sx={{
          color: "white",
          fontWeight: "bold",
          fontSize: "15px",
          textAlign: "center",
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {data?.fullName}
      </Typography>

      {/* Email */}
      <Typography
        sx={{
          color: "white",
          fontSize: "12px",
          textAlign: "center",
          opacity: 0.9,
          wordBreak: "break-all",
        }}
      >
        {data?.email}
      </Typography>
    </Card>
  );
};

ProfileCardDetails.propTypes = {
  data: PropTypes.object,
};

export default ProfileCardDetails;
