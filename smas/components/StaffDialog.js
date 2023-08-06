import {
  Dialog,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import React from "react";

function StaffDialog({ staffs, handler, openHandler, selectTheStaff }) {
  return (
    <>
      <Dialog
        onClose={handler}
        open={openHandler}
        sx={{
          height: 500,
          overflowY: "scroll",
          scrollBehavior: "smooth",
        }}
        fullWidth="false"
        maxWidth={"xs"}
      >
        {/* <DialogTitle>Select Staff</DialogTitle> */}
        <List>
          <ListSubheader
            sx={{
              padding: "5px 10px",
              display: "flex",
              justifyContent: "center",
              borderBottom: "1px dotted gray",
            }}
          >
            <Typography component="h6" variant="h6">
              Select Staff
            </Typography>
          </ListSubheader>
          {staffs.map((staff) => (
            <ListItem key={staff} disablePadding>
              <ListItemButton onClick={(e) => selectTheStaff(staff)}>
                <ListItemText>{staff}</ListItemText>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Dialog>
    </>
  );
}

export default StaffDialog;
