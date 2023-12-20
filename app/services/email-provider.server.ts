
import type { SendEmailOptions } from 'remix-auth-email-link';
import type { User } from '../schema/user';

export const sendEmail = async (
    options: SendEmailOptions<User>,
    subject: string, body: string
) => {
    console.log(`email-provider, sendEmail: ${JSON.stringify(options)}, ${subject}, ${body}`);
    // https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [
                {
                    to: [{ email: options.emailAddress, name: 'Test Recipient' }],
                },
            ],
            from: {
                email: 'support@mycoolapp.site',
                name: 'mycoolapp',
            },
            subject: subject,
            content: [
                {
                    type: 'text/plain',
                    value: body,
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`email-provider, sendEmail: ${response.status} ${await response.text()}`);
    }
}
