import { SvelteKitAuth } from '@auth/sveltekit';
import GoogleProvider from '@auth/core/providers/google';
import {
 GOOGLE_CLIENT_ID,
 GOOGLE_CLIENT_SECRET,
} from '$env/static/private';

console.log(`ClientId:${GOOGLE_CLIENT_ID}`);

export const handle = SvelteKitAuth({
 providers: [GoogleProvider({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET })]
});