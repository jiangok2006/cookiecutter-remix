
export const enum AuthProvider {
    cj = 'cj',
    google = 'google',
    ebay = 'ebay',
}

type SendEmailOptions<User> = {
    emailAddress: string
    magicLink: string
    user?: User | null
    domainUrl: string
    form: FormData
}

export type SendEmailFunction<User> = {
    (options: SendEmailOptions<User>): Promise<void>
}
