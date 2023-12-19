
import type { SendEmailOptions } from 'remix-auth-email-link';
import type { User } from '../schema/user';

export const sendEmail = async (
    options: SendEmailOptions<User>,
    subject: string, body: string
) => {

}
