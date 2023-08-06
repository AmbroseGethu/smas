import React from "react";

const Tooltip = ({ children, text }) => (
  <div
    className="tooltip"
    data-tip={text}
    style={{
      position: "relative",
      "&:hover:after": {
        content: "attr(data-tip)",
        position: "absolute",
        left: "100%",
        top: "50%",
        transform: "translate(0, -50%)",
        padding: "0.5rem",
        backgroundColor: "#333",
        color: "#fff",
        whiteSpace: "nowrap",
      },
    }}
  >
    {children}
  </div>
);

export default Tooltip;
