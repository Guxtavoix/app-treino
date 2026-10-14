import { NavInferior } from "@/components/NavInferior";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="mx-auto max-w-lg px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-32">
        {children}
      </main>
      <NavInferior />
    </>
  );
}
