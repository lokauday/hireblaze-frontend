"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Job, JobCreate, JobUpdate } from "@/lib/api/jobs"

const jobSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  title: z.string().min(1, "Job title is required"),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(["saved", "applied", "interviewing", "offer", "rejected", "withdrawn"]),
  notes: z.string().optional(),
  applied_at: z.string().optional().or(z.literal("")),
})

type JobFormData = z.infer<typeof jobSchema>

interface JobFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: JobCreate | JobUpdate) => Promise<void>
  initialData?: Job | null
  mode?: "create" | "edit"
}

export function JobForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      company: "",
      title: "",
      url: "",
      status: "saved",
      notes: "",
      applied_at: "",
    },
  })

  useEffect(() => {
    if (initialData && mode === "edit") {
      reset({
        company: initialData.company,
        title: initialData.title,
        url: initialData.url || "",
        status: initialData.status,
        notes: initialData.notes || "",
        applied_at: initialData.applied_at
          ? new Date(initialData.applied_at).toISOString().split("T")[0]
          : "",
      })
    } else {
      reset({
        company: "",
        title: "",
        url: "",
        status: "saved",
        notes: "",
        applied_at: "",
      })
    }
  }, [initialData, mode, reset, open])

  const status = watch("status")

  const onFormSubmit = async (data: JobFormData) => {
    try {
      await onSubmit({
        company: data.company,
        title: data.title,
        url: data.url || null,
        status: data.status,
        notes: data.notes || null,
        applied_at: data.applied_at ? new Date(data.applied_at).toISOString() : null,
      })
      onOpenChange(false)
      reset()
    } catch (error) {
      // Error handling is done in parent component
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Job" : "Edit Job"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Track your job applications and progress"
              : "Update job application details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                placeholder="e.g., Tech Corp"
                {...register("company")}
                className={errors.company ? "border-destructive" : ""}
              />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">
                Job Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineer"
                {...register("title")}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Job Posting URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://..."
              {...register("url")}
              className={errors.url ? "border-destructive" : ""}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value as Job["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saved">Saved</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applied_at">Date Applied</Label>
              <Input
                id="applied_at"
                type="date"
                {...register("applied_at")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this application..."
              rows={4}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Add Job" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
