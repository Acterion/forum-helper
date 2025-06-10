import fs from "fs";
import csv from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import { Case, Post } from "@/types";
import { db } from "@/db";
import { case_t } from "@/schema";
import { sql } from "drizzle-orm";
import { CaseType } from "@/schemas";

const generateFakeAuthor = (): string => {
  const authors = [
    "Alice",
    "Theresa",
    "Charlie",
    "Angela",
    "Eve",
    "Sophia",
    "Mia",
    "Olivia",
    "Emma",
    "Ava",
    "Isabella",
    "Lily",
    "Grace",
    "Chloe",
    "Zoe",
    "Ella",
    "Aria",
    "Scarlett",
    "Luna",
    "Harper",
    "Sofia",
    "Camila",
    "Layla",
    "Riley",
    "Aubrey",
    "Aaliyah",
    "Madison",
    "Ariana",
    "Brooklyn",
    "Nora",
    "Hannah",
    "Lily",
    "Jenny",
  ];
  return authors[Math.floor(Math.random() * authors.length)];
};

const generateTimestamp = (baseDate: Date, offsetDays: number): Date => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + offsetDays);
  return date;
};

const importCasesFromCSV = (filePath: string): Promise<Case[]> => {
  return new Promise((resolve, reject) => {
    const cases: Case[] = [];
    const baseDate = new Date();

    interface CsvRow {
      post_type: CaseType;
      ranking: string;
      post_title: string;
      post: string;
      answer_1: string;
      answer_2: string;
    }

    const mainAuthor = generateFakeAuthor();
    let author1 = generateFakeAuthor();
    if (author1 === mainAuthor) {
      // Ensure author1 is different from mainAuthor
      author1 = generateFakeAuthor();
    }
    let author2 = generateFakeAuthor();
    if (author2 === mainAuthor || author2 === author1) {
      // Ensure author2 is different from both mainAuthor and author1
      author2 = generateFakeAuthor();
    }

    fs.createReadStream(filePath)
      .pipe(csv({ separator: "," }))
      .on("data", (row: CsvRow) => {
        const mainPost: Post = {
          avatar: `https://avatar.iran.liara.run/public/girl?username=${generateFakeAuthor()}`,
          author: mainAuthor,
          content: row.post,
          timestamp: generateTimestamp(baseDate, 0).toDateString(),
        };

        const answer1: Post = {
          avatar: `https://avatar.iran.liara.run/public/girl?username=${generateFakeAuthor()}`,
          author: author1,
          content: row.answer_1,
          timestamp: generateTimestamp(baseDate, 1).toDateString(),
        };

        const answer2: Post | undefined = row.answer_2
          ? {
              avatar: `https://avatar.iran.liara.run/public/girl?username=${generateFakeAuthor()}`,
              author: author2,
              content: row.answer_2,
              timestamp: generateTimestamp(baseDate, 2).toDateString(),
            }
          : undefined;

        const newCase: Case = {
          id: uuidv4(),
          case_type: row.post_type,
          title: row.post_title,
          mainPost,
          replies: [answer1, answer2 ? answer2 : undefined].filter(Boolean) as Post[],
        };

        cases.push(newCase);
      })
      .on("end", () => {
        resolve(cases);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

const insertCases = async (cases: Case[]) => {
  for (const newCase of cases) {
    await db.insert(case_t).values({
      id: newCase.id,
      title: newCase.title,
      case_type: newCase.case_type,
      mainPost: newCase.mainPost,
      replies: newCase.replies,
    });
  }
};

export async function importAndInsertCases() {
  console.log("Importing cases from CSV...");
  const filePath = "./src/tools/db/Study 02 Seeker Posts + Answers - New.csv";
  const cases = await importCasesFromCSV(filePath);
  console.log(`Imported ${cases.length} cases from CSV.`);
  console.log("Inserting cases into the database...");
  await db.delete(case_t).where(sql`${case_t.id} IS NOT NULL`);
  console.log("Deleted existing cases from the database.");
  console.log("Inserting new cases into the database...");
  await insertCases(cases);
}

importAndInsertCases().catch((error) => {
  console.error("Error importing cases:", error);
  process.exit(1);
});
