
import type { SendEmailOptions } from 'remix-auth-email-link';
import type { User } from '../schema/user';

export const sendEmail = async (
    options: SendEmailOptions<User>,
    subject: string, body: string
) => {
    console.log(`email-provider, sendEmail: ${JSON.stringify(options)}, ${subject}, ${body}`);
    // https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels this sends an email of text.
    // https://support.mailchannels.com/hc/en-us/articles/4565898358413-Sending-Email-from-Cloudflare-Workers-using-MailChannels-Send-API this sends an email of html.
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
                email: 'no-reply@mycoolapp.site',
                name: 'mycoolapp',
            },
            subject: subject,
            content: [
                {
                    type: 'text/html',
                    value: "<html><body><p>Hi there!</p><a href=\"https://www.bing.com\">Click here</a></body></html>",
                },
            ],
        }),
    });

    console.log(`email-provider, sendEmail: ${response.status} ${await response.text()}`);
}
