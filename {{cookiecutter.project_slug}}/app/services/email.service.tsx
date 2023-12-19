import { renderToString } from 'react-dom/server'
import type { SendEmailFunction } from 'remix-auth-email-link'
import type { User } from '~/schema/user'
import * as emailProvider from '~/services/email-provider.server'

export let sendEmail: SendEmailFunction<User> = async (options) => {
    let subject = "Here's your Magic sign-in link"
    let body = renderToString(
        <p>
            Hi {options.user?.email || 'there'},<br />
            <br />
            <a href={options.magicLink}>Click here to login on example.app</a>
        </p>
    )

    await emailProvider.sendEmail(options, subject, body)
}