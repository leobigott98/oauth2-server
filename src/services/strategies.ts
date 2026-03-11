import passport from "passport";
import { getClient } from "./clientService";
import bcrypt from "bcryptjs";
import { BasicStrategy } from "passport-http";

passport.use(
  new BasicStrategy(async (clientId, clientSecret, done) => {
    console.log("Authenticating client:", clientId);
    const client = await getClient(clientId);
    if (!client) {
      console.error("Invalid client credentials");
      return done(null, false);
    }
    const isPassword = await bcrypt.compare(clientSecret, client.client_secret);
    if (!isPassword) {
      console.error("Invalid client credentials");
      return done(null, false);
    }
    console.log("Client authenticated:", client);
    return done(null, client);
  }),
);

export default passport;
