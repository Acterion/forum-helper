export type Scale = Record<number, string>;

export const confidenceScale: Scale = {
  1: "Not at all confident",
  2: "Slightly confident",
  3: "Somewhat confident",
  4: "Quite confident",
  5: "Extremely confident",
};

export const agreementScale: Scale = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neither Agree nor Disagree",
  4: "Agree",
  5: "Strongly Agree",
};

export const stressScale: Scale = {
  1: "Not at all stressed",
  2: "Slightly stressed",
  3: "Somewhat stressed",
  4: "Quite stressed",
  5: "Extremely stressed",
};
