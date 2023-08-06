import {
  Autocomplete,
  Dialog,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

function ComponentDialog({
  serialKeys,
  handler,
  openHandler,
  selectTheSerialKey,
}) {
  const [serialKeyFromSearch, setSerialKeyFromSearch] = useState("");
  const [filteredSerialKeys, setFilteredSerialKeys] = useState(serialKeys);
  useEffect(() => {
    console.log("filteredSerialKeys: ", filteredSerialKeys);
  }, [filteredSerialKeys]);
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
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              marginTop: 1,
              paddingBottom: 2,
            }}
          >
            <Typography component="h6" variant="h6" color="black">
              Select Serial Number:
            </Typography>
            {/* <Autocomplete
              onChange={(event, newValue) => selectTheSerialKey(newValue)}
              freeSolo
              id="serialKeySearchBox"
              disableClearable
              options={serialKeys}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Serial Key"
                  InputProps={{
                    ...params.InputProps,
                    type: "search",
                  }}
                />
              )}
              sx={{ width: 200 }}
              //   className={styles.item__inputField}
            /> */}
            <TextField
              variant="outlined"
              placeholder="Serial Number"
              value={serialKeyFromSearch}
              onChange={(e) => {
                const filteredKeys = serialKeys.filter((key) =>
                  key.startsWith(e.target.value)
                );
                setFilteredSerialKeys(filteredKeys);
                setSerialKeyFromSearch(e.target.value);
              }}
            />
          </ListSubheader>

          {filteredSerialKeys.length > 0 ? (
            filteredSerialKeys.map((serialKey) => (
              <ListItem key={serialKey} disablePadding>
                <ListItemButton onClick={(e) => selectTheSerialKey(serialKey)}>
                  <ListItemText>{serialKey}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Typography
              variant="h6"
              component="h6"
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                margin: "20px auto",
              }}
            >
              No serial keys found{" "}
            </Typography>
          )}
        </List>
      </Dialog>
    </>
  );
}

export default ComponentDialog;
