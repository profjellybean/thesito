package miscellaneous;

import org.eclipse.microprofile.graphql.Description;

@Description("Represents a session for a user containing access and refresh tokens.")
public class Session {

    @Description("The access token.")
    public String accessToken;

    @Description("The one-time refresh token.")
    public String refreshToken;

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public void setRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }

    @Override
    public String toString() {
        return "Session{" +
                "refreshToken='" + refreshToken + "'" +
                ", accessToken='" + accessToken + "'" +
                '}';
    }
}
