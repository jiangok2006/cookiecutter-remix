
import { Form } from "@remix-run/react";

export async function action() {
  return new Response();
}

// export const loader: LoaderFunction = async () => {
//   return null;
// };

export default function Index() {
  return (
    <Form method="post">
      <p>
        <label>Email address <input type="email" name="email" /></label>
      </p>
      <p>
        <label>Message <textarea name="message"></textarea></label>
      </p>
      <p>
        <label>static-form-name <input name="static-form-name"></input></label>
      </p>
      <p>
        <button type="submit">send</button>
      </p>
    </Form>
  );
}
