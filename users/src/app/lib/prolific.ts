export const redirectToProlificFail = () => {
  window.location.href =
    process.env.PROLIFIC_REJECTION_URL || `https://app.prolific.com/submissions/complete?cc=CLAI1PZS`;
};

export const redirectToProlificComplete = () => {
  window.location.href =
    process.env.PROLIFIC_COMPLETION_URL || "https://app.prolific.com/submissions/complete?cc=C16GBRWH";
};
