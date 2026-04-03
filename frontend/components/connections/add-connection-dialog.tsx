"use client"

import { useState } from "react"
import { useCreateConnection } from "@/hooks/connections"
import { extractErrorMessage } from "@/lib/api-error"
import { parseConnectionString } from "@/lib/connection-string"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup } from "@/components/ui/field"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export function AddConnectionDialog() {
  const [open, setOpen] = useState(false)
  const { mutate: create, isPending } = useCreateConnection()
  const [connectionString, setConnectionString] = useState("")
  const [form, setForm] = useState({
    displayName: "",
    host: "",
    port: "5432",
    database: "",
    username: "",
    password: "",
    ssl: false,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    create(
      {
        ...form,
        port: parseInt(form.port, 10) || 5432,
      },
      {
        onSuccess: () => {
          toast.success("Connection created")
          setOpen(false)
          setConnectionString("")
          setForm({
            displayName: "",
            host: "",
            port: "5432",
            database: "",
            username: "",
            password: "",
            ssl: false,
          })
        },
        onError: (error) => {
          toast.error(extractErrorMessage(error))
        },
      }
    )
  }

  function updateField(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus size={14} />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Database Connection</DialogTitle>
            <DialogDescription>
              Paste a connection string to auto-fill, or enter details manually.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-3 gap-3">
            <Field>
              <Label htmlFor="connectionString">Connection String</Label>
              <div className="flex gap-2">
                <Input
                  id="connectionString"
                  placeholder="postgresql://user:pass@host:5432/mydb"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text").trim()
                    if (pasted) {
                      setTimeout(() => {
                        const parsed = parseConnectionString(pasted, form)
                        setForm((prev) => ({ ...prev, ...parsed }))
                        toast.success("Connection details auto-filled")
                      }, 0)
                    }
                  }}
                />
              </div>
            </Field>
            <Field>
              <Label htmlFor="displayName">Name</Label>
              <Input
                id="displayName"
                placeholder="Production DB"
                required
                value={form.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field className="col-span-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost"
                  required
                  value={form.host}
                  onChange={(e) => updateField("host", e.target.value)}
                />
              </Field>
              <Field>
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  placeholder="5432"
                  value={form.port}
                  onChange={(e) => updateField("port", e.target.value)}
                />
              </Field>
            </div>
            <Field>
              <Label htmlFor="database">Database</Label>
              <Input
                id="database"
                placeholder="mydb"
                required
                value={form.database}
                onChange={(e) => updateField("database", e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="postgres"
                required
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </Field>
            <Field orientation="horizontal">
              <Checkbox
                id="ssl"
                checked={form.ssl}
                onCheckedChange={(checked) =>
                  updateField("ssl", checked === true)
                }
              />
              <Label htmlFor="ssl">SSL</Label>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Connection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
