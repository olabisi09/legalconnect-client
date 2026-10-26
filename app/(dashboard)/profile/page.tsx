import { generateMeta } from "@/lib/utils";
import { ProfileForm } from "./profile-form";

export const metadata = generateMeta({
  title: "Profile",
  description: "Your client portal profile and preferences.",
});

export default function ProfilePage() {
  return <ProfileForm />;
}
