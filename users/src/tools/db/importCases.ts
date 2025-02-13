import fs from "fs";
import csv from "csv-parser";
import { v4 as uuidv4 } from "uuid";
import { Case, Post } from "@/types";
import { sql } from "@/lib/db";

import dotenv from "dotenv";
dotenv.config({ path: ".env.development.local" });

const generateFakeAuthor = (): string => {
  const authors = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
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

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("data", (row) => {
        console.log(row);
        const mainPost: Post = {
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          author: generateFakeAuthor(),
          content: row.Seeker_Post,
          timestamp: generateTimestamp(baseDate, 0).toDateString(),
        };

        const answer1: Post = {
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          author: generateFakeAuthor(),
          content: row.Answer_1,
          timestamp: generateTimestamp(baseDate, 1).toDateString(),
        };

        const answer2: Post = {
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          author: generateFakeAuthor(),
          content: row.Answer_2,
          timestamp: generateTimestamp(baseDate, 2).toDateString(),
        };

        const newCase: Case = {
          id: uuidv4(),
          mainPost,
          replies: [answer1, answer2],
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

// Example usage
const filePath = "./src/tools/db/Seeker Posts + Answers - Sheet1.csv";
importCasesFromCSV(filePath)
  .then((cases) => {
    console.dir(cases, { depth: 4 });
  })
  .catch((error) => {
    console.error("Error importing cases:", error);
  });

const insertCases = async (cases: Case[]) => {
  for (const newCase of cases) {
    await sql`
      INSERT INTO case_t (id, main_post, replies)
      VALUES (${newCase.id}, ${JSON.stringify(newCase.mainPost)}::jsonb, ${JSON.stringify(newCase.replies)}::jsonb);
    `;
  }
};

const main = async () => {
  const cases = await importCasesFromCSV(filePath);
  await sql`DELETE FROM case_t WHERE id!='1';`;
  await insertCases(cases);
};

main();
