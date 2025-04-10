"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client"
import { CREATE_POST } from "../graphql"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form"
import { Textarea } from "./ui/textarea"
import { useToast } from "./ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card, CardContent, CardFooter } from "./ui/card"
import { useAuth } from "../contexts/auth-context"

const formSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Post cannot be empty" })
    .max(280, { message: "Post cannot exceed 280 characters" }),
})

interface CreatePostFormProps {
  onPostCreated?: () => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const [createPost] = useMutation(CREATE_POST)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      return
    }

    setIsLoading(true)

    try {
      await createPost({
        variables: {
          content: values.content,
        },
      })

      form.reset()

      if (onPostCreated) {
        onPostCreated()
      }

      toast({
        title: "Post created",
        description: "Your post has been published",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Your post could not be published. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="What's happening?"
                          className="border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <div className="text-xs text-muted-foreground">{form.watch("content").length}/280</div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
