"use client";

import { useForm } from "react-hook-form";
import { ProjectForm } from "@/lib/projectSchema";
import { uploadFile } from "@/lib/uploadFile";
import { createProject } from "@/lib/createProject";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function NewProject() {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<ProjectForm>();

  const onSubmit = async (v: ProjectForm) => {
    try {
      toast.info("Saving…");
      const [siteMapUrl, logoUrl, cocUrl] = await Promise.all([
        v.siteMap?.[0]
          ? uploadFile("site-maps", v.siteMap[0], v.projectNumber)
          : null,
        v.logo?.[0] ? uploadFile("logos", v.logo[0], v.projectNumber) : null,
        v.coc?.[0] ? uploadFile("coc", v.coc[0], v.projectNumber) : null,
      ]);

      await createProject({
        project_number: v.projectNumber,
        name: v.projectName,
        location: v.location,
        client_name: v.clientName,
        consultant: v.consultant,
        prepared_by: v.preparedBy,
        project_date:  v.projectDate || null,
        site_map_url: siteMapUrl,
        logo_url: logoUrl,
        coc_url: cocUrl,
      });

      toast.success("Project created");
      reset();
      router.push("/projects");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">New Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {[
          ["Project Name", "projectName"],
          ["Project ID", "projectNumber"],
          ["Site Address", "location"],
          ["Client", "clientName"],
          ["Consultant", "consultant"],
          ["Prepared By", "preparedBy"],
        ].map(([label, field]) => (
          <div key={field}>
            <label className="block font-medium">{label}</label>
            <input
              {...register(field as keyof ProjectForm)}
              className="input input-bordered w-full"
            />
          </div>
        ))}

        <div>
          <label className="block font-medium">Date</label>
          <input
            type="date"
            {...register("projectDate", { valueAsDate: true })}
            className="input input-bordered w-full"
          />
        </div>

        {[
          ["Site Map", "siteMap"],
          ["Logo", "logo"],
          ["Chain of Custody (CoC)", "coc"],
        ].map(([label, field]) => (
          <div key={field}>
            <label className="block font-medium">{label} (optional)</label>
            <input
              type="file"
              accept={field === "logo" ? "image/*,.svg" : "image/*,.pdf"}
              {...register(field as keyof ProjectForm)}
              className="file-input file-input-bordered w-full"
            />
          </div>
        ))}

        <button type="submit" className="btn btn-primary w-full">
          Save
        </button>
      </form>

      <ToastContainer />
    </div>
  );
}
