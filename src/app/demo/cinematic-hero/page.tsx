import { CinematicHero } from "@/components/ui/cinematic-landing-hero";

export const metadata = {
  title: "Cinematic hero demo",
  robots: { index: false, follow: false },
};

export default function CinematicHeroDemoPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <CinematicHero />
    </div>
  );
}
