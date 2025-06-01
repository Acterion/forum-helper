import Welcome from "@/views/Welcome";
import initDB from "./actions/initDB";
import { Suspense } from "react";
import Loading from "@/components/Loading"; // Assuming Loading component path

export default function Home() {
  initDB();
  return (
    <main className="container mx-auto p-6">
      <Suspense fallback={<Loading />}>
        <Welcome />
      </Suspense>
    </main>
  );
}
