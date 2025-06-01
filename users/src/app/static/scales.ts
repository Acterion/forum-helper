export type Scale = Record<number, string>;

export const confidenceScale: Scale = {
  1: "Extremely Unconfident",
  2: "Unconfident",
  3: "Neither Unconfident nor Confident",
  4: "Confident",
  5: "Extremely Confident",
};

export const agreementScale: Scale = {
  1: "Strongly Disagree",
  2: "Disagree",
  3: "Neither Agree nor Disagree",
  4: "Agree",
  5: "Strongly Agree",
};

export const stressScale: Scale = {
  1: "Extremely Stressed",
  2: "Stressed",
  3: "Neither Stressed nor Relaxed",
  4: "Relaxed",
  5: "Extremely Relaxed",
};
