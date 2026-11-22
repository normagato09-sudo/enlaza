import { connection } from "next/server";
import { Suspense } from "react";
import { listActiveAds } from "@/lib/queries";
import { Explore } from "./Explore";

async function HomeContent({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  await connection();
  const [ads, params] = await Promise.all([listActiveAds(), searchParams]);
  return <Explore ads={ads} loginError={Boolean(params.login_error)} />;
}

export default function Home(props: PageProps<"/">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1240px] px-6 pt-14" aria-busy="true" />}>
      <HomeContent searchParams={props.searchParams} />
    </Suspense>
  );
}
