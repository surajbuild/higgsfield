import z from "zod";

export const CreateUserSchema = z.object({
    username: z.string()
    .min(3, "username must be at least 3 characters")
    .max(20, "username must be at most 20 characters"),
    password: z.string()
    .min(4, "Password must be at least 4 characters")
})

export const CreateLoginSchema = z.object({
    username: z.string(),
    password: z.string(),
})

export const CreateAvatarSchema = z.object({
    name: z.string(),
    image: z.string(),
})

export const CreateVideoSchema = z.object({
    prompt: z.string().min(3, "prompt must be at least 3 characters"),
    imagePaths: z.array(z.string()).min(1, "at least one image path is required"),
})