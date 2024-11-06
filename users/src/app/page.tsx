import Welcome from "@/views/Welcome";
import initDB from "./actions/initDB";

export default function Home() {
  initDB();
  return (
    <main className="container mx-auto p-6">
      <Welcome />
    </main>
  );
}
