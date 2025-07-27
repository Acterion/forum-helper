import csvParser from "csv-parser";
import { db } from "../../db"; // Remote Neon database
import { localDb } from "../../db/local"; // Local SQLite database
import {
  case_response as remoteCaseResponse,
  submission as remoteSubmission,
  case_t as remoteCaseT,
  user as remoteUser,
  branch_counts as remoteBranchCounts,
} from "../../db/schema";
import {
  case_response as localCaseResponse,
  submission as localSubmission,
  case_t as localCaseT,
  user as localUser,
  branch_counts as localBranchCounts,
  prolific as localProlific,
} from "../../db/schema-sqlite";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runSqliteMigrations() {
  console.log("Running SQLite migrations...");

  try {
    // First generate migrations if needed
    console.log("Generating SQLite migrations...");
    await execAsync("npm run db:generate-sqlite");

    // Then run the migrations
    console.log("Applying SQLite migrations...");
    await execAsync("npm run db:migrate-sqlite");

    console.log("SQLite migrations completed successfully");
  } catch (error) {
    console.error("Error running SQLite migrations:", error);
    throw error;
  }
}

async function pullAndSyncData() {
  console.log("Pulling data from remote Neon database...");

  try {
    // Helper function to safely try to sync a table
    async function safeSync(
      tableName: string,
      remoteTable: any,
      localTable: any,
      transformFn?: (data: any[]) => any[]
    ) {
      try {
        console.log(`Syncing ${tableName}...`);
        const data = await db.select().from(remoteTable);
        if (data.length > 0) {
          await localDb.delete(localTable); // Clear existing data
          const processedData = transformFn ? transformFn(data) : data;
          await localDb.insert(localTable).values(processedData);
          console.log(`Synced ${data.length} ${tableName}`);
        } else {
          console.log(`No ${tableName} found in remote database`);
        }
        return data.length;
      } catch (error: any) {
        if (error.code === "42P01") {
          // Table doesn't exist
          console.log(`Table ${tableName} doesn't exist in remote database, skipping...`);
          return 0;
        }
        throw error;
      }
    }

    // Try to sync each table, handling missing tables gracefully
    const userCount = await safeSync("users", remoteUser, localUser);

    const caseCount = await safeSync("cases", remoteCaseT, localCaseT, (cases: any[]) =>
      cases.map((c: any) => ({
        ...c,
        mainPost: c.mainPost ? JSON.stringify(c.mainPost) : null,
        replies: c.replies ? JSON.stringify(c.replies) : null,
      }))
    );

    const submissionCount = await safeSync("submissions", remoteSubmission, localSubmission, (submissions: any[]) =>
      submissions.map((s: any) => ({
        ...s,
        preQs: s.preQs ? JSON.stringify(s.preQs) : null,
        postQs: s.postQs ? JSON.stringify(s.postQs) : null,
      }))
    );

    const caseResponseCount = await safeSync(
      "case responses",
      remoteCaseResponse,
      localCaseResponse,
      (caseResponses: any[]) =>
        caseResponses.map((cr: any) => ({
          ...cr,
          actionSequence: cr.actionSequence ? JSON.stringify(cr.actionSequence) : null,
        }))
    );

    const branchCountsCount = await safeSync(
      "branch counts",
      remoteBranchCounts,
      localBranchCounts,
      (branchCounts: any[]) =>
        branchCounts.map((bc: any) => ({
          ...bc,
          sequenceCount: Array.isArray(bc.sequenceCount)
            ? bc.sequenceCount.join(",")
            : bc.sequenceCount || "0,0,0,0,0,0,0,0,0,0",
        }))
    );

    console.log("Data sync completed successfully!");

    // Return summary of synced data
    return {
      users: userCount,
      cases: caseCount,
      submissions: submissionCount,
      caseResponses: caseResponseCount,
      branchCounts: branchCountsCount,
    };
  } catch (error) {
    console.error("Error syncing data:", error);
    throw error;
  }
}

function syncSummary(syncSummary: any) {
  console.log("\n=== REPLICATION SUMMARY ===");
  console.log("Remote to Local sync completed:");
  console.log(`- Users: ${syncSummary.users} synced`);
  console.log(`- Cases: ${syncSummary.cases} synced`);
  console.log(`- Submissions: ${syncSummary.submissions} synced`);
  console.log(`- Case Responses: ${syncSummary.caseResponses} synced`);
  console.log(`- Branch Counts: ${syncSummary.branchCounts} synced`);
  console.log("\nLocal SQLite database created at: forum_study_local.db");
  return;
}

type CsvRow = {
  submission_id: string;
  participant_id: string;
  status: string;
  custom_study_tncs_accepted_at: string;
  started_at: string;
  completed_at: string;
  reviewed_at: string;
  archived_at: string;
  time_taken: string;
  completion_code: string;
  total_approvals: string;
  gender: string;
  highest_education_level_completed: string;
  age: string;
  sex: string;
  ethnicity_simplified: string;
  country_of_birth: string;
  country_of_residence: string;
  nationality: string;
  language: string;
  student_status: string;
  employment_status: string;
};

async function addProlificData(prolificDataPath: string) {
  const insertProlificData = async (data: CsvRow[]) => {
    for (const row of data) {
      await localDb.insert(localProlific).values({
        submissionId: row.submission_id,
        participantId: row.participant_id,
        status: row.status,
        customStudyTncsAcceptedAt: row.custom_study_tncs_accepted_at,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        reviewedAt: row.reviewed_at,
        archivedAt: row.archived_at,
        timeTaken: row.time_taken,
        completionCode: row.completion_code,
        totalApprovals: row.total_approvals,
        gender: row.gender,
        highestEducationLevelCompleted: row.highest_education_level_completed,
        age: row.age,
        sex: row.sex,
        ethnicitySimplified: row.ethnicity_simplified,
        countryOfBirth: row.country_of_birth,
        countryOfResidence: row.country_of_residence,
        nationality: row.nationality,
        language: row.language,
        studentStatus: row.student_status,
        employmentStatus: row.employment_status,
      });
    }
  };

  const fs = require("fs");
  const prolificData: CsvRow[] = [];
  fs.createReadStream(prolificDataPath)
    .pipe(csvParser())
    .on("data", (row: CsvRow) => {
      prolificData.push(row);
    })
    .on("end", async () => {
      await insertProlificData(prolificData);
    });
}

// Main execution
async function main() {
  try {
    console.log("Starting database replication process...");

    // Step 1: Run SQLite migrations to ensure tables exist
    await runSqliteMigrations();

    // Step 2: Pull data from remote and sync to local
    const summary = await pullAndSyncData();

    // Strep 3: Add Prolific data from CSV
    const prolificDataPath = "./src/tools/db/data/prolific_export.csv";
    const fs = require("fs");
    if (fs.existsSync(prolificDataPath)) {
      await addProlificData(prolificDataPath);
    }

    syncSummary(summary);
  } catch (error) {
    console.error("Failed to replicate database:", error);
    process.exit(1);
  }
}

// Execute the main function
if (require.main === module) {
  main();
}
