import { Suspense } from "react";
import { leader, coordinators } from "@/data/members";
import MemberProfileView from "@/components/MemberProfileView";

export function generateStaticParams() {
  return [leader, ...coordinators].map((m) => ({ id: m.id }));
}

async function MemberContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemberProfileView id={id} />;
}

export default function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-sm text-white/50">
          Загрузка профиля...
        </div>
      }
    >
      <MemberContent params={params} />
    </Suspense>
  );
}
