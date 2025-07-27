import { case_response, submission, prolific } from "../../db/schema-sqlite";
import { localDb } from "../../db/local"; // Local SQLite database
import { eq } from "drizzle-orm";

export default async function exportData() {
  const data = await localDb
    .select({
      id: submission.id,
      status: prolific.status,
      time: prolific.timeTaken,
      education: prolific.highestEducationLevelCompleted,
      age: prolific.age,
      ethnicity: prolific.ethnicitySimplified,
      student: prolific.studentStatus,
      employment: prolific.employmentStatus,

      branch: submission.branch,
      sequence: submission.sequence,
      preQs: submission.preQs,
      postQs: submission.postQs,

      caseId: case_response.caseId,
      preConfidence: case_response.preConfidence,
      postConfidence: case_response.postConfidence,
      postStress: case_response.postStress,
      actionSequence: case_response.actionSequence,
    })
    .from(submission)
    .leftJoin(prolific, eq(submission.sessionId, prolific.submissionId))
    .leftJoin(case_response, eq(submission.id, case_response.submissionId))
    .where(eq(prolific.status, "APPROVED"));

  // Write data to CSV export.csv
  const fs = require("fs");
  const csvWriter = require("csv-writer").createObjectCsvWriter({
    path: "output.csv",
    header: [
      { id: "id", title: "ID" },
      { id: "time", title: "Time Taken" },
      { id: "education", title: "Education" },
      { id: "age", title: "Age" },
      { id: "ethnicity", title: "Ethnicity" },
      { id: "student", title: "Student Status" },
      { id: "employment", title: "Employment Status" },

      { id: "branch", title: "Branch" },
      { id: "sequence", title: "Sequence" },
      { id: "preQs", title: "Pre Questions" },
      { id: "postQs", title: "Post Questions" },

      { id: "caseId", title: "Case ID" },
      { id: "preConfidence", title: "Pre Confidence" },
      { id: "postConfidence", title: "Post Confidence" },
      { id: "postStress", title: "Post Stress" },
    ],
  });
  csvWriter
    .writeRecords(data)
    .then(() => {
      console.log("Data exported to output.csv successfully.");
    })
    .catch((error: any) => {
      console.error("Error writing CSV file:", error);
    });
  return data.length;
}

exportData()
  .then((count) => {
    console.log(`Export completed. ${count} records exported.`);
  })
  .catch((error: any) => {
    console.error("Error during export:", error);
  });

// Data Dictionary
/*
    ID: Unique identifier for the submission
    
    Time Taken: Total time taken by the participant to complete the study
    Education: Highest level of education completed by the participant
    Age: Age of the participant
    Ethnicity: Ethnicity of the participant
    Student Status: Indicates if the participant is a student
    Employment Status: Employment status of the participant

    Branch: Branch of the study - Branch-A had AI assistant enabled and Branch-B had AI disabled
    Sequence: number indicating the order of cases that were presented to the participant
    Pre Questions: Responses to pre-study questions
    Post Questions: Responses to post-study questions

    Case ID: Unique identifier for the case
    Pre Confidence: Confidence level before answering the case
    Post Confidence: Confidence level after answering the case
    Post Stress: Stress level after answering the case
    Action Sequence: Sequence of actions taken by the user during working on the case. Stores text edits and AI assistant suggestions as well as timestamps of actions.
    */
