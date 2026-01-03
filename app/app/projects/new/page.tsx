import { requireUser } from "@/lib/session";
import { ProjectWizard } from "@/components/wizard/project-wizard";

export default async function NewProjectPage() {
  const user = await requireUser();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-text">
          Create Project
        </h1>
        <p className="mt-2 text-text/70">
          Follow the steps to set up your scope agreement project
        </p>
      </div>

      <ProjectWizard />
    </div>
  );
}
